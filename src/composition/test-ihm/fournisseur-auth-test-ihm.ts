import type { EtatReseau } from '../../commun/application/ports/etat-reseau';
import type { Horloge } from '../../commun/application/ports/horloge';
import { echec, succes, type Resultat } from '../../commun/domaine/resultat';
import { EcartTemps } from '../../commun/domaine/temps/ecart-temps';
import type { CoffreJetons, JetonAcces } from '../../compte/application/ports/coffre-jetons';
import type {
  AccesObtenu,
  DemandeJeton,
  ErreurAuth,
  FournisseurAuth,
  IssueDemandeJeton,
  RetourAccepte,
  RetourGoogle,
} from '../../compte/application/ports/fournisseur-auth';
import type { DepartMemorise } from '../../compte/application/ports/memoire-redirection';
import type { IdCompte } from '../../compte/domaine/identite';
import { decoderPont, encoderPont } from './codec-pont';

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

  async demanderJeton(demande: DemandeJeton): Promise<Resultat<IssueDemandeJeton, ErreurAuth>> {
    const { pont, reseau, coffre, horloge } = this.dependances;
    if (!reseau.estConnecte()) return echec({ type: 'ReseauIndisponible' });
    const reponse = await pont(
      'demanderJeton',
      encoderPont([{ mode: demande.mode, portees: demande.portees, indice: demande.indice }]),
    );
    // Le pont rend le Resultat encodé par le Google simulé du processus cucumber (pont-faux-google.ts, D3).
    const resultat = decoderPont(reponse) as Resultat<AccesObtenu, ErreurAuth>;
    if (!resultat.ok) return resultat;
    coffre.placer({
      jeton: `jeton-test-ihm:${resultat.valeur.identite.compte}` as JetonAcces,
      echeance: EcartTemps.depuisMillisecondes(horloge.monotone() + VALIDITE_JETON_TEST_IHM_MS),
    });
    return succes({ type: 'ACCES_OBTENU', acces: resultat.valeur });
  }

  recevoirRetour(_p: {
    readonly retour: RetourGoogle;
    readonly depart: DepartMemorise | undefined;
    readonly compteAttendu: IdCompte;
  }): Promise<Resultat<RetourAccepte, ErreurAuth>> {
    return Promise.resolve(echec({ type: 'RetourRedirectionRejete', motif: 'SANS_DEPART' }));
  }

  oublier(): void {
    this.dependances.coffre.vider();
    void this.dependances.pont('oublier', encoderPont([]));
  }
}
