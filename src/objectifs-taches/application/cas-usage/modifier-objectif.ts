import { nonImplemente } from '@non-implemente';
import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { RefusMetier } from '../../domaine/refus';

// ST-US-001 §4.2.
export class RenommerObjectif {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(_entree: {
    readonly objectifId: IdObjectif;
    readonly intitule: string;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('RenommerObjectif.executer');
  }
}

export class ModifierDescriptionObjectif {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(_entree: {
    readonly objectifId: IdObjectif;
    readonly description?: string;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('ModifierDescriptionObjectif.executer');
  }
}

export class ModifierDelaiObjectif {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(_entree: {
    readonly objectifId: IdObjectif;
    readonly delai: DateCalendaire;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('ModifierDelaiObjectif.executer');
  }
}

export class RetirerDelaiObjectif {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(_entree: {
    readonly objectifId: IdObjectif;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('RetirerDelaiObjectif.executer');
  }
}
