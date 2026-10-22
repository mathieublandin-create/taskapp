import { nonImplemente } from '@non-implemente';
import type { EtatLocal } from './etat-local';
import type { EtatMetier } from './etat-metier';

// ST-socle-ecriture.md §6.6.
export const projeterEtatMetier = (_etat: EtatLocal): EtatMetier =>
  nonImplemente('projeterEtatMetier');
