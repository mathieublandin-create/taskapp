import { nonImplemente } from '@non-implemente';
import type { Annulation, Planificateur } from '../commun/application/ports/planificateur';

// ST-US-018 v0.4 §6.2 (rang 12, tranche B1) ; RG-057, DEC-025 : la décision reste `construireBandeau` (rang 1) ; le
// rang 12 n'ajoute que les déclencheurs du recalcul de la vue (à l'ouverture, au retour au premier plan, chaque minute).

/**
 * Arme `planificateur.periodiquement(PERIODE_EVALUATION_RAPPEL_HORS_LIGNE, rafraichir)` (60 s) et rend son annulation.
 * N'appelle pas `rafraichir` à l'armement (l'ouverture rafraîchit déjà la vue).
 */
export const armerReevaluationRappel = (
  planificateur: Planificateur,
  rafraichir: () => void,
): Annulation =>
  nonImplemente(`armerReevaluationRappel ${typeof planificateur} ${typeof rafraichir}`);
