import { nonImplemente } from '@non-implemente';
import type { Horloge } from '../../../commun/application/ports/horloge';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { ResumeObjectif } from './resumes';

// ST-US-001 §4.2 : tous les objectifs actifs, principaux et sous-objectifs.
export type ObjectifsConsultes = {
  readonly objectifs: ReadonlyArray<ResumeObjectif>;
  readonly existeAuMoinsUneTache: boolean;
};

export class ConsulterObjectifs {
  constructor(
    private readonly service: ServiceEtatLocal,
    private readonly horloge: Horloge,
  ) {}

  executer(): Promise<Resultat<ObjectifsConsultes, ErreurDepotLocal>> {
    return nonImplemente('ConsulterObjectifs.executer');
  }
}
