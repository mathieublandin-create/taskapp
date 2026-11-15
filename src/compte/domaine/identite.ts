import type { Marque } from '../../commun/domaine/marque';
import { echec, succes, type Resultat } from '../../commun/domaine/resultat';

// DAT §4.1.4 ; conventions.md §9.2 : le compte est identifié par la claim `sub`, jamais par l'adresse.
export type IdCompte = Marque<string, 'IdCompte'>;
/** Adresse e-mail : `login_hint` et affichage seulement. */
export type AdresseGoogle = Marque<string, 'AdresseGoogle'>;
export type Identite = { readonly compte: IdCompte; readonly adresse: AdresseGoogle };

/** 1 à 255 caractères ASCII visibles. */
const SUB_VALIDE = /^[\x21-\x7e]{1,255}$/;
/** Non vide, sans blanc, un seul « @ » ni en tête ni en fin. */
const ADRESSE_VALIDE = /^[^\s@]+@[^\s@]+$/u;

export const IdCompte = {
  /** 1 à 255 caractères ASCII visibles (0x21 à 0x7E). */
  depuisSub: (sub: string): Resultat<IdCompte, { readonly type: 'SubInvalide' }> =>
    SUB_VALIDE.test(sub) ? succes(sub as IdCompte) : echec({ type: 'SubInvalide' }),
} as const;

export const AdresseGoogle = {
  /** Non vide, sans espace, un seul « @ », ni en tête ni en fin. */
  depuisTexte: (texte: string): Resultat<AdresseGoogle, { readonly type: 'AdresseInvalide' }> =>
    ADRESSE_VALIDE.test(texte)
      ? succes(texte as AdresseGoogle)
      : echec({ type: 'AdresseInvalide' }),
} as const;
