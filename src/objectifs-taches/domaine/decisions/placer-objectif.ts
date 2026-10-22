import { nonImplemente } from '@non-implemente';
import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { DecisionSurVue } from '../vue-metier';

// ST-US-023 §6.2 (RG-022) ; parentId absent = objectif principal.
export const deciderPlacementObjectif =
  (_c: { readonly objectifId: IdObjectif; readonly parentId?: IdObjectif }): DecisionSurVue<void> =>
  () =>
    nonImplemente('deciderPlacementObjectif');
