import { ErreurProgrammation } from './erreur-programmation';
import type { Marque } from './marque';

// DS-08 : UUID v7 ; chaque constructeur vérifie la forme UUID, sinon ErreurProgrammation.
export type IdObjectif = Marque<string, 'IdObjectif'>;
export type IdTache = Marque<string, 'IdTache'>;
export type IdAppareil = Marque<string, 'IdAppareil'>;
export type IdOperation = Marque<string, 'IdOperation'>;

const FORME_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const verifierUuid = (uuid: string, nature: string): string => {
  if (!FORME_UUID.test(uuid)) {
    throw new ErreurProgrammation(`Identifiant de ${nature} invalide (forme UUID attendue)`);
  }
  return uuid;
};

export const IdObjectif = {
  depuisUuid: (uuid: string): IdObjectif => verifierUuid(uuid, 'objectif') as IdObjectif,
} as const;
export const IdTache = {
  depuisUuid: (uuid: string): IdTache => verifierUuid(uuid, 'tâche') as IdTache,
} as const;
export const IdAppareil = {
  depuisUuid: (uuid: string): IdAppareil => verifierUuid(uuid, 'appareil') as IdAppareil,
} as const;
export const IdOperation = {
  depuisUuid: (uuid: string): IdOperation => verifierUuid(uuid, 'opération') as IdOperation,
} as const;
