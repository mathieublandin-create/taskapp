/** Modifications du socle prêtes à l'emploi pour préparer un état (tests d'application). */
import type { Duree } from '@src/commun/domaine/duree';
import type { IdObjectif, IdTache } from '@src/commun/domaine/identifiants';
import type { DateCalendaire } from '@src/commun/domaine/temps/date-calendaire';
import type { Instant } from '@src/commun/domaine/temps/instant';
import type { CycleDeVie } from '@src/synchronisation/domaine/information';
import type { Modification } from '@src/synchronisation/domaine/modification';

export const creationObjectif = (
  p: {
    readonly id: IdObjectif;
    readonly intitule: string;
    readonly delai?: DateCalendaire;
    readonly parentId?: IdObjectif;
  },
  creeLe: Instant,
  rang = 0,
): Modification => ({
  type: 'CREER_OBJECTIF',
  id: p.id,
  creeLe,
  valeurs: {
    intitule: p.intitule,
    ...(p.delai === undefined ? {} : { delai: p.delai }),
    ...(p.parentId === undefined ? {} : { parentId: p.parentId }),
  },
  evenement: {
    type: 'CREATION',
    element: { type: 'OBJECTIF', id: p.id },
    avant: {},
    apres: {
      ...(p.delai === undefined ? {} : { delai: p.delai }),
      ...(p.parentId === undefined ? {} : { parentId: p.parentId }),
    },
    rang,
  },
});

export const creationTache = (
  p: {
    readonly id: IdTache;
    readonly intitule: string;
    readonly delai: DateCalendaire;
    readonly estimation: Duree;
    readonly objectifIds?: ReadonlyArray<IdObjectif>;
    readonly tacheParenteId?: IdTache;
  },
  creeLe: Instant,
  rang = 0,
): Modification => ({
  type: 'CREER_TACHE',
  id: p.id,
  creeLe,
  valeurs: {
    intitule: p.intitule,
    delai: p.delai,
    estimationInitiale: p.estimation,
    objectifIds: p.objectifIds ?? [],
    ...(p.tacheParenteId === undefined ? {} : { tacheParenteId: p.tacheParenteId }),
  },
  evenement: {
    type: 'CREATION',
    element: { type: 'TACHE', id: p.id },
    avant: {},
    apres: {
      delai: p.delai,
      estimation: p.estimation,
      objectifIds: p.objectifIds ?? [],
      ...(p.tacheParenteId === undefined ? {} : { tacheParenteId: p.tacheParenteId }),
    },
    rang,
  },
});

/** Écriture directe du registre cycleDeVie, sans événement (précondition). */
export const ecritureCycleDeVie = (id: IdTache, valeur: CycleDeVie): Modification => ({
  type: 'ECRIRE_TACHE',
  id,
  ecriture: { champ: 'cycleDeVie', valeur },
});
