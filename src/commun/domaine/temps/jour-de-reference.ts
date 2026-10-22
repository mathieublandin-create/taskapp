import { nonImplemente } from '@non-implemente';
import type { DateCalendaire } from './date-calendaire';
import type { Instant } from './instant';

// RG-053 : jour de Paris d'un instant (conventions.md §7.1, §7.2 ; PT-16).
export const jourDeReference = (_instant: Instant): DateCalendaire =>
  nonImplemente('jourDeReference');
