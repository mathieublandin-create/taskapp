import type { EtatReseau } from '../../../commun/application/ports/etat-reseau';
import type { Horloge } from '../../../commun/application/ports/horloge';
import type { JournalTechnique } from '../../../commun/application/ports/journal-technique';
import type { SourceAleatoire } from '../../../commun/application/ports/source-aleatoire';
import { ErreurProgrammation } from '../../../commun/domaine/erreur-programmation';
import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import { EcartTemps } from '../../../commun/domaine/temps/ecart-temps';
import { Instant } from '../../../commun/domaine/temps/instant';
import type { CoffreJetons, JetonAcces } from '../../application/ports/coffre-jetons';
import type {
  AccesObtenu,
  DemandeJeton,
  ErreurAuth,
  FournisseurAuth,
  IssueDemandeJeton,
  RetourAccepte,
  RetourGoogle,
} from '../../application/ports/fournisseur-auth';
import type {
  DepartMemorise,
  MemoireRedirection,
  ModeDepart,
} from '../../application/ports/memoire-redirection';
import type { IdCompte } from '../../domaine/identite';
import { PORTEES_LOT_1, porteesManquantes, type Portee } from '../../domaine/portees';
import type { LectureIdentite } from './lecture-identite';
import type { PasserelleGis } from './passerelle-gis';
import { mecanismeGeste, suiteErreurGis, type ErreurGis, type Plateforme } from './strategie-geste';
import {
  construireUrlAutorisation,
  encoderBase64Url,
  VALIDITE_STATE_REDIRECTION,
} from './url-autorisation';
import { verifierRetour } from './verification-retour';

// ADR-013 ; ST-US-022 §6.4 : adaptateur unique. Redirection pleine page à l'ouverture (`prompt=none`), GIS
// avec `login_hint` pour la connexion et le geste, une seule redirection interactive en repli d'un geste.

/** Durée de validité d'un jeton dont Google n'a pas donné `expires_in` (3 600 s). */
const DUREE_JETON_PAR_DEFAUT_S = 3_600;

const CODES_CONFIGURATION: ReadonlySet<string> = new Set([
  'redirect_uri_mismatch',
  'invalid_request',
  'invalid_client',
  'origin_mismatch',
  'invalid_scope',
  'unauthorized_client',
  'unsupported_response_type',
]);

export type Navigation = {
  /** Quitte l'application pour l'URL d'autorisation de Google. */
  readonly aller: (url: string) => void;
};

/** Implémentation du navigateur : seul usage de `location.assign` dans src/ (ST-US-022 §3.2). */
export const NAVIGATION_NAVIGATEUR: Navigation = {
  aller: (url) => {
    location.assign(url);
  },
};

export type ConfigurationAuth = {
  readonly clientId: string;
  readonly redirectUri: string;
  readonly plateforme: Plateforme;
};

export type DependancesFournisseurAuthWeb = {
  readonly configuration: ConfigurationAuth;
  readonly passerelle: PasserelleGis;
  readonly lireIdentite: LectureIdentite;
  readonly navigation: Navigation;
  readonly memoireRedirection: MemoireRedirection;
  readonly coffre: CoffreJetons;
  readonly horloge: Horloge;
  readonly aleatoire: SourceAleatoire;
  readonly reseau: EtatReseau;
  readonly journal: JournalTechnique;
  /** Compte de la session en cours (contrôle CompteDifferent d'un geste) ; undefined sans session. */
  readonly compteDeLaSession: () => IdCompte | undefined;
};

type JetonRecu = {
  readonly jeton: string;
  readonly expireEnSecondes?: number;
  readonly portees: ReadonlyArray<string>;
};

/** Erreur Google d'un retour de redirection (ST-US-022 §6.4, `recevoirRetour`). */
export const erreurDuRetour = (code: string, mode: ModeDepart): ErreurAuth => {
  if (code === 'access_denied') {
    return mode === 'REPLI_GESTE'
      ? { type: 'AccesGoogleRevoque' }
      : { type: 'SessionARenouveler', code };
  }
  if (CODES_CONFIGURATION.has(code)) return { type: 'ConfigurationOAuthInvalide', code };
  // Codes d'interaction (interaction_required, login_required, consent_required,
  // account_selection_required) et tout autre code : accès à renouveler.
  return { type: 'SessionARenouveler', code };
};

/** Première connexion : pas de repli par redirection (hors v1, EPI-001) ; un refus vaut une annulation. */
const erreurConnexion = (erreur: ErreurGis, reseau: 'CONNECTE' | 'COUPE'): ErreurAuth => {
  if (erreur.type === 'ACCESS_DENIED') return { type: 'ConnexionAnnulee' };
  const suite = suiteErreurGis(erreur, reseau);
  return suite.type === 'ECHEC' ? suite.erreur : { type: 'ReseauIndisponible' };
};

export class FournisseurAuthWeb implements FournisseurAuth {
  constructor(private readonly d: DependancesFournisseurAuthWeb) {}

  async demanderJeton(demande: DemandeJeton): Promise<Resultat<IssueDemandeJeton, ErreurAuth>> {
    if (demande.mode === 'CONNEXION') return this.#connexion(demande);
    const indice = demande.indice;
    if (indice === undefined) {
      throw new ErreurProgrammation(`login_hint absent en mode ${demande.mode}`);
    }
    if (demande.mode === 'RENOUVELLEMENT_OUVERTURE') {
      return this.#rediriger(demande, indice, 'RENOUVELLEMENT_OUVERTURE');
    }
    if (mecanismeGeste(this.d.configuration.plateforme) === 'REDIRECTION_INTERACTIVE') {
      return this.#repli(demande, indice);
    }
    return this.#gesteGis(demande, indice);
  }

  async recevoirRetour(p: {
    readonly retour: RetourGoogle;
    readonly depart: DepartMemorise | undefined;
    readonly compteAttendu: IdCompte;
  }): Promise<Resultat<RetourAccepte, ErreurAuth>> {
    const { retour } = p;
    const verification = verifierRetour({
      stateRecu: retour.type === 'AUCUN' ? undefined : retour.state,
      depart: p.depart,
      maintenant: this.d.horloge.maintenant(),
    });
    if (!verification.ok) {
      this.d.journal.consigner({
        niveau: 'avertissement',
        evenement: 'RetourRedirectionRejete',
        champs: { motif: verification.erreur },
      });
      return echec({ type: 'RetourRedirectionRejete', motif: verification.erreur });
    }
    const depart = verification.valeur;
    if (retour.type !== 'JETON') {
      const code = retour.type === 'ERREUR' ? retour.code : 'retour_vide';
      return echec(erreurDuRetour(code, depart.mode));
    }
    const acces = await this.#accepterJeton(retour, p.compteAttendu);
    return acces.ok
      ? succes({ acces: acces.valeur, mode: depart.mode, reprise: depart.reprise })
      : acces;
  }

  /** Efface le jeton en mémoire et tout départ de redirection mémorisé (déconnexion, suppression). */
  oublier(): void {
    this.d.coffre.vider();
    void this.d.memoireRedirection.consommer();
  }

  #reseau(): 'CONNECTE' | 'COUPE' {
    return this.d.reseau.estConnecte() ? 'CONNECTE' : 'COUPE';
  }

  async #connexion(demande: DemandeJeton): Promise<Resultat<IssueDemandeJeton, ErreurAuth>> {
    const reponse = await this.d.passerelle.demanderJeton({
      clientId: this.d.configuration.clientId,
      portees: demande.portees,
    });
    if (!reponse.ok) return echec(erreurConnexion(reponse.erreur, this.#reseau()));
    return this.#accesObtenu(await this.#accepterJeton(reponse.valeur, undefined, demande.portees));
  }

  async #gesteGis(
    demande: DemandeJeton,
    indice: string,
  ): Promise<Resultat<IssueDemandeJeton, ErreurAuth>> {
    const reponse = await this.d.passerelle.demanderJeton({
      clientId: this.d.configuration.clientId,
      portees: demande.portees,
      indice,
    });
    if (reponse.ok) {
      const attendu = this.d.compteDeLaSession();
      return this.#accesObtenu(await this.#accepterJeton(reponse.valeur, attendu, demande.portees));
    }
    const suite = suiteErreurGis(reponse.erreur, this.#reseau());
    if (suite.type === 'ECHEC') return echec(suite.erreur);
    return this.#repli(demande, indice);
  }

  /** Une seule redirection interactive par geste ; jamais si une saisie est en cours. */
  #repli(demande: DemandeJeton, indice: string): Promise<Resultat<IssueDemandeJeton, ErreurAuth>> {
    if (!demande.redirectionPermise) {
      this.d.journal.consigner({ niveau: 'info', evenement: 'RedirectionNonPermise' });
      return Promise.resolve(echec({ type: 'RedirectionNonPermise' }));
    }
    return this.#rediriger(demande, indice, 'REPLI_GESTE');
  }

  async #rediriger(
    demande: DemandeJeton,
    indice: string,
    mode: ModeDepart,
  ): Promise<Resultat<IssueDemandeJeton, ErreurAuth>> {
    const state = encoderBase64Url(this.d.aleatoire.octets(16));
    const maintenant = this.d.horloge.maintenant();
    const memorise = await this.d.memoireRedirection.memoriser({
      state,
      expireA: Instant.decaler(maintenant, VALIDITE_STATE_REDIRECTION),
      lanceA: maintenant,
      mode,
      reprise: demande.reprise,
    });
    if (!memorise.ok) return echec({ type: 'MemoireTechniqueIndisponible' });
    this.d.navigation.aller(
      construireUrlAutorisation({
        clientId: this.d.configuration.clientId,
        redirectUri: this.d.configuration.redirectUri,
        portees: demande.portees,
        state,
        indice,
        interaction: mode === 'RENOUVELLEMENT_OUVERTURE' ? 'SILENCIEUSE' : 'INTERACTIVE',
      }),
    );
    return succes({ type: 'REDIRECTION_LANCEE' });
  }

  #accesObtenu(acces: Resultat<AccesObtenu, ErreurAuth>): Resultat<IssueDemandeJeton, ErreurAuth> {
    return acces.ok ? succes({ type: 'ACCES_OBTENU', acces: acces.valeur }) : acces;
  }

  /** Portées, identité (userinfo) et compte attendu contrôlés avant de placer le jeton dans le coffre. */
  async #accepterJeton(
    recu: JetonRecu,
    compteAttendu: IdCompte | undefined,
    requises: ReadonlyArray<Portee> = PORTEES_LOT_1,
  ): Promise<Resultat<AccesObtenu, ErreurAuth>> {
    const manquantes = porteesManquantes(recu.portees, requises);
    if (manquantes.length > 0) return echec({ type: 'PorteeInsuffisante', manquantes });
    const identite = await this.d.lireIdentite(recu.jeton);
    if (!identite.ok) return identite;
    if (compteAttendu !== undefined && identite.valeur.compte !== compteAttendu) {
      this.d.coffre.vider();
      this.d.journal.consigner({ niveau: 'avertissement', evenement: 'CompteDifferent' });
      return echec({ type: 'CompteDifferent' });
    }
    const duree = (recu.expireEnSecondes ?? DUREE_JETON_PAR_DEFAUT_S) * 1000;
    this.d.coffre.placer({
      jeton: recu.jeton as JetonAcces,
      echeance: EcartTemps.depuisMillisecondes(this.d.horloge.monotone() + duree),
    });
    return succes({ porteesAccordees: recu.portees, identite: identite.valeur });
  }
}
