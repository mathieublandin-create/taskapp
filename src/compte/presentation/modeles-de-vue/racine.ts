import type { EtatSession } from '../../application/session-courante';

// ST-US-022 §4.5 ; US-022 CA-1 (RG-019) ; guide v0.2.15 §6.6.2 (SYN-REDIRECTION, 10 s au plus).
export type ModeleVueRacine =
  | { readonly ecran: 'CONNEXION' }
  | {
      readonly ecran: 'ATTENTE_GOOGLE';
      readonly etat: 'SYN-REDIRECTION';
      /** Nom accessible de la zone `role="status"`. */
      readonly nomAccessible: 'Connexion à Google en cours';
    }
  | { readonly ecran: 'APPLICATION' };

export const construireRacine = (etat: EtatSession): ModeleVueRacine => {
  switch (etat.type) {
    case 'SANS_SESSION':
      return { ecran: 'CONNEXION' };
    case 'ATTENTE_GOOGLE':
      return {
        ecran: 'ATTENTE_GOOGLE',
        etat: 'SYN-REDIRECTION',
        nomAccessible: 'Connexion à Google en cours',
      };
    case 'OUVERTE':
      return { ecran: 'APPLICATION' };
  }
};
