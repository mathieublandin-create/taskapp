import type { Resultat } from '../../../commun/domaine/resultat';
import type { AdresseGoogle, IdCompte, Identite } from '../../domaine/identite';
import type { Portee } from '../../domaine/portees';
import type { DepartMemorise, EtatReprise, ModeDepart } from './memoire-redirection';

// ADR-004, ADR-013, conventions.md §2.3 (ST-US-022 §4.3, §6.4).
export type ModeDemande =
  'CONNEXION' | 'RENOUVELLEMENT_OUVERTURE' | 'RENOUVELLEMENT_GESTE' | 'RECONNEXION_GESTE';

export type DemandeJeton = {
  readonly mode: ModeDemande;
  readonly portees: ReadonlyArray<Portee>;
  /** login_hint : obligatoire dans tous les modes sauf CONNEXION. */
  readonly indice?: AdresseGoogle;
  readonly reprise: EtatReprise;
};

export type AccesObtenu = {
  readonly porteesAccordees: ReadonlyArray<string>;
  readonly identite: Identite;
};

export type IssueDemandeJeton =
  | { readonly type: 'ACCES_OBTENU'; readonly acces: AccesObtenu }
  | { readonly type: 'REDIRECTION_LANCEE' };

export type MotifRejetRetour = 'STATE_ABSENT' | 'STATE_INCONNU' | 'STATE_EXPIRE' | 'SANS_DEPART';

export type ErreurAuth =
  | { readonly type: 'ConnexionAnnulee' }
  | { readonly type: 'PorteeInsuffisante'; readonly manquantes: ReadonlyArray<Portee> }
  | { readonly type: 'AccesGoogleRevoque' }
  | { readonly type: 'SessionARenouveler'; readonly code: string }
  | { readonly type: 'ConfigurationOAuthInvalide'; readonly code: string }
  | { readonly type: 'RetourRedirectionRejete'; readonly motif: MotifRejetRetour }
  | { readonly type: 'CompteDifferent' }
  | { readonly type: 'MemoireTechniqueIndisponible' }
  | { readonly type: 'ReseauIndisponible' };

/** Retour de Google lu dans le fragment de l'URL (jamais journalisé). */
export type RetourGoogle =
  | { readonly type: 'AUCUN' }
  | {
      readonly type: 'JETON';
      readonly jeton: string;
      readonly expireEnSecondes?: number;
      readonly portees: ReadonlyArray<string>;
      readonly state?: string;
    }
  | { readonly type: 'ERREUR'; readonly code: string; readonly state?: string };

export type RetourAccepte = {
  readonly acces: AccesObtenu;
  readonly mode: ModeDepart;
  readonly reprise: EtatReprise;
};

export interface FournisseurAuth {
  demanderJeton(demande: DemandeJeton): Promise<Resultat<IssueDemandeJeton, ErreurAuth>>;
  /** Valide le retour (state, portées, compte attendu), puis place le jeton dans le coffre. */
  recevoirRetour(p: {
    readonly retour: RetourGoogle;
    readonly depart: DepartMemorise | undefined;
    readonly compteAttendu: IdCompte;
  }): Promise<Resultat<RetourAccepte, ErreurAuth>>;
  /** Efface le jeton en mémoire. */
  oublier(): void;
}
