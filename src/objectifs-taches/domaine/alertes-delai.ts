import type { IdObjectif, IdTache } from '../../commun/domaine/identifiants';
import { DateCalendaire } from '../../commun/domaine/temps/date-calendaire';
import { objectifsDirectsDe, type Objectif, type Tache, type VueMetier } from './vue-metier';

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
  const parent =
    objectif?.parentId === undefined ? undefined : vue.objectifs.get(objectif.parentId);
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

/** Objectifs de la tâche, ou ceux de sa tâche parente pour une sous-tâche (RG-023), dans l'ordre de rattachement. */
const objectifsConcernes = (vue: VueMetier, tache: Tache): ReadonlyArray<Objectif> =>
  objectifsDirectsDe(vue, tache.tacheParenteId ?? tache.id);

/** Objectifs dont le délai est dépassé par celui de la tâche, dans l'ordre de rattachement (RG-024). */
const objectifsDepasses = (
  objectifs: ReadonlyArray<Objectif>,
  delaiTache: DateCalendaire,
): ReadonlyArray<{ id: IdObjectif; intitule: string; delai: DateCalendaire }> =>
  objectifs.flatMap(({ id, intitule, delai }) =>
    delai !== undefined && DateCalendaire.comparer(delaiTache, delai) > 0
      ? [{ id, intitule, delai }]
      : [],
  );

export const alertesDelaiTache = (vue: VueMetier, id: IdTache): ReadonlyArray<AlerteDelaiTache> => {
  const tache = vue.taches.get(id);
  if (tache === undefined) return [];
  const depasses = objectifsDepasses(objectifsConcernes(vue, tache), tache.delai);
  const parente =
    tache.tacheParenteId === undefined ? undefined : vue.taches.get(tache.tacheParenteId);
  return [
    ...(depasses.length === 0 ? [] : [{ type: 'OBJECTIFS', objectifs: depasses } as const]),
    ...(parente !== undefined && DateCalendaire.comparer(tache.delai, parente.delai) > 0
      ? [
          {
            type: 'TACHE_PARENTE',
            tache: { id: parente.id, intitule: parente.intitule, delai: parente.delai },
          } as const,
        ]
      : []),
  ];
};
