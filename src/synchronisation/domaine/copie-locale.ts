import type { Instant } from '../../commun/domaine/temps/instant';
import type { EtatLocal } from './etat-local';
import type { EtatMetier, TacheEnregistree } from './etat-metier';
import { projeterEtatMetier } from './projection';

// ST-US-017 v0.10 §6.7 n° 15 ; texte d'ERR-012 (guide §6.6.8 : « Cet appareil en garde une copie : … »).

export type CopieLocale = {
  readonly objectifs: number;
  readonly taches: number;
  /** Physique de `etat.dernierHlc` (dernière information écrite ou reçue) ; absente si l'état n'en a aucun. */
  readonly derniereMiseAJour?: Instant;
};

/** Une tâche existe si elle n'est pas supprimée et, pour une sous-tâche, si sa tâche parente existe aussi. */
const existe = (taches: EtatMetier['taches'], tache: TacheEnregistree): boolean =>
  !tache.supprime &&
  (tache.tacheParenteId === undefined || taches.get(tache.tacheParenteId)?.supprime === false);

/**
 * Résumé de la copie locale (n° 15) : nombre d'objectifs et de tâches (sous-tâches comprises) **existants** de
 * `projeterEtatMetier(etat)` : non supprimés, et, pour une sous-tâche, tâche parente non supprimée (RG-047 dérivée).
 */
export const resumerCopieLocale = (etat: EtatLocal): CopieLocale => {
  const { objectifs, taches } = projeterEtatMetier(etat);
  return {
    objectifs: [...objectifs.values()].filter((o) => !o.supprime).length,
    taches: [...taches.values()].filter((t) => existe(taches, t)).length,
    ...(etat.dernierHlc === undefined ? {} : { derniereMiseAJour: etat.dernierHlc.physique }),
  };
};
