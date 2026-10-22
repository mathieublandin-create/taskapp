/**
 * Phase rouge du TDD (conventions.md §11.1, ST-socle-ecriture.md §13).
 *
 * Les squelettes de `src/` appellent `nonImplemente(...)` : un test fourni par Anthony échoue alors
 * pour la raison « NI ». Benjamin remplace chaque appel par l'implémentation en E12 ; à la fin du
 * lot, plus aucun fichier de `src/` n'importe `@non-implemente` (contrôle de revue E13).
 */
export class ErreurNonImplementee extends Error {
  constructor(readonly element: string) {
    super(`Non implémenté : ${element}`);
    this.name = 'ErreurNonImplementee';
  }
}

export const nonImplemente = (element: string): never => {
  throw new ErreurNonImplementee(element);
};
