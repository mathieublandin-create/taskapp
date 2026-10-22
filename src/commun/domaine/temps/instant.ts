import { nonImplemente } from '@non-implemente';
import type { Marque } from '../marque';
import type { Resultat } from '../resultat';
import type { EcartTemps } from './ecart-temps';

// conventions.md §7.1 : millisecondes UTC depuis l'époque ; persisté en ISO 8601 UTC à la milliseconde.
export type Instant = Marque<number, 'Instant'>;

export const Instant = {
  /** Lève ErreurProgrammation si la valeur n'est pas un entier fini. */
  depuisMillisecondes: (_ms: number): Instant => nonImplemente('Instant.depuisMillisecondes'),
  /** « 2026-10-21T08:00:00.000Z ». */
  enIso: (_i: Instant): string => nonImplemente('Instant.enIso'),
  depuisIso: (_texte: string): Resultat<Instant, { readonly type: 'InstantInvalide' }> =>
    nonImplemente('Instant.depuisIso'),
  decaler: (_i: Instant, _e: EcartTemps): Instant => nonImplemente('Instant.decaler'),
} as const;
