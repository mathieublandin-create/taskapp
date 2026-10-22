import { nonImplemente } from '@non-implemente';
import type { IdTache } from '../../../commun/domaine/identifiants';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { RefusMetier } from '../../domaine/refus';

// ST-US-003 §4.2.
export class TerminerTache {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(_entree: {
    readonly tacheId: IdTache;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('TerminerTache.executer');
  }
}
