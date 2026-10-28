import type { Resultat } from '../../../commun/domaine/resultat';
import { EcartTemps } from '../../../commun/domaine/temps/ecart-temps';
import type { IdCompte } from '../../domaine/identite';

// DEC-016, conventions.md §9.3 : un espace de stockage local par compte.
export type ErreurEspace = { readonly type: 'EspaceInaccessible' };

/** Une autre fenêtre garde l'espace ouvert : la suppression attend sa fermeture (DAT v0.11.4 §4.1.6). */
export type ErreurSuppressionBloquee = { readonly type: 'SuppressionBloquee' };

/** Guide v0.2.15 (ERR-017) : attente maximale d'une suppression bloquée avant le message. */
export const DELAI_SUPPRESSION_BLOQUEE = EcartTemps.depuisMillisecondes(5_000);

export interface GestionEspaces {
  /** Crée l'espace s'il est absent ; ferme l'espace ouvert auparavant. */
  ouvrir(compte: IdCompte): Promise<Resultat<undefined, ErreurEspace>>;
  fermer(): Promise<void>;
  existeUnEspace(): Promise<boolean>;
  /**
   * Ferme l'espace s'il est ouvert, puis demande sa suppression (`deleteDatabase`). Si la demande est
   * bloquée plus de DELAI_SUPPRESSION_BLOQUEE : SuppressionBloquee ; la demande reste en cours (IndexedDB
   * ne permet pas de l'annuler) et aboutit dès que l'autre fenêtre ferme l'espace. Un nouvel appel pour le
   * même compte attend la même demande, de nouveau au plus DELAI_SUPPRESSION_BLOQUEE.
   */
  supprimer(
    compte: IdCompte,
  ): Promise<Resultat<undefined, ErreurEspace | ErreurSuppressionBloquee>>;
}
