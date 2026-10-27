import { nonImplemente } from '@non-implemente';
import { EcartTemps } from '../commun/domaine/temps/ecart-temps';

// DAT §4.4.5, conventions.md §8.4.
export const DELAI_INITIAL_REPRISE = EcartTemps.depuisMillisecondes(1_000);
export const FACTEUR_REPRISE = 2;
export const PLAFOND_REPRISE = EcartTemps.depuisMillisecondes(5 * 60_000);
/** Connexion (ST-US-022 §6.8) et passage à SYN-ACTION (DAT §4.3). */
export const TENTATIVES_AVANT_ABANDON = 3;

/**
 * Délai avant la tentative n (n ≥ 1, la tentative 1 suit le premier échec) :
 * min(PLAFOND, DELAI_INITIAL × FACTEUR^(n−1)) × (0,5 + gigue / 2), gigue ∈ [0, 1[, arrondi à la milliseconde inférieure.
 */
export const delaiAvantTentative = (_n: number, _gigue: number): EcartTemps =>
  nonImplemente('delaiAvantTentative');
