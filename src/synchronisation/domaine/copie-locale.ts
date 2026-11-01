import { nonImplemente } from '@non-implemente';
import type { Instant } from '../../commun/domaine/temps/instant';
import type { EtatLocal } from './etat-local';

// ST-US-017 v0.10 §6.7 n° 15 ; texte d'ERR-012 (guide §6.6.8 : « Cet appareil en garde une copie : … »).

export type CopieLocale = {
  readonly objectifs: number;
  readonly taches: number;
  /** Physique de `etat.dernierHlc` (dernière information écrite ou reçue) ; absente si l'état n'en a aucun. */
  readonly derniereMiseAJour?: Instant;
};

/**
 * Résumé de la copie locale (n° 15) : nombre d'objectifs et de tâches (sous-tâches comprises) **existants** de
 * `projeterEtatMetier(etat)` : non supprimés, et, pour une sous-tâche, tâche parente non supprimée (RG-047 dérivée).
 */
export const resumerCopieLocale = (etat: EtatLocal): CopieLocale =>
  nonImplemente(`resumerCopieLocale (${String(etat.registres.size)})`);
