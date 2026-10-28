import type { Annulation, Planificateur } from '../application/ports/planificateur';
import type { EcartTemps } from '../domaine/temps/ecart-temps';

// conventions.md §10.2 : seul fichier autorisé à utiliser setTimeout et setInterval.
export class PlanificateurNavigateur implements Planificateur {
  apres(delai: EcartTemps, action: () => void): Annulation {
    const identifiant = setTimeout(action, delai);
    return () => {
      clearTimeout(identifiant);
    };
  }

  periodiquement(periode: EcartTemps, action: () => void): Annulation {
    const identifiant = setInterval(action, periode);
    return () => {
      clearInterval(identifiant);
    };
  }

  attendre(delai: EcartTemps): Promise<void> {
    return new Promise((resoudre) => {
      setTimeout(resoudre, delai);
    });
  }
}
