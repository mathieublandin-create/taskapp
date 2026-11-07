import type { Instant } from '../../commun/domaine/temps/instant';
import type { ContenuManifeste, Generation } from './contenu-fichier';
import { comparerHlc, maxHlc, type Hlc } from './hlc';
import type { IdFichierDrive } from './meta-synchronisation';

// ST-US-017 v0.10 §6.7 n° 13 ; DAT §4.2.2 (d) : manifeste à plusieurs écrivains, contenu monotone, doublons.

/**
 * Ordre total des générations (n° 1), exposé par `controle-drive.ts` (réexport) : défini ici pour que
 * `controle-drive.ts` utilise la jointure du manifeste sans dépendance circulaire (conventions §11.14).
 */
export const comparerGenerations = (a: Generation, b: Generation): -1 | 0 | 1 => {
  if (a.type === 'INITIALE') return b.type === 'INITIALE' ? 0 : -1;
  return b.type === 'INITIALE' ? 1 : comparerHlc(a.hlc, b.hlc);
};

const restaurationMax = (a: Hlc | undefined, b: Hlc | undefined): Hlc | undefined => {
  if (a === undefined) return b;
  return b === undefined ? a : maxHlc(a, b);
};

const restaurationsEgales = (a: Hlc | undefined, b: Hlc | undefined): boolean => {
  if (a === undefined || b === undefined) return a === b;
  return comparerHlc(a, b) === 0;
};

/** Égalité de contenu (n° 13) : même `schemaVersion`, générations égales, `restauration` toutes deux absentes ou égales. */
export const manifestesEgaux = (a: ContenuManifeste, b: ContenuManifeste): boolean =>
  a.schemaVersion === b.schemaVersion &&
  comparerGenerations(a.generation, b.generation) === 0 &&
  restaurationsEgales(a.restauration, b.restauration);

/**
 * Jointure de deux manifestes, champ par champ (n° 13) : `schemaVersion` maximal, génération maximale
 * (`comparerGenerations`), `restauration` maximale (`comparerHlc` ; absente < présente, omise si absente des deux).
 * Commutative, associative, idempotente. Rend `a` (même référence) si le résultat lui est égal (`manifestesEgaux`).
 */
export const fusionnerManifestes = (a: ContenuManifeste, b: ContenuManifeste): ContenuManifeste => {
  const restauration = restaurationMax(a.restauration, b.restauration);
  const jointure: ContenuManifeste = {
    schemaVersion: Math.max(a.schemaVersion, b.schemaVersion),
    generation: comparerGenerations(a.generation, b.generation) >= 0 ? a.generation : b.generation,
    ...(restauration === undefined ? {} : { restauration }),
  };
  return manifestesEgaux(jointure, a) ? a : jointure;
};

/** Fichier ou dossier du Drive avec sa date de création (ordre canonique, n° 13). */
export type ElementDatable = { readonly id: IdFichierDrive; readonly creeA: Instant };

const comparerValeurs = <T extends number | string>(a: T, b: T): -1 | 0 | 1 => {
  if (a === b) return 0;
  return a < b ? -1 : 1;
};

/** Ordre canonique (n° 13) : `creeA` croissant, puis `id` en unités de code. Le premier est canonique. */
export const comparerCanonique = (a: ElementDatable, b: ElementDatable): -1 | 0 | 1 =>
  comparerValeurs<number>(a.creeA, b.creeA) || comparerValeurs<string>(a.id, b.id);
