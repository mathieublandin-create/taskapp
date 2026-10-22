import { nonImplemente } from '@non-implemente';
import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { DecisionSurVue, EvaluationSurVue } from '../vue-metier';

// ST-US-001 §6.4 (RG-046).
export const evaluerSuppressionObjectif =
  (_c: { readonly objectifId: IdObjectif }): EvaluationSurVue =>
  () =>
    nonImplemente('evaluerSuppressionObjectif');

export const deciderSuppressionObjectif =
  (_c: { readonly objectifId: IdObjectif }): DecisionSurVue<void> =>
  () =>
    nonImplemente('deciderSuppressionObjectif');
