import { nonImplemente } from '@non-implemente';
import type { Horloge } from '../../../commun/application/ports/horloge';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { RefusMetier } from '../../domaine/refus';
import type { ResumeObjectif } from './resumes';

// ST-US-023 §4.2, §6.5.
export type SelecteurParent = {
  readonly objectif: ResumeObjectif;
  readonly candidats: ReadonlyArray<ResumeObjectif>;
  readonly nombreSousObjectifs: number;
};

export class ConsulterSelecteurParent {
  constructor(
    private readonly service: ServiceEtatLocal,
    private readonly horloge: Horloge,
  ) {}

  executer(_c: {
    readonly objectifId: IdObjectif;
  }): Promise<Resultat<SelecteurParent, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('ConsulterSelecteurParent.executer');
  }
}
