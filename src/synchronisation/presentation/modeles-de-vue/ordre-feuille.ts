import { nonImplemente } from '@non-implemente';
import type { Instant } from '../../../commun/domaine/temps/instant';

// Guide v0.2.14 §5.8 (f) (RL-LOT-001-S3) ; ST-US-017 §4.5 : ordre des listes de la feuille ECR-011.
// Modifications en attente : `instant` = physique du `derniereHlc` de l'élément (dernière écriture en attente).
// Informations à lire (incrément 2) : `instant` = physique du HLC de la valeur conservée.
export type LigneFeuilleOrdonnable = {
  readonly id: string;
  readonly intitule: string;
  readonly instant: Instant;
};

/** La plus récente d'abord ; à égalité, intitulé (Intl.Collator('fr', { sensitivity: 'base' })) ; puis id (ordinal). */
export const comparerLignesFeuille = (
  _a: LigneFeuilleOrdonnable,
  _b: LigneFeuilleOrdonnable,
): number => nonImplemente('comparerLignesFeuille');
