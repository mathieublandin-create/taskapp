import type { EcartTemps } from '../../domaine/temps/ecart-temps';

// conventions.md §2.3, §10.2 : seuls déclenchements différés ou périodiques admis.
export type Annulation = () => void;

export interface Planificateur {
  apres(delai: EcartTemps, action: () => void): Annulation;
  periodiquement(periode: EcartTemps, action: () => void): Annulation;
  attendre(delai: EcartTemps): Promise<void>;
}
