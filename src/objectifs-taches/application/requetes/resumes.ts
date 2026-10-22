import { nonImplemente } from '@non-implemente';
import type { Duree } from '../../../commun/domaine/duree';
import type { IdObjectif, IdTache } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { Instant } from '../../../commun/domaine/temps/instant';
import type { CycleDeVie } from '../../../synchronisation';
import type { AlerteDelaiObjectif, AlerteDelaiTache } from '../../domaine/alertes-delai';
import type { EtatObjectif } from '../../domaine/etat-objectif';
import type { Incoherence } from '../../domaine/incoherence';
import type { Objectif, Tache, VueMetier } from '../../domaine/vue-metier';

// ST-US-001 §4.2 ; ajouts ST-US-023 §4.2, ST-US-002 §4.2, ST-US-024 §4.2.
export type ResumeObjectif = {
  readonly id: IdObjectif;
  readonly intitule: string;
  readonly description?: string;
  readonly delai?: DateCalendaire;
  readonly parentId?: IdObjectif;
  readonly parentIntitule?: string;
  readonly etat: EtatObjectif;
  readonly enRetard: boolean;
  readonly alerteDelai?: AlerteDelaiObjectif;
  readonly tachesTerminees: number;
  readonly tachesNonAbandonnees: number;
  readonly creeLe: Instant;
  readonly enAttente: boolean;
};

export type ResumeTache = {
  readonly id: IdTache;
  readonly intitule: string;
  readonly delai: DateCalendaire;
  readonly estimation: Duree;
  readonly estimationCalculee: boolean;
  readonly estimationInitiale: Duree;
  readonly cycleDeVie: CycleDeVie;
  readonly tacheParente?: { readonly id: IdTache; readonly intitule: string };
  /** Directs, ou ceux de la tâche parente ; ordre de rattachement. */
  readonly objectifs: ReadonlyArray<{ readonly id: IdObjectif; readonly intitule: string }>;
  readonly objectifsHerites: boolean;
  readonly enRetard: boolean;
  readonly alertes: ReadonlyArray<AlerteDelaiTache>;
  /** Présent si la tâche a au moins une sous-tâche. */
  readonly sousTaches?: { readonly terminees: number; readonly nonAbandonnees: number };
  readonly incoherence?: Incoherence; // rang 9
  readonly creeLe: Instant;
  readonly enAttente: boolean;
};

export const resumerObjectif = (
  _vue: VueMetier,
  _objectif: Objectif,
  _jour: DateCalendaire,
): ResumeObjectif => nonImplemente('resumerObjectif');

export const resumerTache = (_vue: VueMetier, _tache: Tache, _jour: DateCalendaire): ResumeTache =>
  nonImplemente('resumerTache');
