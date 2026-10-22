import { nonImplemente } from '@non-implemente';
import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { DecisionSurVue } from '../vue-metier';

// ST-US-001 §6.4 (RG-004, RG-050).
export const deciderRenommageObjectif =
  (_c: { readonly objectifId: IdObjectif; readonly intitule: string }): DecisionSurVue<void> =>
  () =>
    nonImplemente('deciderRenommageObjectif');

export const deciderModificationDescription =
  (_c: { readonly objectifId: IdObjectif; readonly description?: string }): DecisionSurVue<void> =>
  () =>
    nonImplemente('deciderModificationDescription');

export const deciderModificationDelaiObjectif =
  (_c: { readonly objectifId: IdObjectif; readonly delai: DateCalendaire }): DecisionSurVue<void> =>
  () =>
    nonImplemente('deciderModificationDelaiObjectif');

export const deciderRetraitDelaiObjectif =
  (_c: { readonly objectifId: IdObjectif }): DecisionSurVue<void> =>
  () =>
    nonImplemente('deciderRetraitDelaiObjectif');
