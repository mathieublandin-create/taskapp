import type { Annulation } from './planificateur';

// conventions.md §2.3 ; DAT §4.3.
export interface EtatReseau {
  estConnecte(): boolean;
  surChangement(rappel: (connecte: boolean) => void): Annulation;
}
