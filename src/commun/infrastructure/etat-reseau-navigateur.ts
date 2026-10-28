import type { EtatReseau } from '../application/ports/etat-reseau';
import type { Annulation } from '../application/ports/planificateur';

// DAT §4.3 : navigator.onLine et événements online / offline.
export class EtatReseauNavigateur implements EtatReseau {
  estConnecte(): boolean {
    return navigator.onLine;
  }

  surChangement(rappel: (connecte: boolean) => void): Annulation {
    const surRetour = (): void => {
      rappel(true);
    };
    const surPerte = (): void => {
      rappel(false);
    };
    window.addEventListener('online', surRetour);
    window.addEventListener('offline', surPerte);
    return () => {
      window.removeEventListener('online', surRetour);
      window.removeEventListener('offline', surPerte);
    };
  }
}
