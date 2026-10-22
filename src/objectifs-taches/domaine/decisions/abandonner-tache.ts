import { nonImplemente } from '@non-implemente';
import type { IdTache } from '../../../commun/domaine/identifiants';
import type { DecisionSurVue, EvaluationSurVue } from '../vue-metier';

// ST-US-025 §6.1 (RG-027).
export const evaluerAbandon =
  (_c: { readonly tacheId: IdTache }): EvaluationSurVue =>
  () =>
    nonImplemente('evaluerAbandon');

export const deciderAbandon =
  (_c: { readonly tacheId: IdTache }): DecisionSurVue<void> =>
  () =>
    nonImplemente('deciderAbandon');
