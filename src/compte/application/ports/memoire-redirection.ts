import type { Resultat } from '../../../commun/domaine/resultat';
import type { Instant } from '../../../commun/domaine/temps/instant';

// RED-03, RED-04 ; port interne au contexte compte (conventions.md §2.3), support : base technique (ST-US-022 §5.1).
export type ModeDepart = 'RENOUVELLEMENT_OUVERTURE' | 'REPLI_GESTE';
/**
 * État d'écran restitué au retour. Aucun contenu métier (ni saisie, ni intitulé) : `ecran` est une route
 * faite de segments fixes et d'identifiants (DAT v0.11.3 §4.1.7, Q-ST022-STA-1) ; contrôlée par
 * `ROUTE_REPRISE` à l'écriture et à la relecture.
 */
export type EtatReprise = {
  readonly ecran: string;
  readonly feuilleSynchronisationOuverte: boolean;
};
export const REPRISE_ACCUEIL: EtatReprise = {
  ecran: 'accueil',
  feuilleSynchronisationOuverte: false,
};

export type DepartMemorise = {
  readonly state: string;
  readonly expireA: Instant;
  readonly lanceA: Instant;
  readonly mode: ModeDepart;
  readonly reprise: EtatReprise;
};

/** Route admise dans une reprise : minuscules, chiffres, « / », « - », « _ » ; 200 caractères au plus. */
export const ROUTE_REPRISE = /^[a-z0-9/_-]{1,200}$/;

export type ErreurMemoireTechnique = { readonly type: 'MemoireTechniqueIndisponible' };

export interface MemoireRedirection {
  /**
   * Ne résout Succes qu'après l'événement `complete` de la transaction, en durabilité stricte, donc avant
   * toute navigation ; base indisponible ou route hors `ROUTE_REPRISE` → MemoireTechniqueIndisponible, et
   * aucune redirection n'est lancée (DAT v0.11.3 §4.1.7).
   */
  memoriser(depart: DepartMemorise): Promise<Resultat<undefined, ErreurMemoireTechnique>>;
  /** Lit puis supprime, dans tous les cas (usage unique) ; base indisponible → undefined. */
  consommer(): Promise<DepartMemorise | undefined>;
}
