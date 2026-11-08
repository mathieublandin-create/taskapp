import type { IdAppareil } from '@src/commun/domaine/identifiants';
import { succes, type Resultat } from '@src/commun/domaine/resultat';
import type {
  DepotLocal,
  ErreurDepotLocal,
  IssueTransaction,
} from '@src/synchronisation/application/ports/depot-local';
import { comparerHlc } from '@src/synchronisation/domaine/hlc';
import { cleEnTexte } from '@src/synchronisation/domaine/information';
import { ETAT_LOCAL_VIDE, type EtatLocal } from '@src/synchronisation/domaine/etat-local';
import {
  CLES_META_APPAREIL,
  META_INITIALE,
  type MetaSynchronisation,
  type PlanSynchronisation,
} from '@src/synchronisation/domaine/meta-synchronisation';
import {
  cleInconnue,
  INCONNUS_VIDES,
  sontVides,
  type Inconnus,
} from '@src/synchronisation/domaine/inconnus';
import type { PlanEcriture } from '@src/synchronisation/domaine/planifier-ecritures';
import {
  SIGNALEMENTS_VIDES,
  type AjoutsSignalements,
  type Signalements,
} from '@src/synchronisation/domaine/signalements';

/**
 * Doublure en mémoire du port DepotLocal (ST-US-017 §12.3 ; condition de Starck sur Q-ST017-STA-1).
 * Elle passe la suite `tests/contrats/depot-local.contrat.ts` (CT-DEPOT-01 à 18). Plusieurs instances
 * partagent un même `StockageDepotEnMemoire` (deux onglets, ou un redémarrage). Chaque `appliquer` et chaque
 * `appliquerSynchronisation` est atomique : le calcul reçoit l'état (et la méta) du stockage, puis le plan et
 * la méta sont recopiés ensemble, ou rien si le calcul échoue ou lève. Les observateurs de toutes les
 * instances sont appelés après chaque plan non vide.
 * Comme DepotLocalDexie, seul le contenu du plan est écrit (registres, entrées de journal, entrées en attente
 * écrites ou retirées, dernier HLC et correction d'horloge de `etatApres`), avec les signalements et les éléments
 * inconnus ajoutés (ST-US-017 v0.11 §5.1 : tables `registresInconnus` et `evenementsInconnus` de Dexie).
 */
export class StockageDepotEnMemoire {
  etat: EtatLocal;
  meta: MetaSynchronisation = META_INITIALE;
  /** ST-US-017 v0.5 §4.6 : valeurs écartées et lectures (tables `valeursEcartees` et `lectures` de Dexie). */
  signalements: Signalements = SIGNALEMENTS_VIDES;
  /** ST-US-017 v0.11 §5.1 : éléments inconnus (tables `registresInconnus` et `evenementsInconnus` de Dexie), triés. */
  inconnus: Inconnus = INCONNUS_VIDES;
  readonly observateurs = new Set<() => void>();

  constructor(readonly appareilId: IdAppareil) {
    this.etat = ETAT_LOCAL_VIDE(appareilId);
  }

  /**
   * Écrit le plan, la méta et les signalements ensemble ; plan et signalements vides ne changent pas la version et
   * n'avertissent pas.
   */
  valider(
    plan: PlanEcriture,
    meta: Partial<MetaSynchronisation>,
    ajouts: AjoutsSignalements = AUCUN_AJOUT,
    inconnus: Inconnus = INCONNUS_VIDES,
  ): void {
    this.meta = { ...this.meta, ...meta };
    if (
      planEstVide(plan) &&
      !avanceDernierHlc(this.etat, plan) &&
      plan.etatApres.correctionHorloge === this.etat.correctionHorloge &&
      ajouts.valeursEcartees.length + ajouts.lectures.length === 0 &&
      sontVides(inconnus)
    ) {
      return;
    }
    this.etat = appliquerPlan(this.etat, plan);
    this.inconnus = ecrireInconnus(this.inconnus, inconnus);
    this.signalements = {
      valeursEcartees: remplacerParIdentifiant(
        this.signalements.valeursEcartees,
        ajouts.valeursEcartees,
      ),
      lectures: remplacerParIdentifiant(this.signalements.lectures, ajouts.lectures),
    };
    this.observateurs.forEach((rappel) => {
      rappel();
    });
  }

  /**
   * ST-US-017 v0.10 §4.7 (CT-DEPOT-14) : état, signalements et clés de synchronisation de la méta remplacés
   * ensemble ; `plan.etatApres` (vide) porte `appareilId`, `dernierHlc` et `correctionHorloge` ; version + 1.
   * v0.11 §5.1 (CT-DEPOT-17, 18) : la méta d'appareil (`CLES_META_APPAREIL`) est conservée, sauf valeur fournie par
   * `meta` ; les inconnus sont vidés, puis ceux du plan écrits.
   */
  reinitialiser(
    plan: PlanEcriture,
    meta: Partial<MetaSynchronisation>,
    ajouts: AjoutsSignalements = AUCUN_AJOUT,
    inconnus: Inconnus = INCONNUS_VIDES,
  ): void {
    const { dernierHlc } = plan.etatApres;
    this.meta = { ...META_INITIALE, ...metaAppareil(this.meta), ...meta };
    this.inconnus = ecrireInconnus(INCONNUS_VIDES, inconnus);
    this.etat = {
      appareilId: this.etat.appareilId,
      version: this.etat.version + 1,
      ...(dernierHlc === undefined ? {} : { dernierHlc }),
      correctionHorloge: plan.etatApres.correctionHorloge,
      registres: new Map(),
      journal: new Map(),
      enAttente: new Map(),
    };
    this.signalements = {
      valeursEcartees: remplacerParIdentifiant(
        SIGNALEMENTS_VIDES.valeursEcartees,
        ajouts.valeursEcartees,
      ),
      lectures: remplacerParIdentifiant(SIGNALEMENTS_VIDES.lectures, ajouts.lectures),
    };
    this.observateurs.forEach((rappel) => {
      rappel();
    });
  }
}

const AUCUN_AJOUT: AjoutsSignalements = { valeursEcartees: [], lectures: [] };

/** Clés de méta d'appareil présentes (comme les lignes que `reinitialiser` de Dexie ne retire pas). */
const metaAppareil = (meta: MetaSynchronisation): Partial<MetaSynchronisation> =>
  Object.fromEntries(
    CLES_META_APPAREIL.flatMap((cle) => (meta[cle] === undefined ? [] : [[cle, meta[cle]]])),
  );

/** Ordre des unités de code, comme les clés texte d'IndexedDB. */
const comparerTextes = (a: string, b: string): number => Number(a > b) - Number(a < b);

/** Ajout ou remplacement par clé et par identifiant (comme `bulkPut`), résultat trié comme `lireInconnus`. */
const ecrireInconnus = (connus: Inconnus, ajouts: Inconnus): Inconnus => {
  const registres = new Map(
    [...connus.registres, ...ajouts.registres].map((r) => [cleInconnue(r), r] as const),
  );
  const evenements = new Map(
    [...connus.evenements, ...ajouts.evenements].map((e) => [e.id, e] as const),
  );
  return {
    registres: [...registres].sort(([a], [b]) => comparerTextes(a, b)).map(([, r]) => r),
    evenements: [...evenements].sort(([a], [b]) => comparerTextes(a, b)).map(([, e]) => e),
  };
};

/** Ajout ou remplacement par identifiant (comme `bulkPut` sur une table de clé `id`). */
const remplacerParIdentifiant = <K, T extends { readonly id: K }>(
  connues: ReadonlyMap<K, T>,
  ajouts: ReadonlyArray<T>,
): ReadonlyMap<K, T> => new Map([...connues, ...ajouts.map((a) => [a.id, a] as const)]);

const planEstVide = (plan: PlanEcriture): boolean =>
  plan.registresEcrits.length === 0 &&
  plan.evenementsAjoutes.length === 0 &&
  plan.enAttenteEcrites.length === 0 &&
  plan.enAttenteRetirees.length === 0;

/** Comme DepotLocalDexie (ST-US-017 v0.10.1 §6.7 n° 9) : un plan qui avance `dernierHlc` n'est pas vide. */
const avanceDernierHlc = (avant: EtatLocal, plan: PlanEcriture): boolean => {
  const apres = plan.etatApres.dernierHlc;
  return (
    apres !== undefined &&
    (avant.dernierHlc === undefined || comparerHlc(apres, avant.dernierHlc) > 0)
  );
};

const appliquerPlan = (etat: EtatLocal, plan: PlanEcriture): EtatLocal => {
  const registres = new Map(etat.registres);
  plan.registresEcrits.forEach((r) => registres.set(cleEnTexte(r.cle), r));
  const journal = new Map(etat.journal);
  plan.evenementsAjoutes.forEach((e) => journal.set(e.id, e));
  const enAttente = new Map(etat.enAttente);
  plan.enAttenteEcrites.forEach((cle) => {
    const entree = plan.etatApres.enAttente.get(cle);
    if (entree !== undefined) enAttente.set(cle, entree);
  });
  plan.enAttenteRetirees.forEach((cle) => enAttente.delete(cle));
  const { dernierHlc } = plan.etatApres;
  return {
    appareilId: etat.appareilId,
    version: etat.version + 1,
    ...(dernierHlc === undefined ? {} : { dernierHlc }),
    correctionHorloge: plan.etatApres.correctionHorloge,
    registres,
    journal,
    enAttente,
  };
};

export class DepotLocalEnMemoire implements DepotLocal {
  constructor(private readonly stockage: StockageDepotEnMemoire) {}

  lire(): Promise<Resultat<EtatLocal, ErreurDepotLocal>> {
    return Promise.resolve(succes(this.stockage.etat));
  }

  appliquer<T, E extends { readonly type: string }>(
    calcul: (etat: EtatLocal) => Resultat<IssueTransaction<T>, E>,
  ): Promise<Resultat<T, E | ErreurDepotLocal>> {
    // Calcul synchrone dans une micro-tâche : atomique ; une exception rejette la promesse.
    return Promise.resolve().then(() => {
      const issue = calcul(this.stockage.etat);
      if (!issue.ok) return issue;
      this.stockage.valider(issue.valeur.plan, {});
      return succes(issue.valeur.valeur);
    });
  }

  observer(rappel: () => void): () => void {
    // Rappel enveloppé : deux abonnements du même rappel restent distincts.
    const abonnement = (): void => {
      rappel();
    };
    this.stockage.observateurs.add(abonnement);
    return () => {
      this.stockage.observateurs.delete(abonnement);
    };
  }

  lireMeta(): Promise<Resultat<MetaSynchronisation, ErreurDepotLocal>> {
    return Promise.resolve(succes(this.stockage.meta));
  }

  lireSignalements(): Promise<Resultat<Signalements, ErreurDepotLocal>> {
    return Promise.resolve(succes(this.stockage.signalements));
  }

  /** ST-US-017 v0.11 §4.8 : inconnus triés (CT-DEPOT-18). */
  lireInconnus(): Promise<Resultat<Inconnus, ErreurDepotLocal>> {
    return Promise.resolve(succes(this.stockage.inconnus));
  }

  appliquerSynchronisation(
    calcul: (
      etat: EtatLocal,
      meta: MetaSynchronisation,
      signalements: Signalements,
    ) => PlanSynchronisation,
  ): Promise<Resultat<undefined, ErreurDepotLocal>> {
    return Promise.resolve().then(() => {
      const { plan, meta, signalements, inconnus, reinitialiser } = calcul(
        this.stockage.etat,
        this.stockage.meta,
        this.stockage.signalements,
      );
      if (reinitialiser === true) this.stockage.reinitialiser(plan, meta, signalements, inconnus);
      else this.stockage.valider(plan, meta, signalements, inconnus);
      return succes(undefined);
    });
  }
}
