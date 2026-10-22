import { nonImplemente } from '@non-implemente';
import type { Horloge } from '../../../commun/application/ports/horloge';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { ResumeTache } from './resumes';

// ST-US-002 §4.2 : tâches sans tâche parente, tous états.
export type TachesConsultees = {
  readonly taches: ReadonlyArray<ResumeTache>;
  readonly existeAuMoinsUnObjectif: boolean;
};

export class ConsulterTaches {
  constructor(
    private readonly service: ServiceEtatLocal,
    private readonly horloge: Horloge,
  ) {}

  executer(): Promise<Resultat<TachesConsultees, ErreurDepotLocal>> {
    return nonImplemente('ConsulterTaches.executer');
  }
}
