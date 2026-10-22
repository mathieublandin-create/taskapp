import { nonImplemente } from '@non-implemente';
import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { RefusMetier } from '../../domaine/refus';

// ST-US-023 §4.2.
export class PlacerObjectif {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(_entree: {
    readonly objectifId: IdObjectif;
    readonly parentId: IdObjectif;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('PlacerObjectif.executer');
  }
}

export class RendreObjectifPrincipal {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(_entree: {
    readonly objectifId: IdObjectif;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('RendreObjectifPrincipal.executer');
  }
}
