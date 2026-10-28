import type { EtatReseau } from '../../../commun/application/ports/etat-reseau';
import { ErreurProgrammation } from '../../../commun/domaine/erreur-programmation';
import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import type { Identite } from '../../domaine/identite';
import {
  motifEchecConnexion,
  type CauseEchecConnexion,
  type MotifEchecConnexion,
} from '../../domaine/motif-connexion';
import { PORTEES_LOT_1 } from '../../domaine/portees';
import type { ErreurAuth, FournisseurAuth } from '../ports/fournisseur-auth';
import type { ErreurEspace, GestionEspaces } from '../ports/gestion-espaces';
import { REPRISE_ACCUEIL } from '../ports/memoire-redirection';
import type { MemoireSession } from '../ports/memoire-session';
import type { ErreurPreparation, PreparationStockage } from '../ports/preparation-stockage';
import type { SessionCourante } from '../session-courante';

// ST-US-022 §6.7 (CA-2 à CA-4 ; cas limites de connexion).
export type ErreurConnexion =
  { readonly type: 'ConnexionImpossible'; readonly motif: MotifEchecConnexion } | ErreurEspace;

export type DependancesSeConnecter = {
  readonly reseau: EtatReseau;
  readonly fournisseur: FournisseurAuth;
  readonly preparation: PreparationStockage;
  readonly espaces: GestionEspaces;
  readonly memoireSession: MemoireSession;
  readonly session: SessionCourante;
};

const causeErreurAuth = (erreur: ErreurAuth): CauseEchecConnexion => {
  if (erreur.type === 'ConnexionAnnulee') return 'ANNULEE';
  if (erreur.type === 'PorteeInsuffisante') return 'PORTEES_REFUSEES';
  return 'INTERROMPUE';
};

const causePreparation = (erreur: ErreurPreparation): CauseEchecConnexion => {
  switch (erreur.type) {
    case 'DriveIndisponiblePourLeCompte':
      return 'DRIVE_INDISPONIBLE_POUR_LE_COMPTE';
    case 'DriveMomentanementIndisponible':
      return 'DRIVE_MOMENTANEMENT_INDISPONIBLE';
    case 'ReseauInterrompu':
      return 'INTERROMPUE';
  }
};

/** Rien n'est écrit sur l'appareil (espace, session) avant l'étape 4 : un échec antérieur ne crée rien. */
export class SeConnecter {
  constructor(private readonly dependances: DependancesSeConnecter) {}

  async executer(): Promise<Resultat<Identite, ErreurConnexion>> {
    const { reseau, fournisseur, preparation, espaces } = this.dependances;
    if (!reseau.estConnecte()) return this.#echouer('HORS_LIGNE');
    const demande = await fournisseur.demanderJeton({
      mode: 'CONNEXION',
      portees: PORTEES_LOT_1,
      reprise: REPRISE_ACCUEIL,
      redirectionPermise: false,
    });
    if (!demande.ok) return this.#echouer(causeErreurAuth(demande.erreur));
    if (demande.valeur.type !== 'ACCES_OBTENU') {
      throw new ErreurProgrammation('Connexion par redirection hors du lot 1 (EPI-001)');
    }
    const preparation_ = await preparation.preparer();
    if (!preparation_.ok) return this.#echouer(causePreparation(preparation_.erreur));
    const { identite } = demande.valeur.acces;
    const ouverture = await espaces.ouvrir(identite.compte);
    if (!ouverture.ok) {
      fournisseur.oublier();
      return echec(ouverture.erreur);
    }
    await this.dependances.memoireSession.ecrire({ identite, accesPerdu: false });
    this.dependances.session.ouvrir(identite, 'VALIDE');
    return succes(identite);
  }

  async #echouer(cause: CauseEchecConnexion): Promise<Resultat<Identite, ErreurConnexion>> {
    const espaceLocalExistant =
      cause === 'HORS_LIGNE' ? await this.dependances.espaces.existeUnEspace() : false;
    if (cause !== 'HORS_LIGNE') this.dependances.fournisseur.oublier();
    return echec({
      type: 'ConnexionImpossible',
      motif: motifEchecConnexion(cause, { espaceLocalExistant }),
    });
  }
}
