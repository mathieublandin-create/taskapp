import type { EcartTemps } from '../../domaine/temps/ecart-temps';
import type { Instant } from '../../domaine/temps/instant';

// ST-US-017 v0.11 §4.8 (rang 11) ; DAT §6.4 ; RL-LOT-001-A7 : la mesure de l'horloge se prend sur chaque réponse de
// Google, hors du port TransportSynchro. Port transverse : appelé par l'infrastructure Google (ClientGoogle, et le
// FauxDrive au banc), implémenté par la synchronisation (SuiviHorloge), câblé par la composition.

/** Un échange avec Google, vu de l'appareil. */
export type EchangeGoogle = {
  /** `Horloge.monotone()` juste avant l'envoi de la requête. */
  readonly envoiMonotone: EcartTemps;
  /** `Horloge.monotone()` à la réception de la réponse (statut et en-têtes). */
  readonly receptionMonotone: EcartTemps;
  /** `Horloge.maintenant()` (heure de l'appareil, non corrigée) juste avant l'envoi. */
  readonly envoiMurale: Instant;
  /** En-tête `Date` de la réponse, tel que reçu ; absent : aucune mesure. */
  readonly date: string | undefined;
};

export interface ObservateurEchangesGoogle {
  /**
   * Appelé une fois par réponse HTTP reçue de Google (réussie ou en erreur), jamais pour une requête sans réponse
   * (réseau, délai dépassé). Synchrone, ne lève jamais d'exception ; un traitement asynchrone est lancé sans être
   * attendu par l'appelant.
   */
  surReponse(echange: EchangeGoogle): void;
}
