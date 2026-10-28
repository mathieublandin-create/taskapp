import { nonImplemente } from '@non-implemente';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurSansSession, EvaluationCompte } from '../evaluation';
import type { AvisOnglets } from '../ports/avis-onglets';
import type { DepotAvantSortie } from '../ports/depot-avant-sortie';
import type { FournisseurAuth } from '../ports/fournisseur-auth';
import type { ErreurEspace, GestionEspaces } from '../ports/gestion-espaces';
import type { MemoireSession } from '../ports/memoire-session';
import type { SessionCourante } from '../session-courante';

// ST-US-022 §6.6 (RG-055, DEC-015, CA-10 ; DAT v0.11.4 §4.1.6, RL-LOT-001-A1).
export type IssueSuppression =
  | { readonly type: 'SUPPRIMEES' }
  | {
      readonly type: 'CONFIRMATION_REQUISE';
      readonly confirmation: { readonly code: 'CNF-SUPPR-DONNEES-PERTE'; readonly n: number };
    }
  /** ERR-017 : une autre fenêtre garde l'espace ouvert ; la suppression est en cours. */
  | { readonly type: 'SUPPRESSION_BLOQUEE' };

export type DependancesSupprimerDonnees = {
  readonly depot: DepotAvantSortie;
  readonly fournisseur: FournisseurAuth;
  readonly memoireSession: MemoireSession;
  readonly espaces: GestionEspaces;
  readonly avis: AvisOnglets;
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

  /** « Réessayer » d'ERR-017 : attend de nouveau la même suppression, sans redemander la confirmation. */
  reessayer(): Promise<Resultat<IssueSuppression, ErreurSansSession | ErreurEspace>> {
    return nonImplemente('SupprimerDonneesAppareil.reessayer');
  }

  /** « Fermer » d'ERR-017 : jeton oublié, session fermée ; la suppression aboutira à la fermeture de l'autre fenêtre. */
  fermerApresBlocage(): Promise<Resultat<undefined, ErreurSansSession>> {
    return nonImplemente('SupprimerDonneesAppareil.fermerApresBlocage');
  }
}
