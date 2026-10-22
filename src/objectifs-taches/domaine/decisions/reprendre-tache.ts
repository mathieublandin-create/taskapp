import { nonImplemente } from '@non-implemente';
import type { IdTache } from '../../../commun/domaine/identifiants';
import type { DecisionSurVue, EvaluationSurVue } from '../vue-metier';

// ST-US-025 §6.2 (RG-027) ; l'étape 4 (tâche parente terminée) attend Q-US-025-3.
export const evaluerReprise =
  (_c: { readonly tacheId: IdTache }): EvaluationSurVue =>
  () =>
    nonImplemente('evaluerReprise');

export const deciderReprise =
  (_c: { readonly tacheId: IdTache }): DecisionSurVue<void> =>
  () =>
    nonImplemente('deciderReprise');
