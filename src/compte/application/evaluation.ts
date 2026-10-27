// conventions.md §8.6 : commandes avec confirmation, cas du contexte compte.
export type ConfirmationCompte =
  | { readonly code: 'CNF-DECONNEXION'; readonly n: number }
  | { readonly code: 'CNF-SUPPR-DONNEES' }
  | { readonly code: 'CNF-SUPPR-DONNEES-PERTE'; readonly n: number };

export type EvaluationCompte =
  | { readonly type: 'SANS_CONFIRMATION' }
  | { readonly type: 'CONFIRMATION_REQUISE'; readonly confirmation: ConfirmationCompte };

export type ErreurSansSession = { readonly type: 'SansSession' };
