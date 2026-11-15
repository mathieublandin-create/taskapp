import type { EtatSession } from '../../application/session-courante';

// ST-US-022 §4.5 ; US-022 CA-1 (RG-019) ; guide v0.2.15 §6.6.2 (SYN-REDIRECTION, 10 s au plus).
/** ANO-004 : l'ouverture a-t-elle décidé ? Tant qu'elle est en cours, l'absence de session n'est pas établie. */
export type EtatOuverture = 'EN_COURS' | 'ETABLIE';

export type ModeleVueRacine =
  | { readonly ecran: 'OUVERTURE' }
  | { readonly ecran: 'CONNEXION' }
  | {
      readonly ecran: 'ATTENTE_GOOGLE';
      readonly etat: 'SYN-REDIRECTION';
      /** Nom accessible de la zone `role="status"`. */
      readonly nomAccessible: 'Connexion à Google en cours';
    }
  | { readonly ecran: 'APPLICATION' };

export const construireRacine = (
  etat: EtatSession,
  ouverture: EtatOuverture = 'ETABLIE',
): ModeleVueRacine => {
  switch (etat.type) {
    case 'SANS_SESSION':
      return ouverture === 'EN_COURS' ? { ecran: 'OUVERTURE' } : { ecran: 'CONNEXION' };
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
