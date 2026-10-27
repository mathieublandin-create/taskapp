import { nonImplemente } from '@non-implemente';
import type { MotifEchecConnexion } from '../../domaine/motif-connexion';

// ECR-010 ; guide §6.6.8 ; US-022 CA-1, CA-4, CA-8.
export type PorteeAnnoncee = 'IDENTIFICATION_DU_COMPTE' | 'FICHIERS_DE_L_APPLICATION_DANS_LE_DRIVE';

export type ModeleVueConnexion = {
  readonly porteesAnnoncees: ReadonlyArray<PorteeAnnoncee>;
  readonly message?: {
    readonly code: MotifEchecConnexion;
    readonly titre: string;
    readonly texte: string;
  };
  readonly action: 'CONTINUER_AVEC_GOOGLE' | 'REESSAYER' | 'CHOISIR_UN_AUTRE_COMPTE';
  readonly actionActive: boolean;
};

export const construireEcranConnexion = (_e: {
  readonly dernierEchec?: MotifEchecConnexion;
  readonly enCours: boolean;
}): ModeleVueConnexion => nonImplemente('construireEcranConnexion');
