import { nonImplemente } from '@non-implemente';
import type { Marque } from '../../commun/domaine/marque';
import type { Resultat } from '../../commun/domaine/resultat';

// Q-US-001-3 : espaces de début et de fin retirés (String.prototype.trim), vide refusé, aucune longueur maximale.
export type Intitule = Marque<string, 'Intitule'>;
export type IntituleVide = { readonly type: 'IntituleVide' };

export const construireIntitule = (_brut: string): Resultat<Intitule, IntituleVide> =>
  nonImplemente('construireIntitule');
