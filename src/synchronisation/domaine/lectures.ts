import { comparerHlc, type Hlc } from './hlc';
import { MOTIFS_A_LIRE, type IdValeurEcartee, type ValeurEcartee } from './valeurs-ecartees';

// ST-US-017 v0.5 §4.6, §6.6 n° 6 ; RG-056 b ; DAT §4.2.1 : l'état « lu » est une information distincte, fusionnée par HLC.

/** « Compris » : la valeur écartée `id` est lue (il n'existe pas d'état « non lu » écrit). */
export type Lecture = { readonly id: IdValeurEcartee; readonly hlc: Hlc };

/** Union par identifiant ; pour un même identifiant, la lecture de plus grand HLC. */
export const fusionnerLectures = (
  connues: ReadonlyMap<IdValeurEcartee, Lecture>,
  nouvelles: Iterable<Lecture>,
): ReadonlyMap<IdValeurEcartee, Lecture> => {
  const union = new Map(connues);
  for (const nouvelle of nouvelles) {
    const connue = union.get(nouvelle.id);
    if (connue === undefined || comparerHlc(nouvelle.hlc, connue.hlc) > 0)
      union.set(nouvelle.id, nouvelle);
  }
  return union;
};

/** H-6 : nombre d'entrées `CONFLIT`, `SUPPRESSION` ou `PLACEMENT_ANNULE` sans lecture (`DONNEES_EFFACEES` exclues). */
export const compterALire = (
  valeursEcartees: ReadonlyMap<IdValeurEcartee, ValeurEcartee>,
  lectures: ReadonlyMap<IdValeurEcartee, Lecture>,
): number =>
  [...valeursEcartees.values()].filter((v) => MOTIFS_A_LIRE.has(v.motif) && !lectures.has(v.id))
    .length;
