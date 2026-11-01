import { nonImplemente } from '@non-implemente';
import type { Instant } from '../../commun/domaine/temps/instant';
import type { ContenuManifeste } from './contenu-fichier';
import type { IdFichierDrive } from './meta-synchronisation';

// ST-US-017 v0.10 §6.7 n° 13 ; DAT §4.2.2 (d) : manifeste à plusieurs écrivains, contenu monotone, doublons.

/**
 * Jointure de deux manifestes, champ par champ (n° 13) : `schemaVersion` maximal, génération maximale
 * (`comparerGenerations`), `restauration` maximale (`comparerHlc` ; absente < présente, omise si absente des deux).
 * Commutative, associative, idempotente. Rend `a` (même référence) si le résultat lui est égal (`manifestesEgaux`).
 */
export const fusionnerManifestes = (a: ContenuManifeste, b: ContenuManifeste): ContenuManifeste =>
  nonImplemente(`fusionnerManifestes (${String(a.schemaVersion)}, ${String(b.schemaVersion)})`);

/** Égalité de contenu (n° 13) : même `schemaVersion`, générations égales, `restauration` toutes deux absentes ou égales. */
export const manifestesEgaux = (a: ContenuManifeste, b: ContenuManifeste): boolean =>
  nonImplemente(`manifestesEgaux (${String(a.schemaVersion)}, ${String(b.schemaVersion)})`);

/** Fichier ou dossier du Drive avec sa date de création (ordre canonique, n° 13). */
export type ElementDatable = { readonly id: IdFichierDrive; readonly creeA: Instant };

/** Ordre canonique (n° 13) : `creeA` croissant, puis `id` en unités de code. Le premier est canonique. */
export const comparerCanonique = (a: ElementDatable, b: ElementDatable): -1 | 0 | 1 =>
  nonImplemente(`comparerCanonique (${a.id}, ${b.id})`);
