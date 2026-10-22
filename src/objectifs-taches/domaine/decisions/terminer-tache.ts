import { nonImplemente } from '@non-implemente';
import type { IdTache } from '../../../commun/domaine/identifiants';
import type { DecisionSurVue } from '../vue-metier';

// ST-US-003 §6.1 (RG-026, RG-023).
export const deciderFinTache =
  (_c: { readonly tacheId: IdTache }): DecisionSurVue<void> =>
  () =>
    nonImplemente('deciderFinTache');
