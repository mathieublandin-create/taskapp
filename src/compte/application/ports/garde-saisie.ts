// DAT v0.11.3 §4.1.7 (Q-ST022-STA-1) : une saisie en cours n'est jamais perdue par un geste qui recharge la page.
// Implémenté par la couche de présentation (formulaire ouvert et modifié), injecté par la composition.
export interface GardeSaisie {
  saisieEnCours(): boolean;
}
