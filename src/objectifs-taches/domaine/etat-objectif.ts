import type { IdObjectif } from '../../commun/domaine/identifiants';
import {
  sousObjectifsDe,
  sousTachesDe,
  tachesDirectesDe,
  type Tache,
  type VueMetier,
} from './vue-metier';

// RG-025 (ST-US-001 §6.2) : dérivé, jamais stocké.
export type EtatObjectif = 'EN_COURS' | 'ATTEINT' | 'A_DECLINER';

const nonAbandonnee = (tache: Tache): boolean => tache.cycleDeVie.etat !== 'ABANDONNEE';

/** Tâches directes et leurs sous-tâches, hors abandonnées (US-003 CA-5, RG-049). */
const tachesAPrendreEnCompte = (vue: VueMetier, id: IdObjectif): ReadonlyArray<Tache> => {
  const directes = tachesDirectesDe(vue, id);
  return [...directes, ...directes.flatMap((t) => sousTachesDe(vue, t.id))].filter(nonAbandonnee);
};

const calculerEtat = (
  vue: VueMetier,
  id: IdObjectif,
  visites: ReadonlySet<IdObjectif>,
): EtatObjectif => {
  if (visites.has(id)) return 'EN_COURS'; // garde-fou : hiérarchie invalide transitoire avant réparation
  const taches = tachesAPrendreEnCompte(vue, id);
  const sousObjectifs = sousObjectifsDe(vue, id);
  if (taches.length === 0 && sousObjectifs.length === 0) return 'A_DECLINER';
  const visitesSuivantes = new Set(visites).add(id);
  const atteint =
    taches.every((t) => t.cycleDeVie.etat === 'TERMINEE') &&
    sousObjectifs.every((s) => calculerEtat(vue, s.id, visitesSuivantes) === 'ATTEINT');
  return atteint ? 'ATTEINT' : 'EN_COURS';
};

export const etatObjectif = (vue: VueMetier, id: IdObjectif): EtatObjectif =>
  calculerEtat(vue, id, new Set());

/** Tâches directes seulement (US-001 CA-3). */
export const compteurObjectif = (
  vue: VueMetier,
  id: IdObjectif,
): { readonly terminees: number; readonly nonAbandonnees: number } => {
  const directes = tachesDirectesDe(vue, id);
  return {
    terminees: directes.filter((t) => t.cycleDeVie.etat === 'TERMINEE').length,
    nonAbandonnees: directes.filter(nonAbandonnee).length,
  };
};
