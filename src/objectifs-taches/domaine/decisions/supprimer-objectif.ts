import type { IdObjectif } from '../../../commun/domaine/identifiants';
import { succes } from '../../../commun/domaine/resultat';
import {
  objectifActif,
  sousObjectifsDe,
  tachesDirectesDe,
  type DecisionSurVue,
  type EvaluationSurVue,
} from '../vue-metier';

// ST-US-001 §6.4 (RG-046) : la suppression n'écrit ni liens ni sous-objectifs, tout est dérivé à la lecture.
export const evaluerSuppressionObjectif =
  (c: { readonly objectifId: IdObjectif }): EvaluationSurVue =>
  (vue) => {
    const objectif = objectifActif(vue, c.objectifId);
    if (!objectif.ok) return objectif;
    return succes({
      type: 'CONFIRMATION_REQUISE',
      confirmation: {
        type: 'SUPPRESSION_OBJECTIF',
        objectifId: c.objectifId,
        intitule: objectif.valeur.intitule,
        tachesDetachees: tachesDirectesDe(vue, c.objectifId).length,
        sousObjectifsPromus: sousObjectifsDe(vue, c.objectifId).length,
      },
    });
  };

export const deciderSuppressionObjectif =
  (c: { readonly objectifId: IdObjectif }): DecisionSurVue<void> =>
  (vue) => {
    const objectif = objectifActif(vue, c.objectifId);
    if (!objectif.ok) return objectif;
    const element = { type: 'OBJECTIF', id: c.objectifId } as const;
    return succes({
      modifications: [
        {
          type: 'SUPPRIMER',
          element,
          evenement: { type: 'SUPPRESSION', element, avant: {}, apres: {}, rang: 0 },
        },
      ],
      valeur: undefined,
    });
  };
