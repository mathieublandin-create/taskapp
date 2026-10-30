import { nonImplemente } from '@non-implemente';
import type { Instant } from '../../domaine/temps/instant';

// Guide §6.6.1 : `{heure}` « 10 h 32 » ; ancienneté du « dernier échange » (ST-US-017 v0.4 §3.1 n° 17 c, §4.5).
// Heure de Paris (DEC-012, RG-053). Sans date-fns : dependency-cruiser le réserve à `commun/domaine/temps/`.

/** « 10 h 32 », « 9 h 05 », « 0 h 30 » : heure de Paris, heures sans zéro initial, espaces insécables. */
export const formaterHeure = (_instant: Instant): string => nonImplemente('formaterHeure');

/**
 * Écart `maintenant - instant` : moins d'une minute (ou négatif) « à l’instant » ; moins d'une heure « il y a {n} min » ;
 * moins de 24 h « il y a {n} h » (n tronqué) ; au-delà, « hier à {heure} » si le jour de Paris de l'instant est la
 * veille de celui de `maintenant`, sinon « le {date} à {heure} » (`formaterDate`).
 */
export const formaterAnciennete = (_instant: Instant, _maintenant: Instant): string =>
  nonImplemente('formaterAnciennete');
