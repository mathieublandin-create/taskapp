import type { IdTache } from '../../../commun/domaine/identifiants';
import { succes } from '../../../commun/domaine/resultat';
import type { Modification } from '../../../synchronisation';
import { estimationEnVigueur } from '../estimation';
import {
  sousTachesDe,
  tacheActive,
  type DecisionSurVue,
  type EvaluationSurVue,
  type Tache,
  type VueMetier,
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

/** Dernière sous-tâche supprimée : l'estimation calculée devient celle de la tâche parente (H-3), même inchangée. */
const recopieDeLEstimation = (vue: VueMetier, tache: Tache): ReadonlyArray<Modification> => {
  const { tacheParenteId } = tache;
  if (tacheParenteId === undefined) return [];
  const freres = sousTachesDe(vue, tacheParenteId);
  if (freres.length !== 1 || freres[0]?.id !== tache.id) return [];
  const estimation = estimationEnVigueur(vue, tacheParenteId).duree;
  return [
    {
      type: 'ECRIRE_TACHE',
      id: tacheParenteId,
      ecriture: { champ: 'estimationInitiale', valeur: estimation },
      evenement: {
        type: 'MODIFICATION_ESTIMATION',
        element: { type: 'TACHE', id: tacheParenteId },
        avant: { estimation },
        apres: { estimation },
        rang: 1,
        cause: 0,
      },
    },
  ];
};

export const deciderSuppressionTache =
  (c: { readonly tacheId: IdTache }): DecisionSurVue<void> =>
  (vue) => {
    const tache = tacheActive(vue, c.tacheId);
    if (!tache.ok) return tache;
    const element = { type: 'TACHE', id: c.tacheId } as const;
    const suppression: Modification = {
      type: 'SUPPRIMER',
      element,
      evenement: { type: 'SUPPRESSION', element, avant: {}, apres: {}, rang: 0 },
    };
    return succes({
      modifications: [suppression, ...recopieDeLEstimation(vue, tache.valeur)],
      valeur: undefined,
    });
  };
