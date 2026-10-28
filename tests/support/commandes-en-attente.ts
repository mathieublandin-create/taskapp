/**
 * Commandes avec confirmation (conventions.md §8.6, ST-socle-ecriture.md §12, ST-US-022 §12.3).
 * `executer()` peut renvoyer `Succes({ type: 'CONFIRMATION_REQUISE', suite })` : « l'utilisateur confirme » remplace
 * alors la commande en attente par `suite`.
 */
import type { Resultat } from '@src/commun/domaine/resultat';

export type CommandeEnAttente = {
  readonly description: string;
  /** Confirmation affichée (code `CNF-…` et nombre annoncé), vérifiée par les étapes « une confirmation … ». */
  readonly confirmation?: { readonly code: string; readonly n?: number };
  executer(): Promise<Resultat<unknown, unknown>>;
};

export type ConfirmationRequise = {
  readonly type: 'CONFIRMATION_REQUISE';
  readonly suite: CommandeEnAttente;
};

export const estConfirmationRequise = (valeur: unknown): valeur is ConfirmationRequise =>
  typeof valeur === 'object' &&
  valeur !== null &&
  (valeur as { type?: unknown }).type === 'CONFIRMATION_REQUISE';
