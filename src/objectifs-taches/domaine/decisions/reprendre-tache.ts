import { nonImplemente } from '@non-implemente';
import type { IdTache } from '../../../commun/domaine/identifiants';
import type { DecisionSurVue, EvaluationSurVue } from '../vue-metier';

// ST-US-025 §6.2 (RG-027 ; CA-13, DEC-032 pour une tâche parente terminée).
export const evaluerReprise =
  (_c: { readonly tacheId: IdTache }): EvaluationSurVue =>
  () =>
    nonImplemente('evaluerReprise');

export const deciderReprise =
  (_c: { readonly tacheId: IdTache }): DecisionSurVue<void> =>
  () =>
    nonImplemente('deciderReprise');
