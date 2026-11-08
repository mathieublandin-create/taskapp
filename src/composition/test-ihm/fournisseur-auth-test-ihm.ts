import { nonImplemente } from '@non-implemente';
import type { EtatReseau } from '../../commun/application/ports/etat-reseau';
import type { Horloge } from '../../commun/application/ports/horloge';
import type { Resultat } from '../../commun/domaine/resultat';
import type { CoffreJetons } from '../../compte/application/ports/coffre-jetons';
import type {
  DemandeJeton,
  ErreurAuth,
  FournisseurAuth,
  IssueDemandeJeton,
  RetourAccepte,
  RetourGoogle,
} from '../../compte/application/ports/fournisseur-auth';
import type { DepartMemorise } from '../../compte/application/ports/memoire-redirection';
import type { IdCompte } from '../../compte/domaine/identite';

// ST-US-018 v0.4 §4.4, §6.5 (rang 12, tranche B2). Composition `test-ihm` seulement. Google est simulé par le processus
// cucumber (binding `donejuanFauxGoogle`) : aucune redirection, aucun chargement de GIS ; le parcours réel par
// redirection reste vérifié par les tests de `FournisseurAuthWeb`, `tests/e2e/demarrage.e2e.ts` et la recette (E14).

/** Durée de validité du jeton simulé, comme un jeton Google (1 h). */
export const VALIDITE_JETON_TEST_IHM_MS = 3_600_000;

/**
 * `window.donejuanFauxGoogle` : `demanderJeton` reçoit `encoderPont([{ mode, portees, indice? }])` et rend
 * `encoderPont(Resultat<AccesObtenu, ErreurAuth>)` ; `oublier` reçoit `encoderPont([])` et rend `encoderPont(null)`.
 */
export type PontGoogle = (
  methode: 'demanderJeton' | 'oublier',
  argumentsJson: string,
) => Promise<string>;

export type DependancesFournisseurAuthTestIhm = {
  readonly pont: PontGoogle;
  readonly reseau: EtatReseau;
  readonly coffre: CoffreJetons;
  readonly horloge: Pick<Horloge, 'monotone'>;
};

/**
 * - `demanderJeton` : réseau coupé → `Echec(ReseauIndisponible)` sans appeler le pont ; succès du pont → jeton
 *   `jeton-test-ihm:<compte>` placé dans le coffre (échéance `monotone() + VALIDITE_JETON_TEST_IHM_MS`), puis
 *   `ACCES_OBTENU` avec l'accès reçu (jamais `REDIRECTION_LANCEE`) ; échec du pont → même échec, coffre inchangé.
 * - `recevoirRetour` : `Echec(RetourRedirectionRejete, motif SANS_DEPART)`, sans appeler le pont.
 * - `oublier` : vide le coffre, puis `pont('oublier', '[]')` sans l'attendre.
 */
export class FournisseurAuthTestIhm implements FournisseurAuth {
  constructor(private readonly dependances: DependancesFournisseurAuthTestIhm) {}

  demanderJeton(demande: DemandeJeton): Promise<Resultat<IssueDemandeJeton, ErreurAuth>> {
    return nonImplemente(`FournisseurAuthTestIhm.demanderJeton ${demande.mode}`);
  }

  recevoirRetour(_p: {
    readonly retour: RetourGoogle;
    readonly depart: DepartMemorise | undefined;
    readonly compteAttendu: IdCompte;
  }): Promise<Resultat<RetourAccepte, ErreurAuth>> {
    return nonImplemente(`FournisseurAuthTestIhm.recevoirRetour ${typeof this.dependances}`);
  }

  oublier(): void {
    nonImplemente('FournisseurAuthTestIhm.oublier');
  }
}
