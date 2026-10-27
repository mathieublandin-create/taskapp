import { nonImplemente } from '@non-implemente';
import type { CoffreJetons, JetonEnCoffre } from '../application/ports/coffre-jetons';

// DS-06, RED-05 : adaptateur réel, en mémoire ; seul détenteur du jeton d'accès (sert aussi de doublure).
export class CoffreJetonsMemoire implements CoffreJetons {
  placer(_jeton: JetonEnCoffre): void {
    nonImplemente('CoffreJetonsMemoire.placer');
  }

  lire(): JetonEnCoffre | undefined {
    return nonImplemente('CoffreJetonsMemoire.lire');
  }

  vider(): void {
    nonImplemente('CoffreJetonsMemoire.vider');
  }
}
