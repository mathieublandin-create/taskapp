import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import type { IdCompte } from '../../domaine/identite';
import type { ErreurSansSession, EvaluationCompte } from '../evaluation';
import type { AvisOnglets } from '../ports/avis-onglets';
import type { DepotAvantSortie } from '../ports/depot-avant-sortie';
import type { FournisseurAuth } from '../ports/fournisseur-auth';
import type { ErreurEspace, GestionEspaces } from '../ports/gestion-espaces';
import type { MemoireSession } from '../ports/memoire-session';
import type { SessionCourante } from '../session-courante';
import { identiteCourante } from '../session-ouverte';
import { compterApresDepot } from './se-deconnecter';

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

type ResultatSuppression = Resultat<IssueSuppression, ErreurSansSession | ErreurEspace>;

const SANS_SESSION: ErreurSansSession = { type: 'SansSession' };

export class SupprimerDonneesAppareil {
  constructor(private readonly dependances: DependancesSupprimerDonnees) {}

  evaluer(): Promise<Resultat<EvaluationCompte, ErreurSansSession>> {
    if (identiteCourante(this.dependances.session) === undefined) {
      return Promise.resolve(echec(SANS_SESSION));
    }
    return Promise.resolve(
      succes({ type: 'CONFIRMATION_REQUISE', confirmation: { code: 'CNF-SUPPR-DONNEES' } }),
    );
  }

  async confirmer(): Promise<ResultatSuppression> {
    const identite = identiteCourante(this.dependances.session);
    if (identite === undefined) return echec(SANS_SESSION);
    const n = await compterApresDepot(this.dependances.depot);
    if (n > 0) {
      return succes({
        type: 'CONFIRMATION_REQUISE',
        confirmation: { code: 'CNF-SUPPR-DONNEES-PERTE', n },
      });
    }
    return this.#supprimer(identite.compte);
  }

  async confirmerPerte(): Promise<ResultatSuppression> {
    const identite = identiteCourante(this.dependances.session);
    return identite === undefined ? echec(SANS_SESSION) : this.#supprimer(identite.compte);
  }

  /** « Réessayer » d'ERR-017 : attend de nouveau la même suppression, sans redemander la confirmation. */
  async reessayer(): Promise<ResultatSuppression> {
    const identite = identiteCourante(this.dependances.session);
    if (identite === undefined) return echec(SANS_SESSION);
    return this.#suite(await this.dependances.espaces.supprimer(identite.compte), undefined);
  }

  /** « Aller à la connexion » d'ERR-017 : jeton oublié, session fermée ; la suppression aboutira plus tard. */
  fermerApresBlocage(): Promise<Resultat<undefined, ErreurSansSession>> {
    if (identiteCourante(this.dependances.session) === undefined) {
      return Promise.resolve(echec(SANS_SESSION));
    }
    this.dependances.fournisseur.oublier();
    this.dependances.session.fermer();
    return Promise.resolve(succes(undefined));
  }

  /** Ordre imposé (DAT v0.11.4 §4.1.6) : effacer la session → prévenir les onglets → supprimer. */
  async #supprimer(compte: IdCompte): Promise<ResultatSuppression> {
    const { memoireSession, avis, espaces } = this.dependances;
    const avant = await memoireSession.lire();
    await memoireSession.effacer();
    avis.diffuser('SESSION_FERMEE');
    return this.#suite(await espaces.supprimer(compte), avant);
  }

  async #suite(
    r: Awaited<ReturnType<GestionEspaces['supprimer']>>,
    avant: Awaited<ReturnType<MemoireSession['lire']>>,
  ): Promise<ResultatSuppression> {
    if (r.ok) {
      this.dependances.fournisseur.oublier();
      this.dependances.session.fermer();
      return succes({ type: 'SUPPRIMEES' });
    }
    if (r.erreur.type === 'SuppressionBloquee') return succes({ type: 'SUPPRESSION_BLOQUEE' });
    if (avant !== undefined) await this.dependances.memoireSession.ecrire(avant);
    return echec(r.erreur);
  }
}
