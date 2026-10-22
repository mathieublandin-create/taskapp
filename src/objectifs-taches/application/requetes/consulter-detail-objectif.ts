import { nonImplemente } from '@non-implemente';
import type { Horloge } from '../../../commun/application/ports/horloge';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { IdObjectif, IdTache } from '../../../commun/domaine/identifiants';
import type { ActionObjectif } from '../../domaine/actions';
import type { RefusMetier } from '../../domaine/refus';
import type { ResumeObjectif, ResumeTache } from './resumes';

// ST-US-001 §4.2 ; ST-US-023 (actions) ; ST-US-002 (tâches directes, tous états).
export type DetailObjectif = {
  readonly objectif: ResumeObjectif;
  readonly sousObjectifs: ReadonlyArray<ResumeObjectif>;
  readonly taches: ReadonlyArray<ResumeTache>;
  /** Sous-tâches des tâches directes, par identifiant de tâche parente (ST-US-002 §6.6). */
  readonly sousTachesPar: ReadonlyMap<IdTache, ReadonlyArray<ResumeTache>>;
  readonly actions: ReadonlyArray<ActionObjectif>;
};

export class ConsulterDetailObjectif {
  constructor(
    private readonly service: ServiceEtatLocal,
    private readonly horloge: Horloge,
  ) {}

  executer(_id: IdObjectif): Promise<Resultat<DetailObjectif, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('ConsulterDetailObjectif.executer');
  }
}
