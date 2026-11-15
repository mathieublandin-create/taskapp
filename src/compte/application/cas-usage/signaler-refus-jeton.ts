import type { Horloge } from '../../../commun/application/ports/horloge';
import { qualifierRefusJeton } from '../../domaine/acces';
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

  async executer(): Promise<'A_RENOUVELER' | 'PERDU'> {
    const { coffre, horloge, memoireSession, session } = this.dependances;
    const qualification = qualifierRefusJeton({
      echeance: coffre.lire()?.echeance,
      maintenant: horloge.monotone(),
    });
    coffre.vider();
    if (qualification === 'PERDU') {
      const memorisee = await memoireSession.lire();
      if (memorisee !== undefined && !memorisee.accesPerdu) {
        await memoireSession.ecrire({ identite: memorisee.identite, accesPerdu: true });
      }
    }
    if (session.etat().type === 'OUVERTE') session.changerAcces(qualification);
    return qualification;
  }
}
