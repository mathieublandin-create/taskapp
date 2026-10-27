import { nonImplemente } from '@non-implemente';
import type { EtatSynchronisationAffichable } from './etat-synchronisation-affichable';

// Guide §6.6.2, conventions.md §8.5 : une seule fonction de sélection (ordre de gravité).
export type CodeIndicateur =
  | 'SYN-ACTION'
  | 'SYN-SESSION'
  | 'SYN-RETENTATIVE'
  | 'SYN-HORS-LIGNE'
  | 'SYN-EN-COURS'
  | 'SYN-ATTENTE'
  | 'SYN-INFO'
  | 'SYN-OK';

export type MessageFeuille = 'ERR-010' | 'ERR-011' | 'ERR-012' | 'ERR-013' | 'ERR-015' | 'ERR-016';

export type ModeleVueIndicateur = {
  readonly code: CodeIndicateur;
  /** SYN-HORS-LIGNE et SYN-ATTENTE seulement. */
  readonly n?: number;
  /** Absent si 0 (data-a-lire). */
  readonly aLire?: number;
  readonly action?: 'REPRENDRE_LA_SYNCHRONISATION';
  readonly messageFeuille?: MessageFeuille;
};

export const selectionnerEtatIndicateur = (_e: EtatSynchronisationAffichable): CodeIndicateur =>
  nonImplemente('selectionnerEtatIndicateur');

export const construireIndicateur = (_e: EtatSynchronisationAffichable): ModeleVueIndicateur =>
  nonImplemente('construireIndicateur');
