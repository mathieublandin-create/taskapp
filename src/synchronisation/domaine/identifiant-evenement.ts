import { nonImplemente } from '@non-implemente';
import type { IdOperation } from '../../commun/domaine/identifiants';
import type { Marque } from '../../commun/domaine/marque';

// ST-socle-ecriture.md §6.7, DAT v0.10.2 §6.1 : `${operation}:${rang}`, rang décimal sans zéros de tête ; opaque.
export type IdEvenement = Marque<string, 'IdEvenement'>;

export const idEvenement = (_operation: IdOperation, _rang: number): IdEvenement =>
  nonImplemente('idEvenement');
