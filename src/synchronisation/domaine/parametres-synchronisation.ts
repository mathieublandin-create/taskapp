import { EcartTemps } from '../../commun/domaine/temps/ecart-temps';

// conventions.md §10.2 : constantes nommées du cycle et des rappels, toutes des EcartTemps.
/** DAT §4.3 */
export const TEMPORISATION_DEPOT = EcartTemps.depuisMillisecondes(5_000);
/** DAT §4.3 */
export const PERIODE_SYNCHRONISATION_PREMIER_PLAN = EcartTemps.depuisMillisecondes(2 * 60_000);
/** RG-057, DEC-025 : strictement plus de 24 h. */
export const SEUIL_RAPPEL_HORS_LIGNE = EcartTemps.depuisMillisecondes(24 * 60 * 60_000);
/** RG-057, DAT §4.1.5 bis */
export const PERIODE_EVALUATION_RAPPEL_HORS_LIGNE = EcartTemps.depuisMillisecondes(60_000);
/** US-017 CA-13 : avertissement si l'écart est strictement supérieur. */
export const SEUIL_HORLOGE_DEREGLEE = EcartTemps.depuisMillisecondes(24 * 60 * 60_000);
