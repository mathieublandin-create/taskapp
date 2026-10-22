import { nonImplemente } from '@non-implemente';
import type { IdObjectif, IdTache } from '../../commun/domaine/identifiants';
import type { VueMetier } from './vue-metier';

// Glossaire d'étapes v1.4 §7 ; ST-US-001 §4.1, ST-US-023 §6.4, ST-US-002 §6.5, ST-US-024 §6.5,
// ST-US-003 §6.3, ST-US-025 §6.3.
export type ActionObjectif =
  | 'RENOMMER'
  | 'MODIFIER_DESCRIPTION'
  | 'MODIFIER_DELAI'
  | 'RETIRER_DELAI'
  | 'SUPPRIMER'
  | 'PLACER'
  | 'CREER_SOUS_OBJECTIF';

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

export type ActionTache =
  | 'RENOMMER'
  | 'MODIFIER_DELAI'
  | 'MODIFIER_ESTIMATION'
  | 'RATTACHER'
  | 'DETACHER'
  | 'SUPPRIMER'
  | 'CREER_SOUS_TACHE'
  | 'TERMINER'
  | 'ROUVRIR'
  | 'ABANDONNER'
  | 'REPRENDRE';

/** ST-US-023 §6.4. */
export const actionsObjectif = (_vue: VueMetier, _id: IdObjectif): ReadonlyArray<ActionObjectif> =>
  nonImplemente('actionsObjectif');

/** ST-US-002 §6.5, ST-US-024 §6.5, ST-US-003 §6.3, ST-US-025 §6.3. */
export const actionsTache = (_vue: VueMetier, _id: IdTache): ReadonlyArray<ActionTache> =>
  nonImplemente('actionsTache');
