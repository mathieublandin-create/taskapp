import type { Instant } from '../../../commun/domaine/temps/instant';

// ST-US-022 §4.5 : entrée commune de l'indicateur et du bandeau.
export type EtatSynchronisationAffichable = {
  readonly reseau: 'CONNECTE' | 'COUPE';
  readonly acces: 'VALIDE' | 'A_RENOUVELER' | 'PERDU';
  readonly cycle: 'REPOS' | 'EN_COURS' | 'RETENTATIVE';
  readonly actionRequise?:
    'DRIVE_PLEIN' | 'DONNEES_ABSENTES' | 'FORMAT_PLUS_RECENT' | 'ECHEC_PERSISTANT';
  /** Décompte par élément (DAT §4.1.5 bis). */
  readonly enAttente: number;
  /** Heure de l'appareil. */
  readonly plusAncienneEnAttente?: Instant;
  readonly aLire: number;
  /** BAN-RAPPEL-24H fermé pendant cette ouverture (DEC-025, DEC-026). */
  readonly rappelMasque: boolean;
};
