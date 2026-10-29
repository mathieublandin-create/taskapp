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

const COLLATEUR = new Intl.Collator('fr', { sensitivity: 'base' });

const comparerDelais = (a: DateCalendaire | undefined, b: DateCalendaire | undefined): number => {
  if (a === b) return 0;
  if (a === undefined) return 1;
  if (b === undefined) return -1;
  return a < b ? -1 : 1;
};

const comparerOrdinal = (a: string, b: string): number => {
  if (a === b) return 0;
  return a < b ? -1 : 1;
};

export const comparerOrdreReference = (a: ElementOrdonnable, b: ElementOrdonnable): number =>
  comparerDelais(a.delai, b.delai) ||
  a.creeLe - b.creeLe ||
  COLLATEUR.compare(a.intitule, b.intitule) ||
  comparerOrdinal(a.id, b.id);
