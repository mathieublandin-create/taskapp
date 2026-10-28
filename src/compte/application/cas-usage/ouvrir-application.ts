import { nonImplemente } from '@non-implemente';
import type { EtatReseau } from '../../../commun/application/ports/etat-reseau';
import type { Horloge } from '../../../commun/application/ports/horloge';
import type { JournalTechnique } from '../../../commun/application/ports/journal-technique';
import type { EtatAcces } from '../../domaine/acces';
import type { FournisseurAuth, RetourGoogle } from '../ports/fournisseur-auth';
import type { GestionEspaces } from '../ports/gestion-espaces';
import type { EtatReprise, MemoireRedirection } from '../ports/memoire-redirection';
import type { MemoireSession } from '../ports/memoire-session';
import type { SessionCourante } from '../session-courante';

// ST-US-022 §6.2 (DAT §4.1.7, RED-08).
export type IssueOuverture =
  | { readonly type: 'ECRAN_CONNEXION' }
  | { readonly type: 'REDIRECTION_LANCEE' }
  | { readonly type: 'SESSION_OUVERTE'; readonly acces: EtatAcces; readonly reprise?: EtatReprise };

export type DependancesOuvrirApplication = {
  readonly memoireSession: MemoireSession;
  readonly memoireRedirection: MemoireRedirection;
  readonly fournisseur: FournisseurAuth;
  readonly espaces: GestionEspaces;
  readonly reseau: EtatReseau;
  readonly horloge: Horloge;
  readonly journal: JournalTechnique;
  readonly session: SessionCourante;
};

export class OuvrirApplication {
  constructor(private readonly dependances: DependancesOuvrirApplication) {}

  executer(_retour: RetourGoogle): Promise<IssueOuverture> {
    return nonImplemente('OuvrirApplication.executer');
  }

  /**
   * Écran d'attente resté DELAI_MAX_ATTENTE_REDIRECTION sans retour de Google (guide v0.2.15, RL-LOT-001-S6) :
   * la composition a interrompu la navigation ; le départ est consommé, la session s'ouvre sans jeton
   * (A_RENOUVELER, ou PERDU si mémorisé), sans nouvelle redirection. Hors attente : undefined.
   */
  abandonnerAttenteGoogle(): Promise<IssueOuverture | undefined> {
    return nonImplemente('OuvrirApplication.abandonnerAttenteGoogle');
  }
}
