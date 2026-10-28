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

/** Une erreur sans preuve ne change jamais un accès perdu en accès à renouveler, ni l'inverse. */
const sansPreuve = (avant: EtatAcces): EtatAcces => (avant === 'PERDU' ? 'PERDU' : 'A_RENOUVELER');

export const accesApresRetour = (p: {
  readonly avant: EtatAcces;
  readonly issue: IssueRetourGoogle;
  readonly origine: OrigineDemande;
}): EtatAcces => {
  switch (p.issue) {
    case 'JETON':
      return 'VALIDE';
    case 'PORTEES_PARTIELLES':
      return 'PERDU';
    case 'REFUS':
      // EC-7 : sans geste, access_denied ne prouve pas un retrait.
      return p.origine === 'GESTE' ? 'PERDU' : sansPreuve(p.avant);
    case 'ANNULATION':
      return p.avant;
    case 'ERREUR_INTERACTION':
    case 'ERREUR_CONFIGURATION':
    case 'RETOUR_REJETE':
    case 'ERREUR_TECHNIQUE':
      return sansPreuve(p.avant);
  }
};

/** Échéances sur l'horloge monotone. */
export const qualifierRefusJeton = (p: {
  readonly echeance: EcartTemps | undefined;
  readonly maintenant: EcartTemps;
}): 'A_RENOUVELER' | 'PERDU' => {
  if (p.echeance === undefined) return 'A_RENOUVELER';
  return p.maintenant >= p.echeance - MARGE_ECHEANCE_JETON ? 'A_RENOUVELER' : 'PERDU';
};
