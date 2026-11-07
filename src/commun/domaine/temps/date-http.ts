import { nonImplemente } from '@non-implemente';
import type { Instant } from './instant';

// ST-US-017 v0.11 §6.8 n° 1 (rang 11) ; DAT §6.4 : en-tête HTTP `Date` des réponses de Google (RFC 9110 §5.6.7,
// forme IMF-fixdate seulement : « Wed, 21 Oct 2026 08:00:00 GMT »), précis à la seconde.

/**
 * Instant de l'en-tête `Date` (millisecondes = 0) ; undefined pour toute autre forme (forme obsolète RFC 850 ou
 * asctime, fuseau autre que `GMT`, jour de la semaine incohérent avec la date, date impossible, texte absent ou vide).
 * Fonction pure : aucune lecture de l'heure.
 */
export const lireDateHttp = (texte: string | undefined): Instant | undefined =>
  nonImplemente(`lireDateHttp (${String(texte)})`);
