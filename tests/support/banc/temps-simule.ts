import { nonImplemente } from '@non-implemente';
import type { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import type { Instant } from '@src/commun/domaine/temps/instant';

/**
 * Heure « vraie » unique du banc (conventions.md §11.11). Squelette E10 : réalisé par Benjamin (E12).
 * - `maintenant()` : instant courant du banc ;
 * - `positionner(instant)` : place le temps du banc sur cet instant (avant ou après) ;
 * - `avancer(ecart)` : avance le temps du banc de l'écart (≥ 0).
 */
export class TempsSimule {
  constructor(private readonly depart: Instant) {}

  maintenant(): Instant {
    return nonImplemente('TempsSimule.maintenant');
  }

  positionner(_instant: Instant): void {
    nonImplemente('TempsSimule.positionner');
  }

  avancer(_ecart: EcartTemps): void {
    nonImplemente('TempsSimule.avancer');
  }
}
