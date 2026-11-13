import type { IdObjectif } from '../../../commun/domaine/identifiants';
import { succes } from '../../../commun/domaine/resultat';
import { verifierPlacement } from '../hierarchie-objectifs';
import type { DecisionSurVue } from '../vue-metier';

// ST-US-023 §6.2 (RG-022) ; parentId absent = objectif principal.
export const deciderPlacementObjectif =
  (c: { readonly objectifId: IdObjectif; readonly parentId?: IdObjectif }): DecisionSurVue<void> =>
  (vue) => {
    const issue = verifierPlacement(vue, c.objectifId, c.parentId);
    if (!issue.ok) return issue;
    if (issue.valeur === 'SANS_EFFET') return succes({ modifications: [], valeur: undefined });
    return succes({
      modifications: [
        {
          type: 'ECRIRE_OBJECTIF',
          id: c.objectifId,
          ecriture: { champ: 'parent', parentId: c.parentId },
          evenement: {
            type: 'CHANGEMENT_PARENT',
            element: { type: 'OBJECTIF', id: c.objectifId },
            rang: 0,
          },
        },
      ],
      valeur: undefined,
    });
  };
