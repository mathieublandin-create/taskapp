import { nonImplemente } from '@non-implemente';
import type { IdTache } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { DecisionSurVue } from '../vue-metier';

// ST-US-002 §6.2.
export const deciderRenommageTache =
  (_c: { readonly tacheId: IdTache; readonly intitule: string }): DecisionSurVue<void> =>
  () =>
    nonImplemente('deciderRenommageTache');

export const deciderModificationDelaiTache =
  (_c: { readonly tacheId: IdTache; readonly delai: DateCalendaire }): DecisionSurVue<void> =>
  () =>
    nonImplemente('deciderModificationDelaiTache');

export const deciderModificationEstimation =
  (_c: { readonly tacheId: IdTache; readonly estimationMinutes: number }): DecisionSurVue<void> =>
  () =>
    nonImplemente('deciderModificationEstimation');
