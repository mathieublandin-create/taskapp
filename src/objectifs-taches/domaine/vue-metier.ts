import { nonImplemente } from '@non-implemente';
import type { Duree } from '../../commun/domaine/duree';
import type { IdObjectif, IdTache } from '../../commun/domaine/identifiants';
import type { Resultat } from '../../commun/domaine/resultat';
import type { DateCalendaire } from '../../commun/domaine/temps/date-calendaire';
import type { Instant } from '../../commun/domaine/temps/instant';
import type { ContexteDecision, CycleDeVie, Decision, EtatMetier } from '../../synchronisation';
import type { Evaluation } from './confirmation';
import type { RefusMetier } from './refus';

// Dérivations de lecture RG-046 et RG-047 (ST-US-001 §4.1, §6.1).
export type Objectif = {
  readonly id: IdObjectif;
  readonly intitule: string;
  readonly description?: string;
  readonly delai?: DateCalendaire;
  readonly parentId?: IdObjectif; // parent EFFECTIF
  readonly creeLe: Instant;
  readonly enAttente: boolean;
};

export type Tache = {
  readonly id: IdTache;
  readonly intitule: string;
  readonly delai: DateCalendaire;
  readonly estimationInitiale: Duree;
  readonly cycleDeVie: CycleDeVie;
  readonly tacheParenteId?: IdTache;
  readonly creeLe: Instant;
  readonly enAttente: boolean;
};

export type VueMetier = {
  readonly objectifs: ReadonlyMap<IdObjectif, Objectif>; // non supprimés
  readonly taches: ReadonlyMap<IdTache, Tache>; // non supprimées, ni elles ni leur tâche parente
  readonly sousObjectifsPar: ReadonlyMap<IdObjectif, ReadonlyArray<IdObjectif>>;
  readonly sousTachesPar: ReadonlyMap<IdTache, ReadonlyArray<IdTache>>;
  readonly tachesDirectesPar: ReadonlyMap<IdObjectif, ReadonlyArray<IdTache>>;
  readonly objectifsDirectsPar: ReadonlyMap<IdTache, ReadonlyArray<IdObjectif>>; // ordre de rattachement
  readonly intitulesConnus: ReadonlyMap<string, string>; // id → intitulé, supprimés compris
};

/** Décision pure liée à sa commande ; `avecVue` en fait une DecisionMetier du socle. */
export type DecisionSurVue<T> = (
  vue: VueMetier,
  contexte: ContexteDecision,
) => Resultat<Decision<T>, RefusMetier>;

/** Évaluation d'une commande avec confirmation (conventions.md §8.6) ; n'écrit rien. */
export type EvaluationSurVue = (vue: VueMetier) => Resultat<Evaluation, RefusMetier>;

export const construireVueMetier = (_etat: EtatMetier): VueMetier =>
  nonImplemente('construireVueMetier');

/** ElementIntrouvable si l'objectif est absent ou supprimé. */
export const objectifActif = (_vue: VueMetier, _id: IdObjectif): Resultat<Objectif, RefusMetier> =>
  nonImplemente('objectifActif');

export const sousObjectifsDe = (_vue: VueMetier, _id: IdObjectif): ReadonlyArray<Objectif> =>
  nonImplemente('sousObjectifsDe');

export const tachesDirectesDe = (_vue: VueMetier, _id: IdObjectif): ReadonlyArray<Tache> =>
  nonImplemente('tachesDirectesDe');

export const sousTachesDe = (_vue: VueMetier, _id: IdTache): ReadonlyArray<Tache> =>
  nonImplemente('sousTachesDe');
