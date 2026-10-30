import type { IdTache } from '../../../commun/domaine/identifiants';
import { succes } from '../../../commun/domaine/resultat';
import {
  sousTachesDe,
  tacheActive,
  type DecisionSurVue,
  type EvaluationSurVue,
} from '../vue-metier';

// ST-US-002 §6.2 (RG-046) : les sous-tâches sont supprimées par dérivation, aucune écriture sur elles.
// Recopie de l'estimation dans la tâche parente : ST-US-024 §6.3 (H-3).
export const evaluerSuppressionTache =
  (c: { readonly tacheId: IdTache }): EvaluationSurVue =>
  (vue) => {
    const tache = tacheActive(vue, c.tacheId);
    if (!tache.ok) return tache;
    return succes({
      type: 'CONFIRMATION_REQUISE',
      confirmation: {
        type: 'SUPPRESSION_TACHE',
        tacheId: c.tacheId,
        intitule: tache.valeur.intitule,
        sousTaches: sousTachesDe(vue, c.tacheId).length,
      },
    });
  };

export const deciderSuppressionTache =
  (c: { readonly tacheId: IdTache }): DecisionSurVue<void> =>
  (vue) => {
    const tache = tacheActive(vue, c.tacheId);
    if (!tache.ok) return tache;
    const element = { type: 'TACHE', id: c.tacheId } as const;
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
