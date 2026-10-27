import { nonImplemente } from '@non-implemente';

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
