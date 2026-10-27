import { nonImplemente } from '@non-implemente';
import type { Marque } from '../../commun/domaine/marque';
import type { Resultat } from '../../commun/domaine/resultat';

// DAT §4.1.4 ; conventions.md §9.2 : le compte est identifié par la claim `sub`, jamais par l'adresse.
export type IdCompte = Marque<string, 'IdCompte'>;
/** Adresse e-mail : `login_hint` et affichage seulement. */
export type AdresseGoogle = Marque<string, 'AdresseGoogle'>;
export type Identite = { readonly compte: IdCompte; readonly adresse: AdresseGoogle };

export const IdCompte = {
  /** 1 à 255 caractères ASCII visibles (0x21 à 0x7E). */
  depuisSub: (_sub: string): Resultat<IdCompte, { readonly type: 'SubInvalide' }> =>
    nonImplemente('IdCompte.depuisSub'),
} as const;

export const AdresseGoogle = {
  /** Non vide, sans espace, un seul « @ », ni en tête ni en fin. */
  depuisTexte: (_texte: string): Resultat<AdresseGoogle, { readonly type: 'AdresseInvalide' }> =>
    nonImplemente('AdresseGoogle.depuisTexte'),
} as const;
