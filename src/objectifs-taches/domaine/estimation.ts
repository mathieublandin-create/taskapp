import { Duree } from '../../commun/domaine/duree';
import type { IdTache } from '../../commun/domaine/identifiants';
import { sousTachesDe, type VueMetier } from './vue-metier';

// RG-023, RG-029 (ST-US-002 §4.1, ST-US-024 §6.2).
export type EstimationEnVigueur = { readonly duree: Duree; readonly calculee: boolean };

/** Avec sous-tâches : somme des estimations des sous-tâches non abandonnées (calculée) ; sinon l'estimation initiale. */
export const estimationEnVigueur = (vue: VueMetier, id: IdTache): EstimationEnVigueur => {
  const sousTaches = sousTachesDe(vue, id);
  if (sousTaches.length === 0) {
    const tache = vue.taches.get(id);
    return { duree: tache?.estimationInitiale ?? Duree.zero(), calculee: false };
  }
  const total = sousTaches
    .filter((sousTache) => sousTache.cycleDeVie.etat !== 'ABANDONNEE')
    .reduce(
      (somme, sousTache) => Duree.additionner(somme, sousTache.estimationInitiale),
      Duree.zero(),
    );
  return { duree: total, calculee: true };
};
