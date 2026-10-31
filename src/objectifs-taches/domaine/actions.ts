import type { IdObjectif, IdTache } from '../../commun/domaine/identifiants';
import type { ActionObjectif, ActionTache } from './types-actions';
import { sousTachesDe, type VueMetier } from './vue-metier';

// Glossaire d'étapes v1.4 §7 ; ST-US-001 §4.1, ST-US-023 §6.4, ST-US-002 §6.5, ST-US-024 §6.5,
// ST-US-003 §6.3, ST-US-025 §6.3.
export type { ActionObjectif, ActionTache } from './types-actions';

/** Liste fermée : aucune action ne modifie l'état d'un objectif (US-001 CA-8). */
export const ACTIONS_OBJECTIF: ReadonlyArray<ActionObjectif> = [
  'RENOMMER',
  'MODIFIER_DESCRIPTION',
  'MODIFIER_DELAI',
  'RETIRER_DELAI',
  'SUPPRIMER',
  'PLACER',
  'CREER_SOUS_OBJECTIF',
];

/** ST-US-023 §6.4 : `RETIRER_DELAI` seulement avec un délai, `CREER_SOUS_OBJECTIF` seulement pour un principal. */
export const actionsObjectif = (vue: VueMetier, id: IdObjectif): ReadonlyArray<ActionObjectif> => {
  const objectif = vue.objectifs.get(id);
  if (objectif === undefined) return [];
  return [
    'RENOMMER',
    'MODIFIER_DESCRIPTION',
    'MODIFIER_DELAI',
    ...(objectif.delai === undefined ? [] : (['RETIRER_DELAI'] as const)),
    'PLACER',
    ...(objectif.parentId === undefined ? (['CREER_SOUS_OBJECTIF'] as const) : []),
    'SUPPRIMER',
  ];
};

/**
 * ST-US-002 §6.5 : `MODIFIER_ESTIMATION` sauf avec sous-tâches (champ verrouillé), `RATTACHER`, `DETACHER` et `CREER_SOUS_TACHE`
 * sauf pour une sous-tâche (objectifs verrouillés, un seul niveau, ST-US-024 §6.5). Cycle de vie : ST-US-003, 025.
 */
export const actionsTache = (vue: VueMetier, id: IdTache): ReadonlyArray<ActionTache> => {
  const tache = vue.taches.get(id);
  if (tache === undefined) return [];
  return [
    'RENOMMER',
    'MODIFIER_DELAI',
    ...(sousTachesDe(vue, id).length === 0 ? (['MODIFIER_ESTIMATION'] as const) : []),
    ...(tache.tacheParenteId === undefined
      ? (['RATTACHER', 'DETACHER', 'CREER_SOUS_TACHE'] as const)
      : []),
    'SUPPRIMER',
  ];
};
