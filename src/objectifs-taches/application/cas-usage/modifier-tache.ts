import { nonImplemente } from '@non-implemente';
import type { IdTache } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { RefusMetier } from '../../domaine/refus';

// ST-US-002 §4.2.
export class RenommerTache {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(_entree: {
    readonly tacheId: IdTache;
    readonly intitule: string;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('RenommerTache.executer');
  }
}

export class ModifierDelaiTache {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(_entree: {
    readonly tacheId: IdTache;
    readonly delai: DateCalendaire;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('ModifierDelaiTache.executer');
  }
}

export class ModifierEstimationTache {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(_entree: {
    readonly tacheId: IdTache;
    readonly estimationMinutes: number;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('ModifierEstimationTache.executer');
  }
}
