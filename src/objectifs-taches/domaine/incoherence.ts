import type { IdTache } from '../../commun/domaine/identifiants';
import { sousTachesDe, type VueMetier } from './vue-metier';

// RG-049 (ST-US-024 §6.6) : dérivée, jamais écrite ni corrigée.
export type Incoherence = {
  readonly etatParent: 'TERMINEE' | 'ABANDONNEE';
  readonly sousTachesAFaire: ReadonlyArray<{ readonly id: IdTache; readonly intitule: string }>;
};

/** Tâche sans tâche parente, terminée ou abandonnée, qui a au moins une sous-tâche à faire. */
export const incoherenceDe = (vue: VueMetier, id: IdTache): Incoherence | undefined => {
  const tache = vue.taches.get(id);
  if (tache === undefined || tache.tacheParenteId !== undefined) return undefined;
  const etatParent = tache.cycleDeVie.etat;
  if (etatParent === 'A_FAIRE') return undefined;
  const sousTachesAFaire = sousTachesDe(vue, id)
    .filter((sousTache) => sousTache.cycleDeVie.etat === 'A_FAIRE')
    .map(({ id: sousTacheId, intitule }) => ({ id: sousTacheId, intitule }));
  return sousTachesAFaire.length === 0 ? undefined : { etatParent, sousTachesAFaire };
};
