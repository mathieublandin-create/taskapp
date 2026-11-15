import { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import { Instant } from '@src/commun/domaine/temps/instant';

/**
 * Heure « vraie » unique du banc (conventions.md §11.11).
 * - `maintenant()` : instant courant du banc ;
 * - `positionner(instant)` : place le temps du banc sur cet instant (avant ou après) ;
 * - `avancer(ecart)` : avance le temps du banc de l'écart (≥ 0).
 */
export class TempsSimule {
  private courant: Instant;

  constructor(depart: Instant) {
    this.courant = depart;
  }

  maintenant(): Instant {
    return this.courant;
  }

  positionner(instant: Instant): void {
    this.courant = instant;
  }

  avancer(ecart: EcartTemps): void {
    if (ecart < 0)
      throw new RangeError(`Le temps du banc n'avance pas d'un écart négatif : ${String(ecart)}`);
    this.courant = Instant.decaler(this.courant, EcartTemps.depuisMillisecondes(ecart));
  }
}
