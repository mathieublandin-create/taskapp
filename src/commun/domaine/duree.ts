import type { Marque } from './marque';
import { echec, succes, type Resultat } from './resultat';

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

const estMultipleDuPas = (minutes: number): boolean =>
  Number.isInteger(minutes) && minutes % PAS_DUREE_MINUTES === 0;

export const Duree = {
  /** Valeur saisie : refuse ≤ 0, non entier, non multiple de 30 (RG-028, RG-029). */
  saisie: (minutes: number): Resultat<Duree, DureeSaisieInvalide> =>
    minutes > 0 && estMultipleDuPas(minutes)
      ? succes(minutes as Duree)
      : echec({ type: 'DureeSaisieInvalide', minutes }),
  /** Total dérivé : accepte 0 ; refuse < 0, non entier, non multiple de 30 (PEP-9). */
  calculee: (minutes: number): Resultat<Duree, DureeCalculeeInvalide> =>
    minutes >= 0 && estMultipleDuPas(minutes)
      ? succes(minutes as Duree)
      : echec({ type: 'DureeCalculeeInvalide', minutes }),
  zero: (): Duree => 0 as Duree,
  additionner: (a: Duree, b: Duree): Duree => (a + b) as Duree,
} as const;
