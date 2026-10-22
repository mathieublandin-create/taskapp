import { nonImplemente } from '@non-implemente';
import type { Duree } from '../../commun/domaine/duree';
import type { Resultat } from '../../commun/domaine/resultat';
import type { DateCalendaire } from '../../commun/domaine/temps/date-calendaire';
import type { Intitule } from './intitule';
import type { SaisieInvalide } from './refus';

// RG-003, RG-028, RG-029 ; cumul dans l'ordre intitulé, délai, estimation (ST-US-002 §6.1).
export type SaisieTache = {
  readonly intitule: string;
  readonly delai?: DateCalendaire;
  readonly estimationMinutes?: number;
};

export type SaisieTacheValide = {
  readonly intitule: Intitule;
  readonly delai: DateCalendaire;
  readonly estimation: Duree;
};

export const validerSaisieTache = (_s: SaisieTache): Resultat<SaisieTacheValide, SaisieInvalide> =>
  nonImplemente('validerSaisieTache');
