import { nonImplemente } from '@non-implemente';
import type { Horloge } from '@src/commun/application/ports/horloge';
import type { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import type { Fuseau } from '@src/commun/domaine/temps/fuseau';
import { FUSEAU_REFERENCE } from '@src/commun/domaine/temps/fuseau-reference';
import type { Instant } from '@src/commun/domaine/temps/instant';
import type { TempsSimule } from '../support/banc/temps-simule';

/**
 * Doublure du port Horloge (conventions.md §7.3, §11.10). Squelette E10 : réalisée par Benjamin (E12).
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

  constructor(private readonly temps: TempsSimule) {}

  maintenant(): Instant {
    return nonImplemente('HorlogeSimulee.maintenant');
  }

  monotone(): EcartTemps {
    return nonImplemente('HorlogeSimulee.monotone');
  }

  fuseauAppareil(): Fuseau {
    return nonImplemente('HorlogeSimulee.fuseauAppareil');
  }

  positionner(_instant: Instant): void {
    nonImplemente('HorlogeSimulee.positionner');
  }

  avancer(_ecart: EcartTemps): void {
    nonImplemente('HorlogeSimulee.avancer');
  }

  dereglerDe(_ecart: EcartTemps): void {
    nonImplemente('HorlogeSimulee.dereglerDe');
  }

  changerHeureMurale(_ecart: EcartTemps): void {
    nonImplemente('HorlogeSimulee.changerHeureMurale');
  }

  redemarrer(): void {
    nonImplemente('HorlogeSimulee.redemarrer');
  }

  reglerFuseauAppareil(_fuseau: Fuseau): void {
    nonImplemente('HorlogeSimulee.reglerFuseauAppareil');
  }
}
