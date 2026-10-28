import { assertNever } from '../../../commun/domaine/assert-never';
import type { CodeCatalogue } from '../../../commun/presentation/messages/codes';
import { libelle, type VariablesLibelle } from '../../../commun/presentation/messages/libelle';
import type { ConfirmationRequise } from '../../domaine/confirmation';

// ST-US-001 §6.5 ; ST-US-002, 024, 003, 025 : codes CNF-….
export type ModeleVueConfirmation = {
  readonly code: CodeCatalogue;
  readonly variables: VariablesLibelle;
  readonly titre: string;
  readonly texte?: string;
  readonly actionLibelle: string;
};

const GABARITS_SANS_TEXTE: ReadonlyArray<CodeCatalogue> = [
  'CNF-SUPPR-TACHE',
  'CNF-AJOUT-SOUS-TACHE-TERMINEE',
  'CNF-ROUVRIR-SOUS-TACHE',
];

const modele = (code: CodeCatalogue, variables: VariablesLibelle): ModeleVueConfirmation => ({
  code,
  variables,
  titre: libelle(code, variables),
  ...(GABARITS_SANS_TEXTE.includes(code) ? {} : { texte: libelle(code, variables, 'texte') }),
  actionLibelle: libelle(code, variables, 'action'),
});

const abandon = (intitule: string, sousTachesAbandonnees: number): ModeleVueConfirmation =>
  sousTachesAbandonnees === 0
    ? modele('CNF-ABANDON-TACHE', { element: intitule })
    : modele('CNF-ABANDON-TACHE-CASCADE', { element: intitule, n: sousTachesAbandonnees });

export const construireConfirmation = (c: ConfirmationRequise): ModeleVueConfirmation => {
  switch (c.type) {
    case 'SUPPRESSION_OBJECTIF':
      return modele('CNF-SUPPR-OBJECTIF', {
        element: c.intitule,
        taches: c.tachesDetachees,
        sousObjectifs: c.sousObjectifsPromus,
      });
    case 'SUPPRESSION_TACHE':
      return modele('CNF-SUPPR-TACHE', {
        element: c.intitule,
        n: c.sousTaches,
        ...(c.sousTaches === 0 ? { variante: 'sans-sous-tache' } : {}),
      });
    case 'AJOUT_SOUS_TACHE_TERMINEE':
      return modele('CNF-AJOUT-SOUS-TACHE-TERMINEE', { element: c.intitule });
    case 'REOUVERTURE_SOUS_TACHE':
      return modele('CNF-ROUVRIR-SOUS-TACHE', { element: c.intitule });
    case 'ABANDON_TACHE':
      return abandon(c.intitule, c.sousTachesAbandonnees);
    case 'REPRISE_SOUS_TACHE':
      return modele('CNF-REPRENDRE-SOUS-TACHE', {
        element: c.intitule,
        tacheParente: c.intituleTacheParente,
      });
    default:
      return assertNever(c);
  }
};
