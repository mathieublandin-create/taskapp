import { nonImplemente } from '@non-implemente';
import type { Duree } from '../../commun/domaine/duree';
import type { IdObjectif, IdTache } from '../../commun/domaine/identifiants';
import type { Marque } from '../../commun/domaine/marque';
import type { DateCalendaire } from '../../commun/domaine/temps/date-calendaire';
import type { Instant } from '../../commun/domaine/temps/instant';
import type { Hlc } from './hlc';
import type { IdEvenement } from './identifiant-evenement';

// DAT §4.2, §6.1 (ST-socle-ecriture.md §4.1.3).
export type TypeElement = 'OBJECTIF' | 'TACHE' | 'LIEN_TACHE_OBJECTIF';

/** `${IdTache}|${IdObjectif}` (DS-08, clé déterministe). */
export type IdLien = Marque<string, 'IdLien'>;
export const idLien = (_tacheId: IdTache, _objectifId: IdObjectif): IdLien =>
  nonImplemente('idLien');
export const partiesDuLien = (
  _id: IdLien,
): { readonly tacheId: IdTache; readonly objectifId: IdObjectif } => nonImplemente('partiesDuLien');

export type RefElementMetier =
  | { readonly type: 'OBJECTIF'; readonly id: IdObjectif }
  | { readonly type: 'TACHE'; readonly id: IdTache };

/** RG-048 : une création n'est jamais annulée. */
export type OrigineParent = 'CREATION' | 'DEPLACEMENT';

export type PlacementObjectif = {
  readonly parentId?: IdObjectif; // absent = objectif principal
  readonly origine: OrigineParent;
  readonly hlcOrigine: Hlc; // HLC de l'écriture d'origine
};

/** Registre unique (DAT §4.2), RG-026, RG-027. */
export type CycleDeVie =
  | { readonly etat: 'A_FAIRE' }
  | { readonly etat: 'TERMINEE'; readonly dateFin: DateCalendaire; readonly instantFin: Instant }
  | {
      readonly etat: 'ABANDONNEE';
      readonly dateAbandon: DateCalendaire;
      readonly instantAbandon: Instant;
      readonly evenementAbandon: IdEvenement; // entrée ABANDON de cette tâche
      readonly abandonParCascade?: IdEvenement; // entrée ABANDON de la tâche parente (US-025 CA-7)
    };

export type ValeursParChamp = {
  readonly OBJECTIF: {
    readonly creation: { readonly creeLe: Instant };
    readonly intitule: string;
    readonly description: string | undefined; // undefined = sans description
    readonly delai: DateCalendaire | undefined; // undefined = sans délai (RG-002)
    readonly parent: PlacementObjectif;
    readonly suppression: true; // pierre tombale (RG-046)
  };
  readonly TACHE: {
    readonly creation: { readonly creeLe: Instant; readonly tacheParenteId?: IdTache };
    readonly intitule: string;
    readonly delai: DateCalendaire; // RG-003
    readonly estimationInitiale: Duree; // RG-029 ; ignorée tant que la tâche a des sous-tâches
    readonly cycleDeVie: CycleDeVie;
    readonly suppression: true;
  };
  readonly LIEN_TACHE_OBJECTIF: { readonly actif: boolean }; // RG-001, H-1
};

export type ChampDe<T extends TypeElement> = keyof ValeursParChamp[T] & string;
export type IdDe<T extends TypeElement> = T extends 'OBJECTIF'
  ? IdObjectif
  : T extends 'TACHE'
    ? IdTache
    : IdLien;

export type CleInformation = {
  [T in TypeElement]: {
    [C in ChampDe<T>]: { readonly type: T; readonly id: IdDe<T>; readonly champ: C };
  }[ChampDe<T>];
}[TypeElement];

export type CleTexte = Marque<string, 'CleTexte'>;

/** `${type}/${id}/${champ}`. */
export const cleEnTexte = (_cle: CleInformation): CleTexte => nonImplemente('cleEnTexte');

/** LIEN (t|o) → { TACHE, t } ; sinon l'élément lui-même. */
export const elementDeCle = (_cle: CleInformation): RefElementMetier =>
  nonImplemente('elementDeCle');
