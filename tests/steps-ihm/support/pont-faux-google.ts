/**
 * Côté processus cucumber du pont Google de la composition `test-ihm` (ST-US-018 v0.4 §6.5) : une
 * `FauxFournisseurAuth` pour l'appareil piloté par le navigateur décide de la réponse (session Google active, accès
 * accordé ou retiré), comme pour un appareil du banc. Aucune redirection n'atteint la page : un retour de redirection
 * silencieuse est converti en accès obtenu ou en erreur, comme le ferait le fournisseur réel (`erreurDuRetour`).
 */
import { IDBFactory } from 'fake-indexeddb';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import { echec, succes, type Resultat } from '@src/commun/domaine/resultat';
import type {
  AccesObtenu,
  DemandeJeton,
  ErreurAuth,
} from '@src/compte/application/ports/fournisseur-auth';
import { REPRISE_ACCUEIL } from '@src/compte/application/ports/memoire-redirection';
import type { Identite } from '@src/compte/domaine/identite';
import { erreurDuRetour } from '@src/compte/infrastructure/auth/fournisseur-auth-web';
import { BaseTechnique, MemoireRedirectionDexie } from '@src/compte/infrastructure/base-technique';
import { decoderPont, encoderPont } from '@src/composition/test-ihm/codec-pont';
import { FauxFournisseurAuth } from '../../doublures/faux-fournisseur-auth';
import type { FauxGoogle, NomCompte } from '../../doublures/faux-google';
import { HorlogeSimulee } from '../../doublures/horloge-simulee';
import { ENV_BANC } from '../../support/banc/appareil-simule';
import type { TempsSimule } from '../../support/banc/temps-simule';

/** Ce que la page envoie : `encoderPont([{ mode, portees, indice? }])` (`FournisseurAuthTestIhm`). */
type DemandePont = Pick<DemandeJeton, 'mode' | 'portees' | 'indice'>;

const demandeDuPont = (argumentsJson: string): DemandeJeton => {
  const decodes = decoderPont(argumentsJson);
  const [demande] = Array.isArray(decodes) ? (decodes as ReadonlyArray<DemandePont>) : [];
  if (demande === undefined) throw new ErreurProgrammation('demanderJeton : demande attendue');
  return { ...demande, reprise: REPRISE_ACCUEIL, redirectionPermise: false };
};

export class PontFauxGoogle {
  readonly #fournisseur: FauxFournisseurAuth;
  #identite: Identite | undefined;
  #compteConnecte: NomCompte | undefined;

  constructor(
    private readonly google: FauxGoogle,
    temps: TempsSimule,
  ) {
    this.#fournisseur = new FauxFournisseurAuth({
      memoireRedirection: new MemoireRedirectionDexie(
        new BaseTechnique({ env: ENV_BANC, fabrique: new IDBFactory() }),
      ),
      horloge: new HorlogeSimulee(temps),
    });
  }

  /** Le navigateur est connecté à Google avec ce compte, et l'application y a accès. */
  ouvrirSession(nomCompte: NomCompte): void {
    this.#identite = this.google.identite(nomCompte);
    this.#fournisseur.sessionGoogle(this.#identite);
    this.#fournisseur.accorder(this.#identite);
  }

  /** Compte dont le jeton est en mémoire dans la page : le Drive auquel elle s'adresse. */
  compteConnecte(): NomCompte | undefined {
    return this.#compteConnecte;
  }

  /** Réponse au binding `donejuanFauxGoogle(methode, argumentsJson)`. */
  async repondre(methode: string, argumentsJson: string): Promise<string> {
    if (methode === 'oublier') {
      this.#fournisseur.oublier();
      this.#compteConnecte = undefined;
      return encoderPont(null);
    }
    if (methode !== 'demanderJeton') {
      throw new ErreurProgrammation(`Méthode inconnue du pont Google : ${methode}`);
    }
    const resultat = await this.#demanderJeton(demandeDuPont(argumentsJson));
    if (resultat.ok) this.#compteConnecte = this.google.nomDe(resultat.valeur.identite);
    return encoderPont(resultat);
  }

  async #demanderJeton(demande: DemandeJeton): Promise<Resultat<AccesObtenu, ErreurAuth>> {
    const issue = await this.#fournisseur.demanderJeton(demande);
    if (!issue.ok) return issue;
    if (issue.valeur.type === 'ACCES_OBTENU') return succes(issue.valeur.acces);
    return this.#issueDeLaRedirection();
  }

  /** Retour que Google placerait dans le fragment après une redirection silencieuse d'ouverture. */
  #issueDeLaRedirection(): Resultat<AccesObtenu, ErreurAuth> {
    const retour = this.#fournisseur.acheverRedirection();
    if (retour.type === 'ERREUR')
      return echec(erreurDuRetour(retour.code, 'RENOUVELLEMENT_OUVERTURE'));
    if (retour.type !== 'JETON' || this.#identite === undefined) {
      throw new ErreurProgrammation('Retour de redirection simulé inattendu');
    }
    return succes({ porteesAccordees: retour.portees, identite: this.#identite });
  }
}
