import { nonImplemente } from '@non-implemente';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurSansSession, EvaluationCompte } from '../evaluation';
import type { AvisOnglets } from '../ports/avis-onglets';
import type { DepotAvantSortie } from '../ports/depot-avant-sortie';
import type { FournisseurAuth } from '../ports/fournisseur-auth';
import type { GestionEspaces } from '../ports/gestion-espaces';
import type { MemoireSession } from '../ports/memoire-session';
import type { SessionCourante } from '../session-courante';

// ST-US-022 §6.5 (RG-043, CA-6 ; avis aux autres onglets : DAT v0.11.4 §4.1.6).
export type DependancesSeDeconnecter = {
  readonly depot: DepotAvantSortie;
  readonly fournisseur: FournisseurAuth;
  readonly memoireSession: MemoireSession;
  readonly espaces: GestionEspaces;
  readonly avis: AvisOnglets;
  readonly session: SessionCourante;
};

export class SeDeconnecter {
  constructor(private readonly dependances: DependancesSeDeconnecter) {}

  /** Tente d'abord un dépôt (écart documenté à conventions §8.6), puis compte. */
  evaluer(): Promise<Resultat<EvaluationCompte, ErreurSansSession>> {
    return nonImplemente('SeDeconnecter.evaluer');
  }

  executer(): Promise<Resultat<undefined, ErreurSansSession>> {
    return nonImplemente('SeDeconnecter.executer');
  }
}
