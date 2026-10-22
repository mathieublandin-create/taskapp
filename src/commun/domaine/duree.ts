import { nonImplemente } from '@non-implemente';
import type { Marque } from './marque';
import type { Resultat } from './resultat';

// RG-028, DAT v0.6 §2.4 : minutes entières, multiple de 30, ≥ 0.
export type Duree = Marque<number, 'Duree'>;
export type DureeSaisieInvalide = {
  readonly type: 'DureeSaisieInvalide';
  readonly minutes: number;
};
export type DureeCalculeeInvalide = {
  readonly type: 'DureeCalculeeInvalide';
  readonly minutes: number;
};

export const PAS_DUREE_MINUTES = 30; // RG-028

export const Duree = {
  /** Valeur saisie : refuse ≤ 0, non entier, non multiple de 30 (RG-028, RG-029). */
  saisie: (_minutes: number): Resultat<Duree, DureeSaisieInvalide> => nonImplemente('Duree.saisie'),
  /** Total dérivé : accepte 0 ; refuse < 0, non entier, non multiple de 30 (PEP-9). */
  calculee: (_minutes: number): Resultat<Duree, DureeCalculeeInvalide> =>
    nonImplemente('Duree.calculee'),
  zero: (): Duree => nonImplemente('Duree.zero'),
  additionner: (_a: Duree, _b: Duree): Duree => nonImplemente('Duree.additionner'),
} as const;
