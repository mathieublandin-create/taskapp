import type { Resultat } from '../../../commun/domaine/resultat';
import type { IdCompte } from '../../domaine/identite';

// DEC-016, conventions.md §9.3 : un espace de stockage local par compte.
export type ErreurEspace = { readonly type: 'EspaceInaccessible' };

export interface GestionEspaces {
  /** Crée l'espace s'il est absent ; ferme l'espace ouvert auparavant. */
  ouvrir(compte: IdCompte): Promise<Resultat<undefined, ErreurEspace>>;
  fermer(): Promise<void>;
  existeUnEspace(): Promise<boolean>;
  supprimer(compte: IdCompte): Promise<Resultat<undefined, ErreurEspace>>;
}
