import { nonImplemente } from '@non-implemente';
import type { DateCalendaire } from '../../commun/domaine/temps/date-calendaire';
import type { EtatObjectif } from './etat-objectif';
import type { Objectif, Tache } from './vue-metier';

// RG-045, RG-053 : `jour` = jour de Paris.
export const estObjectifEnRetard = (
  _objectif: Objectif,
  _etat: EtatObjectif,
  _jour: DateCalendaire,
): boolean => nonImplemente('estObjectifEnRetard');

/** A_FAIRE et délai < jour. */
export const estTacheEnRetard = (_tache: Tache, _jour: DateCalendaire): boolean =>
  nonImplemente('estTacheEnRetard');
