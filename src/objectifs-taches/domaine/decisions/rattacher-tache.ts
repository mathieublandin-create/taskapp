import { nonImplemente } from '@non-implemente';
import type { IdObjectif, IdTache } from '../../../commun/domaine/identifiants';
import type { DecisionSurVue } from '../vue-metier';

// ST-US-002 §6.2 (RG-001, H-1).
export const deciderRattachement =
  (_c: { readonly tacheId: IdTache; readonly objectifId: IdObjectif }): DecisionSurVue<void> =>
  () =>
    nonImplemente('deciderRattachement');

export const deciderDetachement =
  (_c: { readonly tacheId: IdTache; readonly objectifId: IdObjectif }): DecisionSurVue<void> =>
  () =>
    nonImplemente('deciderDetachement');
