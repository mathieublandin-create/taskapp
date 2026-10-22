import { nonImplemente } from '@non-implemente';
import type { IdTache } from '../../../commun/domaine/identifiants';
import type { SaisieTache } from '../saisie-tache';
import type { DecisionSurVue, EvaluationSurVue } from '../vue-metier';

// ST-US-024 §6.1 (RG-023).
export type CommandeCreerSousTache = {
  readonly id: IdTache;
  readonly tacheParenteId: IdTache;
  readonly saisie: SaisieTache;
};

export const evaluerCreationSousTache =
  (_c: CommandeCreerSousTache): EvaluationSurVue =>
  () =>
    nonImplemente('evaluerCreationSousTache');

export const deciderCreationSousTache =
  (_c: CommandeCreerSousTache): DecisionSurVue<IdTache> =>
  () =>
    nonImplemente('deciderCreationSousTache');
