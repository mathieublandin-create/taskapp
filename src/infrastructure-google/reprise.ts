import type { Planificateur } from '../commun/application/ports/planificateur';
import type { SourceAleatoire } from '../commun/application/ports/source-aleatoire';
import type { Resultat } from '../commun/domaine/resultat';
import { EcartTemps } from '../commun/domaine/temps/ecart-temps';
import type { ErreurGoogle } from './client-google';

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
export const delaiAvantTentative = (n: number, gigue: number): EcartTemps => {
  const base = Math.min(PLAFOND_REPRISE, DELAI_INITIAL_REPRISE * FACTEUR_REPRISE ** (n - 1));
  return EcartTemps.depuisMillisecondes(Math.floor(base * (0.5 + gigue / 2)));
};

/** Erreurs transitoires (DAT §4.4.5) : 429, 403 de débit, 5xx, réseau. */
export const estErreurTransitoire = (erreur: ErreurGoogle): boolean =>
  erreur.type === 'QuotaDepasse' ||
  erreur.type === 'ErreurServeurDistant' ||
  erreur.type === 'ReseauIndisponible';

/**
 * Rang 1 (Q-BEN-LOT001-5) : exécute `operation` au plus `tentatives` fois, en attendant
 * delaiAvantTentative(n, gigue) après le n-ième échec transitoire ; une erreur définitive est rendue aussitôt.
 */
export const executerAvecReprise = async <T>(
  operation: () => Promise<Resultat<T, ErreurGoogle>>,
  dependances: {
    readonly planificateur: Planificateur;
    readonly aleatoire: SourceAleatoire;
    readonly tentatives?: number;
  },
): Promise<Resultat<T, ErreurGoogle>> => {
  const tentatives = dependances.tentatives ?? TENTATIVES_AVANT_ABANDON;
  for (let n = 1; ; n += 1) {
    const resultat = await operation();
    if (resultat.ok || !estErreurTransitoire(resultat.erreur) || n >= tentatives) return resultat;
    const gigue = dependances.aleatoire.entierEntre(0, 999) / 1000;
    await dependances.planificateur.attendre(delaiAvantTentative(n, gigue));
  }
};
