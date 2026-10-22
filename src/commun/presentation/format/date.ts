import { nonImplemente } from '@non-implemente';
import type { DateCalendaire } from '../../domaine/temps/date-calendaire';

// Guide §6.6.1 : « 19 oct. » ; année ajoutée si elle diffère de celle d'aujourd'hui.
export const formaterDate = (_d: DateCalendaire, _aujourdhui: DateCalendaire): string =>
  nonImplemente('formaterDate');
