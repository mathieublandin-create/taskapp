import { nonImplemente } from '@non-implemente';
import type { Horloge } from '../../../commun/application/ports/horloge';
import type { CoffreJetons } from '../ports/coffre-jetons';
import type { MemoireSession } from '../ports/memoire-session';
import type { SessionCourante } from '../session-courante';

// DAT §4.1.6 bis : un 401 reçu d'une API Google est qualifié (jeton échu ou retrait prouvé).
export type DependancesSignalerRefus = {
  readonly coffre: CoffreJetons;
  readonly horloge: Horloge;
  readonly memoireSession: MemoireSession;
  readonly session: SessionCourante;
};

export class SignalerRefusJeton {
  constructor(private readonly dependances: DependancesSignalerRefus) {}

  executer(): Promise<'A_RENOUVELER' | 'PERDU'> {
    return nonImplemente('SignalerRefusJeton.executer');
  }
}
