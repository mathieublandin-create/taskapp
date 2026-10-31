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
import { SIGNALEMENTS_VIDES, type Signalements } from '@src/synchronisation/domaine/signalements';

/**
 * Doublure en mémoire du port DepotLocal (ST-US-017 §12.3 ; condition de Starck sur Q-ST017-STA-1).
 * Elle passe la suite `tests/contrats/depot-local.contrat.ts` (CT-DEPOT-01 à 11). Plusieurs instances
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
  readonly observateurs = new Set<() => void>();

  constructor(readonly appareilId: IdAppareil) {
    this.etat = ETAT_LOCAL_VIDE(appareilId);
  }

  /** Écrit le plan et la méta ensemble ; le plan vide ne change ni la version ni n'avertit. */
  valider(plan: PlanEcriture, meta: Partial<MetaSynchronisation>): void {
    this.meta = { ...this.meta, ...meta };
    if (planEstVide(plan)) return;
    this.etat = appliquerPlan(this.etat, plan);
    this.observateurs.forEach((rappel) => {
      rappel();
    });
  }
}

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

  /** Squelette inerte E10 du rang 9 (ST-US-017 v0.5 §13.4) : signalements à stocker (tranche B2, CT-DEPOT-12, 13). */
  lireSignalements(): Promise<Resultat<Signalements, ErreurDepotLocal>> {
    return Promise.resolve(succes(SIGNALEMENTS_VIDES));
  }

  appliquerSynchronisation(
    calcul: (
      etat: EtatLocal,
      meta: MetaSynchronisation,
      signalements: Signalements,
    ) => PlanSynchronisation,
  ): Promise<Resultat<undefined, ErreurDepotLocal>> {
    return Promise.resolve().then(() => {
      const { plan, meta } = calcul(this.stockage.etat, this.stockage.meta, SIGNALEMENTS_VIDES);
      this.stockage.valider(plan, meta);
      return succes(undefined);
    });
  }
}
