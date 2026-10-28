import { nonImplemente } from '@non-implemente';
import { EcartTemps } from '../../commun/domaine/temps/ecart-temps';

// DAT §4.1.7, RED-08, DEC-026 (ST-US-022 §6.1).
export type EntreeOuverture = {
  readonly sessionMemorisee: boolean;
  readonly retour: 'AUCUN' | 'PRESENT';
  readonly departEnAttente: boolean;
  readonly reseau: 'CONNECTE' | 'COUPE';
};

export type DecisionOuverture =
  'ECRAN_CONNEXION' | 'TRAITER_RETOUR' | 'OUVRIR_SANS_JETON' | 'REDIRECTION_SILENCIEUSE';

export const deciderOuverture = (_entree: EntreeOuverture): DecisionOuverture =>
  nonImplemente('deciderOuverture');

/** Guide v0.2.15 §6.6.2 (RL-LOT-001-S6) : l'écran d'attente SYN-REDIRECTION dure au plus 10 s. */
export const DELAI_MAX_ATTENTE_REDIRECTION = EcartTemps.depuisMillisecondes(10_000);
