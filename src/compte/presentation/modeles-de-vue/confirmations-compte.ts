import { assertNever } from '../../../commun/domaine/assert-never';
import { libelle } from '../../../commun/presentation/messages/libelle';
import type { ConfirmationCompte } from '../../application/evaluation';

// ECR-011 ; guide d'ergonomie v0.2.17 §6.6.7 ; conventions.md §8.6. Textes : catalogue commun (`libelle`).
export type ModeleVueConfirmationCompte = {
  readonly code: ConfirmationCompte['code'];
  readonly titre: string;
  readonly texte?: string;
  readonly boutonAction: string;
  /** Action destructrice : bouton rouge, « Annuler » focalisé. */
  readonly rouge: boolean;
};

const avecTexte = (
  code: 'CNF-DECONNEXION' | 'CNF-SUPPR-DONNEES',
  texte: string,
  rouge: boolean,
) => ({
  code,
  titre: libelle(code),
  texte,
  boutonAction: libelle(code, {}, 'action'),
  rouge,
});

export const construireConfirmationCompte = (
  c: ConfirmationCompte,
): ModeleVueConfirmationCompte => {
  switch (c.code) {
    case 'CNF-DECONNEXION':
      return avecTexte(c.code, libelle(c.code, { n: c.n }, 'texte'), false);
    case 'CNF-SUPPR-DONNEES':
      return avecTexte(c.code, libelle(c.code, {}, 'texte'), true);
    case 'CNF-SUPPR-DONNEES-PERTE':
      return {
        code: c.code,
        titre: libelle(c.code, { n: c.n }),
        boutonAction: libelle(c.code, {}, 'action'),
        rouge: true,
      };
    default:
      return assertNever(c);
  }
};
