import type { ConfirmationCompte } from '../../application/evaluation';

// ECR-011 ; guide d'ergonomie v0.2.17 §6.6.7 ; conventions.md §8.6.
export type ModeleVueConfirmationCompte = {
  readonly code: ConfirmationCompte['code'];
  readonly titre: string;
  readonly texte?: string;
  readonly boutonAction: string;
  /** Action destructrice : bouton rouge, « Annuler » focalisé. */
  readonly rouge: boolean;
};

const pluriel = (n: number, singulier: string, pluriel_: string): string =>
  n <= 1 ? singulier : pluriel_;

/**
 * Textes du guide (catalogue §6.6). Le catalogue commun (`libelle`, rang 2) les reprendra ; ce modèle de vue
 * l'appellera alors au lieu de ses gabarits.
 */
export const construireConfirmationCompte = (
  c: ConfirmationCompte,
): ModeleVueConfirmationCompte => {
  switch (c.code) {
    case 'CNF-DECONNEXION':
      return {
        code: c.code,
        titre: 'Se déconnecter ?',
        texte: `${String(c.n)} ${pluriel(c.n, 'modification n’est', 'modifications ne sont')} pas encore ${pluriel(c.n, 'enregistrée', 'enregistrées')} dans votre Google Drive. ${pluriel(c.n, 'Elle reste', 'Elles restent')} sur cet appareil et ${pluriel(c.n, 'sera enregistrée', 'seront enregistrées')} à votre prochaine connexion avec ce compte. Vos données ne sont pas effacées.`,
        boutonAction: 'Se déconnecter',
        rouge: false,
      };
    case 'CNF-SUPPR-DONNEES':
      return {
        code: c.code,
        titre: 'Supprimer les données de cet appareil ?',
        texte:
          'Les données restent dans votre Google Drive et sur l’autre appareil. Elles seront rechargées à la prochaine connexion, avec le réseau.',
        boutonAction: 'Supprimer les données',
        rouge: true,
      };
    case 'CNF-SUPPR-DONNEES-PERTE':
      return {
        code: c.code,
        titre: `${String(c.n)} ${pluriel(c.n, 'modification serait perdue', 'modifications seraient perdues')}`,
        boutonAction: 'Supprimer quand même',
        rouge: true,
      };
  }
};
