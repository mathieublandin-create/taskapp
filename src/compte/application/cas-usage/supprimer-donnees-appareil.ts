import { nonImplemente } from '@non-implemente';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurSansSession, EvaluationCompte } from '../evaluation';
import type { DepotAvantSortie } from '../ports/depot-avant-sortie';
import type { FournisseurAuth } from '../ports/fournisseur-auth';
import type { ErreurEspace, GestionEspaces } from '../ports/gestion-espaces';
import type { MemoireSession } from '../ports/memoire-session';
import type { SessionCourante } from '../session-courante';

// ST-US-022 §6.6 (RG-055, DEC-015, CA-10).
export type IssueSuppression =
  | { readonly type: 'SUPPRIMEES' }
  | {
      readonly type: 'CONFIRMATION_REQUISE';
      readonly confirmation: { readonly code: 'CNF-SUPPR-DONNEES-PERTE'; readonly n: number };
    };

export type DependancesSupprimerDonnees = {
  readonly depot: DepotAvantSortie;
  readonly fournisseur: FournisseurAuth;
  readonly memoireSession: MemoireSession;
  readonly espaces: GestionEspaces;
  readonly session: SessionCourante;
};

export class SupprimerDonneesAppareil {
  constructor(private readonly dependances: DependancesSupprimerDonnees) {}

  evaluer(): Promise<Resultat<EvaluationCompte, ErreurSansSession>> {
    return nonImplemente('SupprimerDonneesAppareil.evaluer');
  }

  confirmer(): Promise<Resultat<IssueSuppression, ErreurSansSession | ErreurEspace>> {
    return nonImplemente('SupprimerDonneesAppareil.confirmer');
  }

  confirmerPerte(): Promise<Resultat<IssueSuppression, ErreurSansSession | ErreurEspace>> {
    return nonImplemente('SupprimerDonneesAppareil.confirmerPerte');
  }
}
