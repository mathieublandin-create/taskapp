import type { Resultat } from '../../../commun/domaine/resultat';
import type { Instant } from '../../../commun/domaine/temps/instant';

// RED-03, RED-04 ; port interne au contexte compte (conventions.md §2.3), support : base technique (ST-US-022 §5.1).
export type ModeDepart = 'RENOUVELLEMENT_OUVERTURE' | 'REPLI_GESTE';
/** État d'écran restitué au retour : route opaque, sans donnée personnelle. */
export type EtatReprise = { readonly ecran: string; readonly feuilleSynchronisationOuverte: boolean };
export const REPRISE_ACCUEIL: EtatReprise = { ecran: 'accueil', feuilleSynchronisationOuverte: false };

export type DepartMemorise = {
  readonly state: string;
  readonly expireA: Instant;
  readonly lanceA: Instant;
  readonly mode: ModeDepart;
  readonly reprise: EtatReprise;
};

export type ErreurMemoireTechnique = { readonly type: 'MemoireTechniqueIndisponible' };

export interface MemoireRedirection {
  memoriser(depart: DepartMemorise): Promise<Resultat<undefined, ErreurMemoireTechnique>>;
  /** Lit puis supprime, dans tous les cas (usage unique). */
  consommer(): Promise<DepartMemorise | undefined>;
}
