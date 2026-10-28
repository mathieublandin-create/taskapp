import type { Horloge } from '@src/commun/application/ports/horloge';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import { echec, succes, type Resultat } from '@src/commun/domaine/resultat';
import { Instant } from '@src/commun/domaine/temps/instant';
import type {
  DemandeJeton,
  ErreurAuth,
  FournisseurAuth,
  IssueDemandeJeton,
  ModeDemande,
  RetourAccepte,
  RetourGoogle,
} from '@src/compte/application/ports/fournisseur-auth';
import type {
  DepartMemorise,
  MemoireRedirection,
  ModeDepart,
} from '@src/compte/application/ports/memoire-redirection';
import type { IdCompte, Identite } from '@src/compte/domaine/identite';
import { PORTEES_LOT_1, porteesManquantes } from '@src/compte/domaine/portees';
import { erreurDuRetour } from '@src/compte/infrastructure/auth/fournisseur-auth-web';
import { VALIDITE_STATE_REDIRECTION } from '@src/compte/infrastructure/auth/url-autorisation';
import { verifierRetour } from '@src/compte/infrastructure/auth/verification-retour';

type Redirection = { readonly state: string; readonly mode: ModeDepart };

/**
 * Doublure du port FournisseurAuth (ST-US-022 §12.3, conventions.md §11.10). Contrat :
 * tests/contrats/fournisseur-auth.contrat.ts (CT-AUTH-01 à 09).
 * Google simulé pour un compte :
 * - `accorder(identite, portees?)` : l'utilisateur accepte (portées accordées : toutes par défaut) ;
 *   `sessionGoogle(identite)` : session Google active, une redirection silencieuse revient avec un jeton ;
 * - `fermerLaProchaineFenetre()` : la prochaine fenêtre (geste ou connexion) est fermée (popup_closed) ;
 * - `retirerAcces()` : l'accès à l'application est retiré (access_denied au prochain geste) ;
 * - `panneTechniqueGis()` : la prochaine fenêtre GIS échoue pour une cause technique (popup_failed_to_open),
 *   d'où le repli par redirection interactive ;
 * - `acheverRedirection()` : rend le retour que Google placerait dans le fragment pour la dernière redirection
 *   lancée (jeton, ou erreur `interaction_required` sans session Google), avec le `state` mémorisé.
 * Pilotage complémentaire du banc : `couperLaProchaineConnexion()` (réseau perdu pendant la connexion),
 * `expirerSession()` ; observation : `demandes`, `nombreDemandes(mode)`, `jetonEnMemoire()`.
 * Les redirections passent par la `MemoireRedirection` fournie, comme l'adaptateur réel.
 */
export class FauxFournisseurAuth implements FournisseurAuth {
  readonly demandes: Array<DemandeJeton> = [];
  #accorde: { readonly identite: Identite; readonly portees: ReadonlyArray<string> } | undefined;
  #session: Identite | undefined;
  #fermerProchaine = false;
  #couperProchaine = false;
  #accesRetire = false;
  #panneGis = false;
  #derniereRedirection: Redirection | undefined;
  #jeton: Identite | undefined;
  #numero = 0;

  constructor(
    private readonly dependances: {
      readonly memoireRedirection: MemoireRedirection;
      readonly horloge: Horloge;
    },
  ) {}

  accorder(identite: Identite, portees: ReadonlyArray<string> = PORTEES_LOT_1): void {
    this.#accorde = { identite, portees };
    this.#accesRetire = false;
  }

  sessionGoogle(identite: Identite): void {
    this.#session = identite;
    this.#accorde ??= { identite, portees: PORTEES_LOT_1 };
  }

  /** La session Google du navigateur a expiré : une redirection silencieuse revient en interaction_required. */
  expirerSession(): void {
    this.#session = undefined;
  }

  fermerLaProchaineFenetre(): void {
    this.#fermerProchaine = true;
  }

  couperLaProchaineConnexion(): void {
    this.#couperProchaine = true;
  }

  retirerAcces(): void {
    this.#accesRetire = true;
    this.#session = undefined;
  }

  panneTechniqueGis(): void {
    this.#panneGis = true;
  }

  acheverRedirection(): RetourGoogle {
    const redirection = this.#derniereRedirection;
    if (redirection === undefined) throw new ErreurProgrammation('Aucune redirection lancée');
    this.#derniereRedirection = undefined;
    const identite = redirection.mode === 'REPLI_GESTE' ? this.#identiteAccordee() : this.#session;
    if (identite === undefined) {
      return {
        type: 'ERREUR',
        code: this.#accesRetire ? 'access_denied' : 'interaction_required',
        state: redirection.state,
      };
    }
    return {
      type: 'JETON',
      jeton: `jeton-simule:${identite.compte}`,
      expireEnSecondes: 3_600,
      portees: this.#accorde?.portees ?? PORTEES_LOT_1,
      state: redirection.state,
    };
  }

  nombreDemandes(mode: ModeDemande): number {
    return this.demandes.filter((d) => d.mode === mode).length;
  }

  jetonEnMemoire(): boolean {
    return this.#jeton !== undefined;
  }

  demanderJeton(demande: DemandeJeton): Promise<Resultat<IssueDemandeJeton, ErreurAuth>> {
    if (demande.mode !== 'CONNEXION' && demande.indice === undefined) {
      return Promise.reject(new ErreurProgrammation(`login_hint absent en mode ${demande.mode}`));
    }
    this.demandes.push(demande);
    if (demande.mode === 'RENOUVELLEMENT_OUVERTURE') {
      return this.#rediriger(demande, 'RENOUVELLEMENT_OUVERTURE');
    }
    const erreur = this.#erreurFenetre(demande);
    if (erreur !== undefined) return Promise.resolve(echec(erreur));
    if (this.#panneGis) {
      this.#panneGis = false;
      return demande.redirectionPermise
        ? this.#rediriger(demande, 'REPLI_GESTE')
        : Promise.resolve(echec({ type: 'RedirectionNonPermise' }));
    }
    return Promise.resolve(this.#accesObtenu(demande));
  }

  recevoirRetour(p: {
    readonly retour: RetourGoogle;
    readonly depart: DepartMemorise | undefined;
    readonly compteAttendu: IdCompte;
  }): Promise<Resultat<RetourAccepte, ErreurAuth>> {
    return Promise.resolve(this.#accepterRetour(p));
  }

  #accepterRetour(p: {
    readonly retour: RetourGoogle;
    readonly depart: DepartMemorise | undefined;
    readonly compteAttendu: IdCompte;
  }): Resultat<RetourAccepte, ErreurAuth> {
    const verification = verifierRetour({
      stateRecu: p.retour.type === 'AUCUN' ? undefined : p.retour.state,
      depart: p.depart,
      maintenant: this.dependances.horloge.maintenant(),
    });
    if (!verification.ok) {
      return echec({ type: 'RetourRedirectionRejete', motif: verification.erreur });
    }
    const { mode, reprise } = verification.valeur;
    if (p.retour.type !== 'JETON') {
      return echec(erreurDuRetour(p.retour.type === 'ERREUR' ? p.retour.code : 'vide', mode));
    }
    const identite = this.#identiteDuJeton(p.retour.jeton);
    if (identite?.compte !== p.compteAttendu) {
      return echec({ type: 'CompteDifferent' });
    }
    const manquantes = porteesManquantes(p.retour.portees, PORTEES_LOT_1);
    if (manquantes.length > 0) return echec({ type: 'PorteeInsuffisante', manquantes });
    this.#jeton = identite;
    return succes({ acces: { porteesAccordees: p.retour.portees, identite }, mode, reprise });
  }

  oublier(): void {
    this.#jeton = undefined;
    void this.dependances.memoireRedirection.consommer();
  }

  #identiteAccordee(): Identite | undefined {
    return this.#accesRetire ? undefined : this.#accorde?.identite;
  }

  #identiteDuJeton(jeton: string): Identite | undefined {
    const candidats = [this.#accorde?.identite, this.#session];
    return candidats.find((i) => i !== undefined && jeton === `jeton-simule:${String(i.compte)}`);
  }

  /** Fenêtre fermée, réseau coupé, accès retiré, aucun compte : échecs sans repli. */
  #erreurFenetre(demande: DemandeJeton): ErreurAuth | undefined {
    if (this.#fermerProchaine) {
      this.#fermerProchaine = false;
      return { type: 'ConnexionAnnulee' };
    }
    if (this.#couperProchaine) {
      this.#couperProchaine = false;
      return { type: 'ReseauIndisponible' };
    }
    if (this.#accesRetire && demande.mode !== 'CONNEXION') return { type: 'AccesGoogleRevoque' };
    if (this.#accorde === undefined) return { type: 'ConnexionAnnulee' };
    return undefined;
  }

  #accesObtenu(demande: DemandeJeton): Resultat<IssueDemandeJeton, ErreurAuth> {
    const accorde = this.#accorde;
    if (accorde === undefined) return echec({ type: 'ConnexionAnnulee' });
    const manquantes = porteesManquantes(accorde.portees, demande.portees);
    if (manquantes.length > 0) return echec({ type: 'PorteeInsuffisante', manquantes });
    if (demande.mode !== 'CONNEXION' && accorde.identite.adresse !== demande.indice) {
      this.#jeton = undefined;
      return echec({ type: 'CompteDifferent' });
    }
    this.#jeton = accorde.identite;
    return succes({
      type: 'ACCES_OBTENU',
      acces: { porteesAccordees: accorde.portees, identite: accorde.identite },
    });
  }

  async #rediriger(
    demande: DemandeJeton,
    mode: ModeDepart,
  ): Promise<Resultat<IssueDemandeJeton, ErreurAuth>> {
    this.#numero += 1;
    const state = `state-simule-${String(this.#numero)}`;
    const maintenant = this.dependances.horloge.maintenant();
    const memorise = await this.dependances.memoireRedirection.memoriser({
      state,
      expireA: Instant.decaler(maintenant, VALIDITE_STATE_REDIRECTION),
      lanceA: maintenant,
      mode,
      reprise: demande.reprise,
    });
    if (!memorise.ok) return echec({ type: 'MemoireTechniqueIndisponible' });
    this.#derniereRedirection = { state, mode };
    return succes({ type: 'REDIRECTION_LANCEE' });
  }
}
