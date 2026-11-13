import type { Lecture } from './lectures';
import type { IdValeurEcartee, ValeurEcartee } from './valeurs-ecartees';

// ST-US-017 v0.5 §4.6 : données synchronisées hors des registres (valeurs écartées et lectures), stockées dans les
// tables Dexie `valeursEcartees` et `lectures` (§5.1, version 3) et dans les tableaux du fichier d'appareil (§5.2).

export type Signalements = {
  readonly valeursEcartees: ReadonlyMap<IdValeurEcartee, ValeurEcartee>;
  readonly lectures: ReadonlyMap<IdValeurEcartee, Lecture>;
};

export const SIGNALEMENTS_VIDES: Signalements = { valeursEcartees: new Map(), lectures: new Map() };

/** Entrées écrites (ajout ou remplacement par identifiant) dans la transaction d'`appliquerSynchronisation`. */
export type AjoutsSignalements = {
  readonly valeursEcartees: ReadonlyArray<ValeurEcartee>;
  readonly lectures: ReadonlyArray<Lecture>;
};
