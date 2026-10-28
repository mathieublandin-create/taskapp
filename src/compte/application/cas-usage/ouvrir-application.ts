import type { EtatReseau } from '../../../commun/application/ports/etat-reseau';
import type { Horloge } from '../../../commun/application/ports/horloge';
import type { JournalTechnique } from '../../../commun/application/ports/journal-technique';
import { accesApresRetour, type EtatAcces } from '../../domaine/acces';
import type { Identite } from '../../domaine/identite';
import { deciderOuverture, type DecisionOuverture } from '../../domaine/ouverture';
import { PORTEES_LOT_1 } from '../../domaine/portees';
import { issueDeErreurAuth } from '../issue-erreur-auth';
import type { FournisseurAuth, RetourGoogle } from '../ports/fournisseur-auth';
import type { GestionEspaces } from '../ports/gestion-espaces';
import {
  REPRISE_ACCUEIL,
  type DepartMemorise,
  type EtatReprise,
  type MemoireRedirection,
} from '../ports/memoire-redirection';
import type { MemoireSession, SessionMemorisee } from '../ports/memoire-session';
import type { SessionCourante } from '../session-courante';

// ST-US-022 §6.2 (DAT §4.1.7, RED-08).
export type IssueOuverture =
  | { readonly type: 'ECRAN_CONNEXION' }
  /** v0.3.2 (Q-BRU-3, RC-US022-10) : espace local inaccessible à l'ouverture (§6.2 étape 5, §8 n° 12). */
  | { readonly type: 'ESPACE_INACCESSIBLE' }
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

type Contexte = {
  readonly retour: RetourGoogle;
  readonly memorisee: SessionMemorisee;
  readonly depart: DepartMemorise | undefined;
  readonly accesInitial: EtatAcces;
};

const accesInitialDe = (memorisee: SessionMemorisee): EtatAcces =>
  memorisee.accesPerdu ? 'PERDU' : 'A_RENOUVELER';

export class OuvrirApplication {
  /** Accès à rétablir si l'attente de Google est abandonnée (renseigné au lancement de la redirection). */
  #accesSiAbandon: EtatAcces = 'A_RENOUVELER';

  constructor(private readonly dependances: DependancesOuvrirApplication) {}

  async executer(retour: RetourGoogle): Promise<IssueOuverture> {
    const { memoireRedirection, memoireSession, horloge, reseau } = this.dependances;
    const depart = await memoireRedirection.consommer();
    const departValide = depart !== undefined && horloge.maintenant() <= depart.expireA;
    const memorisee = await memoireSession.lire();
    const decision = deciderOuverture({
      sessionMemorisee: memorisee !== undefined,
      retour: retour.type === 'AUCUN' ? 'AUCUN' : 'PRESENT',
      departEnAttente: departValide && retour.type === 'AUCUN',
      reseau: reseau.estConnecte() ? 'CONNECTE' : 'COUPE',
    });
    if (memorisee === undefined || decision === 'ECRAN_CONNEXION') {
      return this.#ecranConnexion(retour);
    }
    if (!(await this.#ouvrirEspace(memorisee.identite))) return this.#ecranConnexion(retour);
    return this.#poursuivre(decision, {
      retour,
      memorisee,
      depart: departValide ? depart : undefined,
      accesInitial: accesInitialDe(memorisee),
    });
  }

  /**
   * Écran d'attente resté DELAI_MAX_ATTENTE_REDIRECTION sans retour de Google (guide v0.2.15, RL-LOT-001-S6) :
   * la composition a interrompu la navigation ; le départ est consommé, la session s'ouvre sans jeton
   * (A_RENOUVELER, ou PERDU si mémorisé), sans nouvelle redirection. Hors attente : undefined.
   */
  async abandonnerAttenteGoogle(): Promise<IssueOuverture | undefined> {
    const etat = this.dependances.session.etat();
    if (etat.type !== 'ATTENTE_GOOGLE') return undefined;
    await this.dependances.memoireRedirection.consommer();
    this.#consigner('avertissement', 'RedirectionSansReponse');
    return this.#ouvrirSession(etat.identite, this.#accesSiAbandon);
  }

  #poursuivre(
    decision: DecisionOuverture,
    contexte: Contexte,
  ): Promise<IssueOuverture> | IssueOuverture {
    if (decision === 'REDIRECTION_SILENCIEUSE') return this.#redirectionSilencieuse(contexte);
    if (decision === 'TRAITER_RETOUR') return this.#traiterRetour(contexte);
    // OUVRIR_SANS_JETON : un départ encore valide sans retour (retour arrière, application tuée).
    if (contexte.retour.type === 'AUCUN' && contexte.depart !== undefined) {
      this.#consigner('info', 'RetourAbsent');
    }
    return this.#ouvrirSession(contexte.memorisee.identite, contexte.accesInitial);
  }

  #ecranConnexion(retour: RetourGoogle): IssueOuverture {
    if (retour.type !== 'AUCUN') {
      this.#consigner('avertissement', 'RetourRedirectionRejete', { motif: 'SANS_DEPART' });
    }
    this.dependances.session.fermer();
    return { type: 'ECRAN_CONNEXION' };
  }

  async #ouvrirEspace(identite: Identite): Promise<boolean> {
    const ouverture = await this.dependances.espaces.ouvrir(identite.compte);
    if (!ouverture.ok) this.#consigner('erreur', 'EspaceInaccessible');
    return ouverture.ok;
  }

  async #redirectionSilencieuse(contexte: Contexte): Promise<IssueOuverture> {
    const { identite } = contexte.memorisee;
    this.#accesSiAbandon = contexte.accesInitial;
    this.dependances.session.attendreGoogle(identite);
    const demande = await this.dependances.fournisseur.demanderJeton({
      mode: 'RENOUVELLEMENT_OUVERTURE',
      portees: PORTEES_LOT_1,
      indice: identite.adresse,
      reprise: REPRISE_ACCUEIL,
      redirectionPermise: true,
    });
    if (demande.ok && demande.valeur.type === 'REDIRECTION_LANCEE') {
      return { type: 'REDIRECTION_LANCEE' };
    }
    if (demande.ok) return this.#ouvrirSession(identite, 'VALIDE');
    this.#consigner('avertissement', 'RedirectionImpossible', { erreur: demande.erreur.type });
    return this.#ouvrirSession(identite, contexte.accesInitial);
  }

  async #traiterRetour(contexte: Contexte): Promise<IssueOuverture> {
    const { memorisee, depart, retour } = contexte;
    const recu = await this.dependances.fournisseur.recevoirRetour({
      retour,
      depart,
      compteAttendu: memorisee.identite.compte,
    });
    this.#journaliserRetour(contexte, recu.ok ? undefined : recu.erreur.type);
    if (recu.ok) {
      if (memorisee.accesPerdu) await this.#memoriserAccesPerdu(memorisee, false);
      return this.#ouvrirSession(memorisee.identite, 'VALIDE', recu.valeur.reprise);
    }
    const acces = accesApresRetour({
      avant: contexte.accesInitial,
      issue: issueDeErreurAuth(recu.erreur),
      origine: depart?.mode === 'REPLI_GESTE' ? 'GESTE' : 'OUVERTURE',
    });
    if (acces === 'PERDU' && !memorisee.accesPerdu)
      await this.#memoriserAccesPerdu(memorisee, true);
    return this.#ouvrirSession(memorisee.identite, acces);
  }

  /** RED-06 : catégorie, code d'erreur de Google et durée de l'aller-retour ; jamais le state ni le jeton. */
  #journaliserRetour(contexte: Contexte, erreur: string | undefined): void {
    const { retour, depart } = contexte;
    const niveau = erreur === 'ConfigurationOAuthInvalide' ? 'erreur' : 'info';
    this.#consigner(niveau, 'RetourGoogle', {
      categorie: erreur ?? 'JETON',
      ...(retour.type === 'ERREUR' ? { code: retour.code } : {}),
      ...(depart === undefined
        ? {}
        : { dureeMs: this.dependances.horloge.maintenant() - depart.lanceA }),
    });
  }

  async #memoriserAccesPerdu(memorisee: SessionMemorisee, accesPerdu: boolean): Promise<void> {
    await this.dependances.memoireSession.ecrire({ identite: memorisee.identite, accesPerdu });
  }

  #ouvrirSession(identite: Identite, acces: EtatAcces, reprise?: EtatReprise): IssueOuverture {
    this.dependances.session.ouvrir(identite, acces);
    return reprise === undefined
      ? { type: 'SESSION_OUVERTE', acces }
      : { type: 'SESSION_OUVERTE', acces, reprise };
  }

  #consigner(
    niveau: 'erreur' | 'avertissement' | 'info',
    evenement: string,
    champs?: Readonly<Record<string, string | number>>,
  ): void {
    this.dependances.journal.consigner({
      niveau,
      evenement,
      ...(champs === undefined ? {} : { champs }),
    });
  }
}
