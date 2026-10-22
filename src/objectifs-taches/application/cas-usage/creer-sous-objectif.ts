import { nonImplemente } from '@non-implemente';
import type { GenerateurIdentifiants } from '../../../commun/application/ports/generateur-identifiants';
import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { RefusMetier } from '../../domaine/refus';

// ST-US-023 §4.2.
export class CreerSousObjectif {
  constructor(
    private readonly service: ServiceEtatLocal,
    private readonly generateur: GenerateurIdentifiants,
  ) {}

  executer(_entree: {
    readonly parentId: IdObjectif;
    readonly intitule: string;
    readonly description?: string;
    readonly delai?: DateCalendaire;
  }): Promise<Resultat<IdObjectif, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('CreerSousObjectif.executer');
  }
}
