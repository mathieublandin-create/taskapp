/**
 * Motifs des étapes à préfixe (conventions.md §11.7), sans dépendance à Cucumber pour rester testables en Vitest.
 * Chaque fonction enveloppe le motif d'une étape (expression régulière, sans ancres) de ses variantes de préfixe ;
 * les groupes capturants du préfixe précèdent ceux du motif.
 */
import { FRAGMENT_APPAREIL, FRAGMENT_ECART } from './conversions';

const sansAncres = (motif: RegExp): string => motif.source.replace(/^\^/, '').replace(/\$$/, '');

/** `<motif>`, `que <motif>`, `sur le {appareil}, <motif>`, `que sur le {appareil}, <motif>`. */
export const motifContexte = (motif: RegExp): RegExp =>
  new RegExp(`^(?:que )?(?:sur le (${FRAGMENT_APPAREIL}), )?${sansAncres(motif)}$`);

/** Variantes sans préfixe, avec appareil, « {ecart} plus tard, » et « au même instant exact, ». */
export const motifAction = (motif: RegExp): RegExp =>
  new RegExp(
    `^(?:(${FRAGMENT_ECART}) plus tard, |(au même instant exact), )?(?:sur le (${FRAGMENT_APPAREIL}), )?${sansAncres(motif)}$`,
  );

/** Variantes sans préfixe, avec appareil, « sur les deux appareils, » et « sur chacun des deux appareils, ». */
export const motifAssertion = (motif: RegExp): RegExp =>
  new RegExp(
    `^(?:sur le (${FRAGMENT_APPAREIL}), |(sur les deux appareils|sur chacun des deux appareils), )?${sansAncres(motif)}$`,
  );
