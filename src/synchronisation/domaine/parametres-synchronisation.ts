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
/** DAT v0.11.3 §6.4 (Q-ST017-STA-2) : l'écart retenu est la médiane des 5 dernières mesures. */
export const NOMBRE_MESURES_HORLOGE = 5;
/** DAT v0.11.3 §6.4 : une mesure ne compte que si son aller-retour dure strictement moins de 3 s. */
export const ALLER_RETOUR_MAX_MESURE_HORLOGE = EcartTemps.depuisMillisecondes(3_000);
/** DAT v0.11.3 §6.4 : saut de l'horloge murale détecté au-delà de 2 s d'écart avec l'horloge monotone. */
export const SEUIL_SAUT_HORLOGE = EcartTemps.depuisMillisecondes(2_000);
/** DAT v0.11.3 §6.4 : contrôle du saut chaque minute (et à chaque retour au premier plan). */
export const PERIODE_CONTROLE_SAUT_HORLOGE = EcartTemps.depuisMillisecondes(60_000);
