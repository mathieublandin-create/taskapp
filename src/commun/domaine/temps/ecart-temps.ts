import { ErreurProgrammation } from '../erreur-programmation';
import type { Marque } from '../marque';

// conventions.md §7.1 : durée technique signée, en millisecondes.
export type EcartTemps = Marque<number, 'EcartTemps'>;

// Constructeur livré complet en E10 (ST-US-022 §16, précisions E10) : il sert aux constantes nommées.
export const EcartTemps = {
  /** Lève ErreurProgrammation si la valeur n'est pas un entier fini. */
  depuisMillisecondes: (ms: number): EcartTemps => {
    if (!Number.isSafeInteger(ms)) {
      throw new ErreurProgrammation(`Écart de temps invalide : ${String(ms)}`);
    }
    return ms as EcartTemps;
  },
} as const;
