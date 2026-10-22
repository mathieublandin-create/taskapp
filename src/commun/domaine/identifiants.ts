import { nonImplemente } from '@non-implemente';
import type { Marque } from './marque';

// DS-08 : UUID v7 ; chaque constructeur vérifie la forme UUID, sinon ErreurProgrammation.
export type IdObjectif = Marque<string, 'IdObjectif'>;
export type IdTache = Marque<string, 'IdTache'>;
export type IdAppareil = Marque<string, 'IdAppareil'>;
export type IdOperation = Marque<string, 'IdOperation'>;

export const IdObjectif = {
  depuisUuid: (_uuid: string): IdObjectif => nonImplemente('IdObjectif.depuisUuid'),
} as const;
export const IdTache = {
  depuisUuid: (_uuid: string): IdTache => nonImplemente('IdTache.depuisUuid'),
} as const;
export const IdAppareil = {
  depuisUuid: (_uuid: string): IdAppareil => nonImplemente('IdAppareil.depuisUuid'),
} as const;
export const IdOperation = {
  depuisUuid: (_uuid: string): IdOperation => nonImplemente('IdOperation.depuisUuid'),
} as const;
