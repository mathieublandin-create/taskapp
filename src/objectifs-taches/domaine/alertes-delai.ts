import { nonImplemente } from '@non-implemente';
import type { IdObjectif, IdTache } from '../../commun/domaine/identifiants';
import { DateCalendaire } from '../../commun/domaine/temps/date-calendaire';
import type { VueMetier } from './vue-metier';

// RG-022 (ST-US-023 §6.3) : ALR-007.
export type AlerteDelaiObjectif = {
  readonly parentId: IdObjectif;
  readonly parentIntitule: string;
  readonly delaiParent: DateCalendaire;
};

/** Recalculée à chaque lecture : aucune écriture (ST-US-023 §6.3). Égalité de délais : pas d'alerte. */
export const alerteDelaiObjectif = (
  vue: VueMetier,
  id: IdObjectif,
): AlerteDelaiObjectif | undefined => {
  const objectif = vue.objectifs.get(id);
  const parent = objectif?.parentId === undefined ? undefined : vue.objectifs.get(objectif.parentId);
  if (objectif?.delai === undefined || parent?.delai === undefined) return undefined;
  if (DateCalendaire.comparer(objectif.delai, parent.delai) <= 0) return undefined;
  return { parentId: parent.id, parentIntitule: parent.intitule, delaiParent: parent.delai };
};

// RG-024, RG-023 (ST-US-002 §6.3) : ALR-005 et ALR-006.
export type AlerteDelaiTache =
  | {
      readonly type: 'OBJECTIFS';
      readonly objectifs: ReadonlyArray<{
        readonly id: IdObjectif;
        readonly intitule: string;
        readonly delai: DateCalendaire;
      }>;
    }
  | {
      readonly type: 'TACHE_PARENTE';
      readonly tache: {
        readonly id: IdTache;
        readonly intitule: string;
        readonly delai: DateCalendaire;
      };
    };

export const alertesDelaiTache = (_vue: VueMetier, _id: IdTache): ReadonlyArray<AlerteDelaiTache> =>
  nonImplemente('alertesDelaiTache');
