import { nonImplemente } from '@non-implemente';
import type { Resultat } from '../../../commun/domaine/resultat';
import type {
  ErreurDepotLocal,
  EvenementJournal,
  RefElementMetier,
  ServiceEtatLocal,
} from '../../../synchronisation';

// ST-US-001 §4.2 : non exposée à l'interface au lot 1 (CA-11).
export class ConsulterHistorique {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(
    _element: RefElementMetier,
  ): Promise<Resultat<ReadonlyArray<EvenementJournal>, ErreurDepotLocal>> {
    return nonImplemente('ConsulterHistorique.executer');
  }
}
