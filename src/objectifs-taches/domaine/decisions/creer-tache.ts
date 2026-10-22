import { nonImplemente } from '@non-implemente';
import type { IdObjectif, IdTache } from '../../../commun/domaine/identifiants';
import type { SaisieTache } from '../saisie-tache';
import type { DecisionSurVue } from '../vue-metier';

// ST-US-002 §6.2.
export type CommandeCreerTache = {
  readonly id: IdTache;
  readonly saisie: SaisieTache;
  readonly objectifIds: ReadonlyArray<IdObjectif>;
};

export const deciderCreationTache =
  (_c: CommandeCreerTache): DecisionSurVue<IdTache> =>
  () =>
    nonImplemente('deciderCreationTache');
