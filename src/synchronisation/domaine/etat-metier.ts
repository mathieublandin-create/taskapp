import type { Duree } from '../../commun/domaine/duree';
import type { IdObjectif, IdTache } from '../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../commun/domaine/temps/date-calendaire';
import type { Instant } from '../../commun/domaine/temps/instant';
import type { CycleDeVie } from './information';

export type { CycleDeVie } from './information';

// Projection lue par les contextes métier, sans HLC ni contexte (ST-socle-ecriture.md §4.1.5).
export type ObjectifEnregistre = {
  readonly id: IdObjectif;
  readonly intitule: string;
  readonly description?: string;
  readonly delai?: DateCalendaire;
  readonly parentIdEnregistre?: IdObjectif; // valeur gagnante, sans dérivation RG-046
  readonly creeLe: Instant;
  readonly supprime: boolean;
  readonly enAttente: boolean;
};

export type TacheEnregistree = {
  readonly id: IdTache;
  readonly intitule: string;
  readonly delai: DateCalendaire;
  readonly estimationInitiale: Duree;
  readonly cycleDeVie: CycleDeVie;
  readonly tacheParenteId?: IdTache;
  /** Liens actifs, par HLC croissant de l'écriture actif = true ; objectifs supprimés compris. */
  readonly objectifIdsActifs: ReadonlyArray<IdObjectif>;
  readonly creeLe: Instant;
  readonly supprime: boolean;
  readonly enAttente: boolean;
};

export type EtatMetier = {
  readonly objectifs: ReadonlyMap<IdObjectif, ObjectifEnregistre>; // supprimés compris
  readonly taches: ReadonlyMap<IdTache, TacheEnregistree>; // supprimées compris
};
