import { nonImplemente } from '@non-implemente';
import type { IdCompte } from '../../domaine/identite';

// conventions.md §9.3 : `donejuan-<env>-<SHA-256 hexadécimal du sub>` ; ni sub ni adresse dans un nom.
export type NomEnvironnement = 'dev' | 'recette' | 'production';

export const nomEspace = (_env: NomEnvironnement, _compte: IdCompte): Promise<string> =>
  nonImplemente('nomEspace');
