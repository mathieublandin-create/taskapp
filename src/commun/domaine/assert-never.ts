import { ErreurProgrammation } from './erreur-programmation';

// conventions.md §6.2 : fin de tout switch exhaustif.
export const assertNever = (valeur: never): never => {
  throw new ErreurProgrammation(`Cas non prévu : ${JSON.stringify(valeur)}`);
};
