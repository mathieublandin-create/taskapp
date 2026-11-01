import type { IdAppareil } from '@src/commun/domaine/identifiants';
import { succes, type Resultat } from '@src/commun/domaine/resultat';
import type {
  DepotLocal,
  ErreurDepotLocal,
  IssueTransaction,
} from '@src/synchronisation/application/ports/depot-local';
import { cleEnTexte } from '@src/synchronisation/domaine/information';
import { ETAT_LOCAL_VIDE, type EtatLocal } from '@src/synchronisation/domaine/etat-local';
import {
  META_INITIALE,
  type MetaSynchronisation,
  type PlanSynchronisation,
} from '@src/synchronisation/domaine/meta-synchronisation';
import type { PlanEcriture } from '@src/synchronisation/domaine/planifier-ecritures';
import {
  SIGNALEMENTS_VIDES,
  type AjoutsSignalements,
  type Signalements,
} from '@src/synchronisation/domaine/signalements';

/**
 * Doublure en mémoire du port DepotLocal (ST-US-017 §12.3 ; condition de Starck sur Q-ST017-STA-1).
 * Elle passe la suite `tests/contrats/depot-local.contrat.ts` (CT-DEPOT-01 à 14). Plusieurs instances
 * partagent un même `StockageDepotEnMemoire` (deux onglets, ou un redémarrage). Chaque `appliquer` et chaque
 * `appliquerSynchronisation` est atomique : le calcul reçoit l'état (et la méta) du stockage, puis le plan et
 * la méta sont recopiés ensemble, ou rien si le calcul échoue ou lève. Les observateurs de toutes les
 * instances sont appelés après chaque plan non vide.
 * Comme DepotLocalDexie, seul le contenu du plan est écrit (registres, entrées de journal, entrées en attente
 * écrites ou retirées, dernier HLC et correction d'horloge de `etatApres`).
 */
export class StockageDepotEnMemoire {
  etat: EtatLocal;
  meta: MetaSynchronisation = META_INITIALE;
  /** ST-US-017 v0.5 §4.6 : valeurs écartées et lectures (tables `valeursEcartees` et `lectures` de Dexie). */
  signalements: Signalements = SIGNALEMENTS_VIDES;
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
  ): void {
    this.meta = { ...this.meta, ...meta };
    if (planEstVide(plan) && ajouts.valeursEcartees.length + ajouts.lectures.length === 0) return;
    this.etat = appliquerPlan(this.etat, plan);
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
   */
  reinitialiser(
    plan: PlanEcriture,
    meta: Partial<MetaSynchronisation>,
    ajouts: AjoutsSignalements = AUCUN_AJOUT,
  ): void {
    const { dernierHlc } = plan.etatApres;
    this.meta = { ...META_INITIALE, ...meta };
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

  appliquerSynchronisation(
    calcul: (
      etat: EtatLocal,
      meta: MetaSynchronisation,
      signalements: Signalements,
    ) => PlanSynchronisation,
  ): Promise<Resultat<undefined, ErreurDepotLocal>> {
    return Promise.resolve().then(() => {
      const { plan, meta, signalements, reinitialiser } = calcul(
        this.stockage.etat,
        this.stockage.meta,
        this.stockage.signalements,
      );
      if (reinitialiser === true) this.stockage.reinitialiser(plan, meta, signalements);
      else this.stockage.valider(plan, meta, signalements);
      return succes(undefined);
    });
  }
}
