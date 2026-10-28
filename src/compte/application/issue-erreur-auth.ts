import type { IssueRetourGoogle } from '../domaine/acces';
import type { ErreurAuth } from './ports/fournisseur-auth';

const ISSUES: Readonly<Record<ErreurAuth['type'], IssueRetourGoogle>> = {
  SessionARenouveler: 'ERREUR_INTERACTION',
  ConfigurationOAuthInvalide: 'ERREUR_CONFIGURATION',
  RetourRedirectionRejete: 'RETOUR_REJETE',
  AccesGoogleRevoque: 'REFUS',
  PorteeInsuffisante: 'PORTEES_PARTIELLES',
  ConnexionAnnulee: 'ANNULATION',
  CompteDifferent: 'ERREUR_TECHNIQUE',
  MemoireTechniqueIndisponible: 'ERREUR_TECHNIQUE',
  ReseauIndisponible: 'ERREUR_TECHNIQUE',
  RedirectionNonPermise: 'ERREUR_TECHNIQUE',
};

/** ST-US-022 §6.2 (`issueDe`) : traduit un échec du fournisseur en issue de la table du §6.3. */
export const issueDeErreurAuth = (erreur: ErreurAuth): IssueRetourGoogle => ISSUES[erreur.type];
