import { nonImplemente } from '@non-implemente';
import type { Horloge } from '../../../commun/application/ports/horloge';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { IdTache } from '../../../commun/domaine/identifiants';
import type { ActionTache } from '../../domaine/actions';
import type { RefusMetier } from '../../domaine/refus';
import type { ResumeTache } from './resumes';

// ST-US-002 §4.2 ; ST-US-024 §4.2 (sous-tâches, sous-tâches à faire).
export type DetailTache = {
  readonly tache: ResumeTache;
  readonly sousTaches: ReadonlyArray<ResumeTache>;
  readonly sousTachesAFaire: number;
  readonly actions: ReadonlyArray<ActionTache>;
};

export class ConsulterDetailTache {
  constructor(
    private readonly service: ServiceEtatLocal,
    private readonly horloge: Horloge,
  ) {}

  executer(_id: IdTache): Promise<Resultat<DetailTache, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('ConsulterDetailTache.executer');
  }
}
