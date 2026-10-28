import type { AdresseGoogle } from '../../domaine/identite';
import type { SessionCourante } from '../session-courante';

// ST-US-022 §4.2 : données de la section « Compte » et de l'écran racine.
export type VueCompte = {
  readonly racine: 'CONNEXION' | 'ATTENTE_GOOGLE' | 'APPLICATION';
  readonly adresse?: AdresseGoogle;
};

export const consulterCompte = (session: SessionCourante): VueCompte => {
  const etat = session.etat();
  switch (etat.type) {
    case 'SANS_SESSION':
      return { racine: 'CONNEXION' };
    case 'ATTENTE_GOOGLE':
      return { racine: 'ATTENTE_GOOGLE', adresse: etat.identite.adresse };
    case 'OUVERTE':
      return { racine: 'APPLICATION', adresse: etat.identite.adresse };
  }
};
