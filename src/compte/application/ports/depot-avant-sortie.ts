// US-022 CA-6, CA-10 ; Q-US-022-3, Q-US-022-4.
export type IssueDepotAvantSortie = 'DEPOSE' | 'ECHEC' | 'NON_TENTE';

export interface DepotAvantSortie {
  /** Décompte par élément (DAT §4.1.5 bis). */
  compterEnAttente(): Promise<number>;
  /** Tente un dépôt si réseau, accès valide et saisie non bloquée (RG-058) ; sinon NON_TENTE. */
  deposerSiPossible(): Promise<IssueDepotAvantSortie>;
}
