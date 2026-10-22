import { nonImplemente } from '@non-implemente';
import type { IdTache } from '../../../commun/domaine/identifiants';
import type { DecisionSurVue, EvaluationSurVue } from '../vue-metier';

// ST-US-002 §6.2 (RG-046) ; recopie de l'estimation : ST-US-024 §6.3 (H-3).
export const evaluerSuppressionTache =
  (_c: { readonly tacheId: IdTache }): EvaluationSurVue =>
  () =>
    nonImplemente('evaluerSuppressionTache');

export const deciderSuppressionTache =
  (_c: { readonly tacheId: IdTache }): DecisionSurVue<void> =>
  () =>
    nonImplemente('deciderSuppressionTache');
