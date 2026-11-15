import type { EtatReseau } from '../../../commun/application/ports/etat-reseau';
import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import { accesApresRetour, type EtatAcces } from '../../domaine/acces';
import type { Identite } from '../../domaine/identite';
import { PORTEES_LOT_1 } from '../../domaine/portees';
import type { ErreurSansSession } from '../evaluation';
import { issueDeErreurAuth } from '../issue-erreur-auth';
import type { ErreurAuth, FournisseurAuth } from '../ports/fournisseur-auth';
import type { GardeSaisie } from '../ports/garde-saisie';
import type { EtatReprise } from '../ports/memoire-redirection';
import type { MemoireSession } from '../ports/memoire-session';
import type { SessionCourante } from '../session-courante';

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

type ErreurReprise = ErreurSansSession | { readonly type: 'HorsLigne' };

export class ReprendreSession {
  constructor(private readonly dependances: DependancesReprendreSession) {}

  async executer(reprise: EtatReprise): Promise<Resultat<IssueReprise, ErreurReprise>> {
    const { session, reseau, fournisseur, gardeSaisie } = this.dependances;
    const etat = session.etat();
    if (etat.type !== 'OUVERTE') return echec({ type: 'SansSession' });
    if (!reseau.estConnecte()) return echec({ type: 'HorsLigne' });
    const demande = await fournisseur.demanderJeton({
      mode: etat.acces === 'PERDU' ? 'RECONNEXION_GESTE' : 'RENOUVELLEMENT_GESTE',
      portees: PORTEES_LOT_1,
      indice: etat.identite.adresse,
      reprise,
      redirectionPermise: !gardeSaisie.saisieEnCours(),
    });
    if (!demande.ok)
      return succes(await this.#apresEchec(etat.identite, etat.acces, demande.erreur));
    if (demande.valeur.type === 'REDIRECTION_LANCEE') {
      session.attendreGoogle(etat.identite);
      return succes({ type: 'REDIRECTION_LANCEE' });
    }
    await this.#memoriserAccesPerdu(etat.identite, false);
    session.changerAcces('VALIDE');
    return succes({ type: 'ACCES_RENOUVELE' });
  }

  async #apresEchec(
    identite: Identite,
    avant: EtatAcces,
    erreur: ErreurAuth,
  ): Promise<IssueReprise> {
    if (erreur.type === 'RedirectionNonPermise') return { type: 'SAISIE_A_TERMINER' };
    const acces = accesApresRetour({ avant, issue: issueDeErreurAuth(erreur), origine: 'GESTE' });
    if (acces === 'PERDU' && avant !== 'PERDU') {
      await this.#memoriserAccesPerdu(identite, true);
      this.dependances.session.changerAcces('PERDU');
      return { type: 'ACCES_PERDU' };
    }
    this.dependances.session.changerAcces(acces);
    return { type: 'INCHANGE' };
  }

  /** N'écrit que si la valeur mémorisée change. */
  async #memoriserAccesPerdu(identite: Identite, accesPerdu: boolean): Promise<void> {
    const memorisee = await this.dependances.memoireSession.lire();
    if (memorisee !== undefined && memorisee.accesPerdu !== accesPerdu) {
      await this.dependances.memoireSession.ecrire({ identite, accesPerdu });
    }
  }
}
