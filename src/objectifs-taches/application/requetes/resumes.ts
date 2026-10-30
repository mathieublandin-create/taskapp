import { nonImplemente } from '@non-implemente';
import type { Duree } from '../../../commun/domaine/duree';
import type { IdObjectif, IdTache } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { Instant } from '../../../commun/domaine/temps/instant';
import type { CycleDeVie } from '../../../synchronisation';
import {
  alerteDelaiObjectif,
  type AlerteDelaiObjectif,
  type AlerteDelaiTache,
} from '../../domaine/alertes-delai';
import { compteurObjectif, etatObjectif, type EtatObjectif } from '../../domaine/etat-objectif';
import type { Incoherence } from '../../domaine/incoherence';
import { estObjectifEnRetard } from '../../domaine/retard';
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
  vue: VueMetier,
  objectif: Objectif,
  jour: DateCalendaire,
): ResumeObjectif => {
  const etat = etatObjectif(vue, objectif.id);
  const { terminees, nonAbandonnees } = compteurObjectif(vue, objectif.id);
  const alerteDelai = alerteDelaiObjectif(vue, objectif.id);
  const parentIntitule =
    objectif.parentId === undefined ? undefined : vue.objectifs.get(objectif.parentId)?.intitule;
  return {
    id: objectif.id,
    intitule: objectif.intitule,
    ...(objectif.description === undefined ? {} : { description: objectif.description }),
    ...(objectif.delai === undefined ? {} : { delai: objectif.delai }),
    ...(objectif.parentId === undefined ? {} : { parentId: objectif.parentId }),
    ...(parentIntitule === undefined ? {} : { parentIntitule }),
    etat,
    enRetard: estObjectifEnRetard(objectif, etat, jour),
    ...(alerteDelai === undefined ? {} : { alerteDelai }),
    tachesTerminees: terminees,
    tachesNonAbandonnees: nonAbandonnees,
    creeLe: objectif.creeLe,
    enAttente: objectif.enAttente,
  };
};

export const resumerTache = (_vue: VueMetier, _tache: Tache, _jour: DateCalendaire): ResumeTache =>
  nonImplemente('resumerTache');
