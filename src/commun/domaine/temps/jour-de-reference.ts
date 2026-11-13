import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';
import type { DateCalendaire } from './date-calendaire';
import { FUSEAU_REFERENCE } from './fuseau-reference';
import type { Instant } from './instant';

// RG-053 : jour de Paris d'un instant (conventions.md §7.1, §7.2 ; PT-16).
export const jourDeReference = (instant: Instant): DateCalendaire =>
  format(new TZDate(instant, FUSEAU_REFERENCE), 'yyyy-MM-dd') as DateCalendaire;
