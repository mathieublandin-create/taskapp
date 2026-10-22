import { nonImplemente } from '@non-implemente';
import type { Duree } from '../../commun/domaine/duree';
import type { IdTache } from '../../commun/domaine/identifiants';
import type { VueMetier } from './vue-metier';

// RG-023, RG-029 (ST-US-002 §4.1, ST-US-024 §6.2).
export type EstimationEnVigueur = { readonly duree: Duree; readonly calculee: boolean };

export const estimationEnVigueur = (_vue: VueMetier, _id: IdTache): EstimationEnVigueur =>
  nonImplemente('estimationEnVigueur');
