import type { Resultat } from '../../../commun/domaine/resultat';
import type { EtatLocal } from '../../domaine/etat-local';
import type { PlanEcriture } from '../../domaine/planifier-ecritures';

// ST-socle-ecriture.md §4.3 ; contrat : tests/contrats/depot-local.contrat.ts.
export type ErreurDepotLocal =
  | { readonly type: 'EspaceLocalNonOuvert' }
  | { readonly type: 'EcritureLocaleImpossible' } // → ERR-014
  | { readonly type: 'DonneesLocalesIllisibles' }; // ligne relue invalide (Zod)

export type IssueTransaction<T> = { readonly plan: PlanEcriture; readonly valeur: T };

export interface DepotLocal {
  lire(): Promise<Resultat<EtatLocal, ErreurDepotLocal>>;
  /** `calcul` est synchrone et pur ; il reçoit l'état à jour au début de la transaction. */
  appliquer<T, E extends { readonly type: string }>(
    calcul: (etat: EtatLocal) => Resultat<IssueTransaction<T>, E>,
  ): Promise<Resultat<T, E | ErreurDepotLocal>>;
  /** Rappel après chaque transaction validée ; renvoie la fonction de désabonnement. */
  observer(rappel: () => void): () => void;
}
