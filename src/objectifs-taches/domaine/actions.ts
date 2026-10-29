import { nonImplemente } from '@non-implemente';
import type { IdObjectif, IdTache } from '../../commun/domaine/identifiants';
import type { ActionObjectif, ActionTache } from './types-actions';
import type { VueMetier } from './vue-metier';

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

/** ST-US-002 §6.5, ST-US-024 §6.5, ST-US-003 §6.3, ST-US-025 §6.3. */
export const actionsTache = (_vue: VueMetier, _id: IdTache): ReadonlyArray<ActionTache> =>
  nonImplemente('actionsTache');
