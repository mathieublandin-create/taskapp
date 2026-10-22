import { nonImplemente } from '@non-implemente';
import type { IdTache } from '../../../commun/domaine/identifiants';
import type { DecisionSurVue, EvaluationSurVue } from '../vue-metier';

// ST-US-003 §6.2 (RG-026 ; RG-027 complétée par DEC-030).
export const evaluerReouverture =
  (_c: { readonly tacheId: IdTache }): EvaluationSurVue =>
  () =>
    nonImplemente('evaluerReouverture');

export const deciderReouverture =
  (_c: { readonly tacheId: IdTache }): DecisionSurVue<void> =>
  () =>
    nonImplemente('deciderReouverture');
