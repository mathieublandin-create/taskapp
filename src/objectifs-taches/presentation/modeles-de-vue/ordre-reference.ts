import { nonImplemente } from '@non-implemente';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { Instant } from '../../../commun/domaine/temps/instant';

// Guide v0.2.9 §5.8 (ST-US-001 §6.6) : délai croissant, sans délai à la fin ; puis creeLe croissant ;
// puis intitulé (Intl.Collator('fr', { sensitivity: 'base' })) ; puis id (comparaison ordinale).
export type ElementOrdonnable = {
  readonly id: string;
  readonly intitule: string;
  readonly delai?: DateCalendaire;
  readonly creeLe: Instant;
};

export const comparerOrdreReference = (_a: ElementOrdonnable, _b: ElementOrdonnable): number =>
  nonImplemente('comparerOrdreReference');
