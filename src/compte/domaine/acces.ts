import { nonImplemente } from '@non-implemente';
import { EcartTemps } from '../../commun/domaine/temps/ecart-temps';

// DAT §4.1.5, §4.1.6 bis ; ADR-013 (ST-US-022 §6.3).
export type EtatAcces = 'VALIDE' | 'A_RENOUVELER' | 'PERDU';

/** DAT §4.1.6 bis : un 401 à moins de 60 s de l'échéance n'est pas une preuve de retrait. */
export const MARGE_ECHEANCE_JETON = EcartTemps.depuisMillisecondes(60_000);

export type IssueRetourGoogle =
  | 'JETON'
  | 'ERREUR_INTERACTION'
  | 'ERREUR_CONFIGURATION'
  | 'REFUS'
  | 'PORTEES_PARTIELLES'
  | 'RETOUR_REJETE'
  | 'ANNULATION'
  | 'ERREUR_TECHNIQUE';

export type OrigineDemande = 'OUVERTURE' | 'GESTE';

export const accesApresRetour = (_p: {
  readonly avant: EtatAcces;
  readonly issue: IssueRetourGoogle;
  readonly origine: OrigineDemande;
}): EtatAcces => nonImplemente('accesApresRetour');

/** Échéances sur l'horloge monotone. */
export const qualifierRefusJeton = (_p: {
  readonly echeance: EcartTemps | undefined;
  readonly maintenant: EcartTemps;
}): 'A_RENOUVELER' | 'PERDU' => nonImplemente('qualifierRefusJeton');
