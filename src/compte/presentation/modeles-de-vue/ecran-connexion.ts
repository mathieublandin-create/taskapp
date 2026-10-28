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

type Message = {
  readonly titre: string;
  readonly texte: string;
  readonly action: ModeleVueConnexion['action'];
};

const ANNULEE =
  'Une connexion à un compte Google est nécessaire pour utiliser l’application. Rien n’a été créé.';

/**
 * Textes du guide d'ergonomie v0.2.16 §6.6.8. Le catalogue commun (`libelle`, rang 2) n'existe pas encore :
 * ces six textes y seront repris, et ce tableau remplacé par `libelle(code)` au rang 2.
 */
const MESSAGES: Readonly<Record<MotifEchecConnexion, Message>> = {
  'ERR-001': { titre: 'Connexion annulée', texte: ANNULEE, action: 'CONTINUER_AVEC_GOOGLE' },
  'ERR-002': { titre: 'Connexion annulée', texte: ANNULEE, action: 'CONTINUER_AVEC_GOOGLE' },
  'ERR-003': {
    titre: 'Pas de connexion à Internet',
    texte:
      'Une connexion est nécessaire pour vous connecter la première fois. Réessayez dès que vous avez du réseau. Rien n’a été créé.',
    action: 'REESSAYER',
  },
  'ERR-004': {
    titre: 'Pas de connexion à Internet',
    texte:
      'Une connexion est nécessaire pour vous connecter. Les données déjà enregistrées sur cet appareil sont conservées. Réessayez dès que vous avez du réseau.',
    action: 'REESSAYER',
  },
  'ERR-005': {
    titre: 'Connexion interrompue',
    texte: 'La connexion a été interrompue. Aucune donnée n’a été créée à moitié. Réessayez.',
    action: 'REESSAYER',
  },
  'ERR-006': {
    titre: 'Google Drive n’est pas disponible pour ce compte',
    texte:
      'C’est le cas, par exemple, d’un compte d’organisation sans accès au Drive. L’application en a besoin pour enregistrer vos données. Essayez avec un autre compte Google.',
    action: 'CHOISIR_UN_AUTRE_COMPTE',
  },
};

const PORTEES_ANNONCEES: ReadonlyArray<PorteeAnnoncee> = [
  'IDENTIFICATION_DU_COMPTE',
  'FICHIERS_DE_L_APPLICATION_DANS_LE_DRIVE',
];

export const construireEcranConnexion = (e: {
  readonly dernierEchec?: MotifEchecConnexion;
  readonly enCours: boolean;
}): ModeleVueConnexion => {
  const actionActive = !e.enCours;
  if (e.dernierEchec === undefined) {
    return { porteesAnnoncees: PORTEES_ANNONCEES, action: 'CONTINUER_AVEC_GOOGLE', actionActive };
  }
  const { titre, texte, action } = MESSAGES[e.dernierEchec];
  return {
    porteesAnnoncees: PORTEES_ANNONCEES,
    message: { code: e.dernierEchec, titre, texte },
    action,
    actionActive,
  };
};
