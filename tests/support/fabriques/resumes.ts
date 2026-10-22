/** Résumés de requêtes pour les tests des modèles de vue (données pures, valeurs par défaut valides). */
import type { IdObjectif, IdTache } from '@src/commun/domaine/identifiants';
import type { Instant } from '@src/commun/domaine/temps/instant';
import type {
  ResumeObjectif,
  ResumeTache,
} from '@src/objectifs-taches/application/requetes/resumes';
import { date, duree, instant, MINUTE } from '../valeurs';
import { aFaire } from './etat-metier';

const ORIGINE = instant('2026-10-01T08:00:00.000Z');

/** Instant de création au rang n (une minute d'écart entre deux rangs). */
export const creeAuRang = (n: number): Instant => (ORIGINE + n * MINUTE) as Instant;

export type ResumeObjectifTest = Partial<Omit<ResumeObjectif, 'delai'>> & {
  readonly id: IdObjectif;
  readonly delai?: string;
};

export const resumeObjectif = ({ delai, ...r }: ResumeObjectifTest): ResumeObjectif => ({
  intitule: `Objectif ${r.id}`,
  etat: 'EN_COURS',
  enRetard: false,
  tachesTerminees: 0,
  tachesNonAbandonnees: 0,
  creeLe: creeAuRang(0),
  enAttente: false,
  ...(delai === undefined ? {} : { delai: date(delai) }),
  ...r,
});

export type ResumeTacheTest = Partial<
  Omit<ResumeTache, 'delai' | 'estimation' | 'estimationInitiale'>
> & {
  readonly id: IdTache;
  readonly delai?: string;
  readonly estimationMinutes?: number;
};

export const resumeTache = ({ delai, estimationMinutes, ...r }: ResumeTacheTest): ResumeTache => ({
  intitule: `Tâche ${r.id}`,
  delai: date(delai ?? '2026-12-31'),
  estimation: duree(estimationMinutes ?? 60),
  estimationCalculee: false,
  estimationInitiale: duree(estimationMinutes ?? 60),
  cycleDeVie: aFaire(),
  objectifs: [],
  objectifsHerites: false,
  enRetard: false,
  alertes: [],
  creeLe: creeAuRang(0),
  enAttente: false,
  ...r,
});
