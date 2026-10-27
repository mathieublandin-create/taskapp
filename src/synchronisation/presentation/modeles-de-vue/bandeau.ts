import { nonImplemente } from '@non-implemente';
import type { Instant } from '../../../commun/domaine/temps/instant';
import type { EtatSynchronisationAffichable } from './etat-synchronisation-affichable';

// Guide §6.6.3, DAT §4.1.5 bis, DEC-025 : au plus un bandeau ; ordre BAN-ACCES-GOOGLE > BAN-CONSULTATION-SEULE > BAN-RAPPEL-24H.
export type ModeleVueBandeau = {
  readonly code: 'BAN-ACCES-GOOGLE' | 'BAN-CONSULTATION-SEULE' | 'BAN-RAPPEL-24H';
  readonly variante?: '24H' | 'session';
  readonly n?: number;
  readonly action?: 'SE_RECONNECTER' | 'METTRE_A_JOUR' | 'REPRENDRE_LA_SYNCHRONISATION';
  readonly fermable: boolean;
  readonly bloquant: false;
  readonly message: 'ERR-010' | 'ERR-013' | 'ALR-002';
};

export const construireBandeau = (
  _e: EtatSynchronisationAffichable,
  _maintenant: Instant,
): ModeleVueBandeau | undefined => nonImplemente('construireBandeau');
