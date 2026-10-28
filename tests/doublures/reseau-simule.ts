import type { EtatReseau } from '@src/commun/application/ports/etat-reseau';
import type { Annulation } from '@src/commun/application/ports/planificateur';

/**
 * Doublure du port EtatReseau (conventions.md §11.10, ST-US-022 §12.3).
 * `couper()` et `retablir()` changent l'état et préviennent les abonnés, une seule fois par changement.
 */
export class ReseauSimule implements EtatReseau {
  private connecte = true;
  private readonly abonnes = new Set<(connecte: boolean) => void>();

  estConnecte(): boolean {
    return this.connecte;
  }

  surChangement(rappel: (connecte: boolean) => void): Annulation {
    this.abonnes.add(rappel);
    return () => {
      this.abonnes.delete(rappel);
    };
  }

  couper(): void {
    this.changer(false);
  }

  retablir(): void {
    this.changer(true);
  }

  private changer(connecte: boolean): void {
    if (this.connecte === connecte) return;
    this.connecte = connecte;
    this.abonnes.forEach((rappel) => {
      rappel(connecte);
    });
  }
}
