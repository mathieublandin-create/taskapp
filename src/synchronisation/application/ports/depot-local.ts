import type { Resultat } from '../../../commun/domaine/resultat';
import type { EtatLocal } from '../../domaine/etat-local';
import type { Inconnus } from '../../domaine/inconnus';
import type { MetaSynchronisation, PlanSynchronisation } from '../../domaine/meta-synchronisation';
import type { PlanEcriture } from '../../domaine/planifier-ecritures';
import type { Signalements } from '../../domaine/signalements';

// ST-socle-ecriture.md §4.3 ; contrat : tests/contrats/depot-local.contrat.ts.
export type ErreurDepotLocal =
  | { readonly type: 'EspaceLocalNonOuvert' }
  | { readonly type: 'EcritureLocaleImpossible' } // → ERR-014
  | { readonly type: 'DonneesLocalesIllisibles' } // ligne relue invalide (Zod)
  // ST-US-017 v0.11 §6.8 n° 9 (rang 11, RG-058) : saisie refusée en consultation seule par le décorateur
  // `ServiceEtatLocalConsultationSeule` (jamais rendue par un adaptateur du dépôt).
  | { readonly type: 'ConsultationSeule' };

export type IssueTransaction<T> = { readonly plan: PlanEcriture; readonly valeur: T };

export interface DepotLocal {
  lire(): Promise<Resultat<EtatLocal, ErreurDepotLocal>>;
  /** `calcul` est synchrone et pur ; il reçoit l'état à jour au début de la transaction. */
  appliquer<T, E extends { readonly type: string }>(
    calcul: (etat: EtatLocal) => Resultat<IssueTransaction<T>, E>,
  ): Promise<Resultat<T, E | ErreurDepotLocal>>;
  /** Rappel après chaque transaction validée ; renvoie la fonction de désabonnement. */
  observer(rappel: () => void): () => void;
  /** ST-US-017 §4.2 (ajout de l'incrément 1, annoncé par ST-socle-ecriture.md §5.1). */
  lireMeta(): Promise<Resultat<MetaSynchronisation, ErreurDepotLocal>>;
  /**
   * Même transaction stricte que `appliquer` ; `version` n'augmente, et les observateurs ne sont prévenus, que si le
   * plan ou les signalements du résultat sont non vides (ST-US-017 v0.5 §4.6 : `signalements`, incrément 2).
   * v0.11 (rang 11, CT-DEPOT-16 à 18) : sont aussi non vides un plan dont `etatApres.correctionHorloge` diffère de la
   * correction courante, et un résultat dont `inconnus` est non vide ; `reinitialiser` conserve les clés de méta
   * d'appareil (`CLES_META_APPAREIL`) et vide les tables `registresInconnus` et `evenementsInconnus`.
   */
  appliquerSynchronisation(
    calcul: (
      etat: EtatLocal,
      meta: MetaSynchronisation,
      signalements: Signalements,
    ) => PlanSynchronisation,
  ): Promise<Resultat<undefined, ErreurDepotLocal>>;
  /** ST-US-017 v0.5 §4.6 (incrément 2) : valeurs écartées et lectures (tables `valeursEcartees`, `lectures`). */
  lireSignalements(): Promise<Resultat<Signalements, ErreurDepotLocal>>;
  /**
   * ST-US-017 v0.11 §4.8 (incrément 4, RG-058, ANT-19) : registres et entrées de journal inconnus conservés (tables
   * `registresInconnus`, `evenementsInconnus`, base version 4), triés comme `Inconnus`.
   */
  lireInconnus(): Promise<Resultat<Inconnus, ErreurDepotLocal>>;
}
