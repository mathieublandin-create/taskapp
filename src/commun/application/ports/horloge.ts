import type { EcartTemps } from '../../domaine/temps/ecart-temps';
import type { Fuseau } from '../../domaine/temps/fuseau';
import type { Instant } from '../../domaine/temps/instant';

// conventions.md §7.3, ADR-011.
export interface Horloge {
  /** Heure de l'appareil, non corrigée (la correction HLC relève de la synchronisation). */
  maintenant(): Instant;
  /** Temps écoulé depuis une origine arbitraire, insensible aux changements d'heure (DS-11). */
  monotone(): EcartTemps;
  /** Toujours FUSEAU_REFERENCE (DAT §6.4). */
  readonly fuseauReference: Fuseau;
  /** Usage exclusif : mention « heure de Paris » (RG-054). */
  fuseauAppareil(): Fuseau;
}
