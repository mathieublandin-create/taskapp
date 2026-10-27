import type { Annulation } from '../../../commun/application/ports/planificateur';

// Vue de l'accès Google par la synchronisation (implémenté dans la composition à partir du contexte compte).
export type EtatAccesGoogle = 'SANS_SESSION' | 'VALIDE' | 'A_RENOUVELER' | 'PERDU';

export interface AccesGoogle {
  etat(): EtatAccesGoogle;
  /** À appeler sur un 401 ; renvoie l'état qualifié (DAT §4.1.6 bis). */
  signalerRefus(): Promise<EtatAccesGoogle>;
  observer(rappel: (etat: EtatAccesGoogle) => void): Annulation;
}
