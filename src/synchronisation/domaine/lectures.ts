import { nonImplemente } from '@non-implemente';
import type { Hlc } from './hlc';
import type { IdValeurEcartee, ValeurEcartee } from './valeurs-ecartees';

// ST-US-017 v0.5 §4.6, §6.6 n° 6 ; RG-056 b ; DAT §4.2.1 : l'état « lu » est une information distincte, fusionnée par HLC.

/** « Compris » : la valeur écartée `id` est lue (il n'existe pas d'état « non lu » écrit). */
export type Lecture = { readonly id: IdValeurEcartee; readonly hlc: Hlc };

/** Union par identifiant ; pour un même identifiant, la lecture de plus grand HLC. */
export const fusionnerLectures = (
  connues: ReadonlyMap<IdValeurEcartee, Lecture>,
  nouvelles: Iterable<Lecture>,
): ReadonlyMap<IdValeurEcartee, Lecture> =>
  nonImplemente(`fusionnerLectures (${String(connues.size)}, ${typeof nouvelles})`);

/** H-6 : nombre d'entrées `CONFLIT`, `SUPPRESSION` ou `PLACEMENT_ANNULE` sans lecture (`DONNEES_EFFACEES` exclues). */
export const compterALire = (
  valeursEcartees: ReadonlyMap<IdValeurEcartee, ValeurEcartee>,
  lectures: ReadonlyMap<IdValeurEcartee, Lecture>,
): number => nonImplemente(`compterALire (${String(valeursEcartees.size + lectures.size)})`);
