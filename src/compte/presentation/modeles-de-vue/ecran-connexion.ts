import { libelle } from '../../../commun/presentation/messages/libelle';
import type { MotifEchecConnexion } from '../../domaine/motif-connexion';

// ECR-010 ; guide §6.6.8 ; US-022 CA-1, CA-4, CA-8. Textes : catalogue commun (`libelle`).
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

/** Action proposée par chaque motif (guide §6.6.8). */
const ACTIONS: Readonly<Record<MotifEchecConnexion, ModeleVueConnexion['action']>> = {
  'ERR-001': 'CONTINUER_AVEC_GOOGLE',
  'ERR-002': 'CONTINUER_AVEC_GOOGLE',
  'ERR-003': 'REESSAYER',
  'ERR-004': 'REESSAYER',
  'ERR-005': 'REESSAYER',
  'ERR-006': 'CHOISIR_UN_AUTRE_COMPTE',
};

/** Le libellé d'une action est celui du code d'erreur qui la propose, ou d'ERR-001 pour l'invitation initiale. */
const CODE_DU_LIBELLE: Readonly<Record<ModeleVueConnexion['action'], MotifEchecConnexion>> = {
  CONTINUER_AVEC_GOOGLE: 'ERR-001',
  REESSAYER: 'ERR-003',
  CHOISIR_UN_AUTRE_COMPTE: 'ERR-006',
};

const PORTEES_ANNONCEES: ReadonlyArray<PorteeAnnoncee> = [
  'IDENTIFICATION_DU_COMPTE',
  'FICHIERS_DE_L_APPLICATION_DANS_LE_DRIVE',
];

export const libelleActionConnexion = (action: ModeleVueConnexion['action']): string =>
  libelle(CODE_DU_LIBELLE[action], {}, 'action');

export const construireEcranConnexion = (e: {
  readonly dernierEchec?: MotifEchecConnexion;
  readonly enCours: boolean;
}): ModeleVueConnexion => {
  const actionActive = !e.enCours;
  if (e.dernierEchec === undefined) {
    return { porteesAnnoncees: PORTEES_ANNONCEES, action: 'CONTINUER_AVEC_GOOGLE', actionActive };
  }
  return {
    porteesAnnoncees: PORTEES_ANNONCEES,
    message: {
      code: e.dernierEchec,
      titre: libelle(e.dernierEchec),
      texte: libelle(e.dernierEchec, {}, 'texte'),
    },
    action: ACTIONS[e.dernierEchec],
    actionActive,
  };
};
