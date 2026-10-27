import { nonImplemente } from '@non-implemente';
import type { EtatReseau } from '../../../commun/application/ports/etat-reseau';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { Identite } from '../../domaine/identite';
import type { MotifEchecConnexion } from '../../domaine/motif-connexion';
import type { FournisseurAuth } from '../ports/fournisseur-auth';
import type { ErreurEspace, GestionEspaces } from '../ports/gestion-espaces';
import type { MemoireSession } from '../ports/memoire-session';
import type { PreparationStockage } from '../ports/preparation-stockage';
import type { SessionCourante } from '../session-courante';

// ST-US-022 §6.7 (CA-2 à CA-4 ; cas limites de connexion).
export type ErreurConnexion =
  | { readonly type: 'ConnexionImpossible'; readonly motif: MotifEchecConnexion }
  | ErreurEspace;

export type DependancesSeConnecter = {
  readonly reseau: EtatReseau;
  readonly fournisseur: FournisseurAuth;
  readonly preparation: PreparationStockage;
  readonly espaces: GestionEspaces;
  readonly memoireSession: MemoireSession;
  readonly session: SessionCourante;
};

export class SeConnecter {
  constructor(private readonly dependances: DependancesSeConnecter) {}

  executer(): Promise<Resultat<Identite, ErreurConnexion>> {
    return nonImplemente('SeConnecter.executer');
  }
}
