import type { Horloge } from '@src/commun/application/ports/horloge';
import { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import type { Fuseau } from '@src/commun/domaine/temps/fuseau';
import { FUSEAU_REFERENCE } from '@src/commun/domaine/temps/fuseau-reference';
import { Instant } from '@src/commun/domaine/temps/instant';
import type { TempsSimule } from '../support/banc/temps-simule';

/**
 * Doublure du port Horloge (conventions.md §7.3, §11.10).
 * - `maintenant()` = temps du banc + dérèglement propre + sauts de l'horloge murale ;
 * - `monotone()` : avance avec le temps du banc, insensible au dérèglement et aux sauts ; repart d'une
 *   nouvelle origine après `redemarrer()` ;
 * - `positionner(instant)` : positionne le temps du banc partagé (`TempsSimule.positionner`) ;
 * - `avancer(ecart)` : avance le temps du banc (horloge murale et monotone) ;
 * - `dereglerDe(ecart)` : avance (> 0) ou retard (< 0) propre à l'appareil, sans effet sur la monotone ;
 * - `changerHeureMurale(ecart)` : saut de l'horloge murale seule (DAT §6.4 point 3) ;
 * - `reglerFuseauAppareil(fuseau)` : valeur rendue par `fuseauAppareil()` (par défaut Europe/Paris).
 */
export class HorlogeSimulee implements Horloge {
  readonly fuseauReference: Fuseau = FUSEAU_REFERENCE;
  private decalageMural = 0;
  private origineMonotone: Instant;
  private fuseau: Fuseau = FUSEAU_REFERENCE;

  constructor(private readonly temps: TempsSimule) {
    this.origineMonotone = temps.maintenant();
  }

  maintenant(): Instant {
    return Instant.decaler(
      this.temps.maintenant(),
      EcartTemps.depuisMillisecondes(this.decalageMural),
    );
  }

  monotone(): EcartTemps {
    return EcartTemps.depuisMillisecondes(this.temps.maintenant() - this.origineMonotone);
  }

  fuseauAppareil(): Fuseau {
    return this.fuseau;
  }

  positionner(instant: Instant): void {
    this.temps.positionner(instant);
  }

  avancer(ecart: EcartTemps): void {
    this.temps.avancer(ecart);
  }

  dereglerDe(ecart: EcartTemps): void {
    this.decalageMural += ecart;
  }

  changerHeureMurale(ecart: EcartTemps): void {
    this.decalageMural += ecart;
  }

  redemarrer(): void {
    this.origineMonotone = this.temps.maintenant();
  }

  reglerFuseauAppareil(fuseau: Fuseau): void {
    this.fuseau = fuseau;
  }
}
