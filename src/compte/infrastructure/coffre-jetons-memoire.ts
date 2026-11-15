import type { CoffreJetons, JetonEnCoffre } from '../application/ports/coffre-jetons';

// DS-06, RED-05 : adaptateur réel, en mémoire ; seul détenteur du jeton d'accès (sert aussi de doublure).
export class CoffreJetonsMemoire implements CoffreJetons {
  #jeton: JetonEnCoffre | undefined;

  placer(jeton: JetonEnCoffre): void {
    this.#jeton = jeton;
  }

  lire(): JetonEnCoffre | undefined {
    return this.#jeton;
  }

  vider(): void {
    this.#jeton = undefined;
  }
}
