import { DateCalendaire } from '../../commun/domaine/temps/date-calendaire';
import type { EtatObjectif } from './etat-objectif';
import type { Objectif, Tache } from './vue-metier';

// RG-045, RG-053 (ST-US-001 §6.3) : `jour` = jour de Paris.
export const estObjectifEnRetard = (
  objectif: Objectif,
  etat: EtatObjectif,
  jour: DateCalendaire,
): boolean =>
  objectif.delai !== undefined &&
  DateCalendaire.comparer(objectif.delai, jour) < 0 &&
  etat !== 'ATTEINT';

/** A_FAIRE et délai < jour. */
export const estTacheEnRetard = (tache: Tache, jour: DateCalendaire): boolean =>
  tache.cycleDeVie.etat === 'A_FAIRE' && DateCalendaire.comparer(tache.delai, jour) < 0;
