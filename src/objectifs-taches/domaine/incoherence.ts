import { nonImplemente } from '@non-implemente';
import type { IdTache } from '../../commun/domaine/identifiants';
import type { VueMetier } from './vue-metier';

// RG-049 (ST-US-024 §6.6, rang 9) : dérivée, jamais écrite.
export type Incoherence = {
  readonly etatParent: 'TERMINEE' | 'ABANDONNEE';
  readonly sousTachesAFaire: ReadonlyArray<{ readonly id: IdTache; readonly intitule: string }>;
};

export const incoherenceDe = (_vue: VueMetier, _id: IdTache): Incoherence | undefined =>
  nonImplemente('incoherenceDe');
