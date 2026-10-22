import { nonImplemente } from '@non-implemente';
import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { DecisionSurVue } from '../vue-metier';

// ST-US-001 §6.4 ; parent : ST-US-023 §6.2.
export type CommandeCreerObjectif = {
  readonly id: IdObjectif;
  readonly intitule: string;
  readonly description?: string;
  readonly delai?: DateCalendaire;
  readonly parentId?: IdObjectif;
};

export const deciderCreationObjectif =
  (_commande: CommandeCreerObjectif): DecisionSurVue<IdObjectif> =>
  () =>
    nonImplemente('deciderCreationObjectif');
