import { nonImplemente } from '@non-implemente';
import type { GenerateurIdentifiants } from '../../../commun/application/ports/generateur-identifiants';
import type { IdObjectif, IdTache } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { RefusMetier } from '../../domaine/refus';

// ST-US-002 §4.2 : CREER_TACHE + CREATION.
export class CreerTache {
  constructor(
    private readonly service: ServiceEtatLocal,
    private readonly generateur: GenerateurIdentifiants,
  ) {}

  executer(_entree: {
    readonly intitule: string;
    readonly delai?: DateCalendaire;
    readonly estimationMinutes?: number;
    readonly objectifIds: ReadonlyArray<IdObjectif>;
  }): Promise<Resultat<IdTache, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('CreerTache.executer');
  }
}
