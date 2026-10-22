import { nonImplemente } from '@non-implemente';
import type { IdObjectif, IdTache } from '../../../commun/domaine/identifiants';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { RefusMetier } from '../../domaine/refus';

// ST-US-002 §4.2 (RG-001).
export class RattacherTache {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(_entree: {
    readonly tacheId: IdTache;
    readonly objectifId: IdObjectif;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('RattacherTache.executer');
  }
}

export class DetacherTache {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(_entree: {
    readonly tacheId: IdTache;
    readonly objectifId: IdObjectif;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('DetacherTache.executer');
  }
}
