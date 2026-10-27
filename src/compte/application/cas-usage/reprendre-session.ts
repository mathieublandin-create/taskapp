import { nonImplemente } from '@non-implemente';
import type { EtatReseau } from '../../../commun/application/ports/etat-reseau';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { FournisseurAuth } from '../ports/fournisseur-auth';
import type { GardeSaisie } from '../ports/garde-saisie';
import type { EtatReprise } from '../ports/memoire-redirection';
import type { MemoireSession } from '../ports/memoire-session';
import type { SessionCourante } from '../session-courante';
import type { ErreurSansSession } from '../evaluation';

// ST-US-022 §6.10 : geste « Reprendre la synchronisation » (A_RENOUVELER) ou « Se reconnecter » (PERDU).
export type IssueReprise =
  | { readonly type: 'ACCES_RENOUVELE' }
  | { readonly type: 'REDIRECTION_LANCEE' }
  /** Repli nécessaire mais saisie en cours : rien n'est lancé, l'état est inchangé. */
  | { readonly type: 'SAISIE_A_TERMINER' }
  | { readonly type: 'ACCES_PERDU' }
  | { readonly type: 'INCHANGE' };

export type DependancesReprendreSession = {
  readonly reseau: EtatReseau;
  readonly fournisseur: FournisseurAuth;
  readonly memoireSession: MemoireSession;
  readonly session: SessionCourante;
  readonly gardeSaisie: GardeSaisie;
};

export class ReprendreSession {
  constructor(private readonly dependances: DependancesReprendreSession) {}

  executer(
    _reprise: EtatReprise,
  ): Promise<Resultat<IssueReprise, ErreurSansSession | { readonly type: 'HorsLigne' }>> {
    return nonImplemente('ReprendreSession.executer');
  }
}
