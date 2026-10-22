import { nonImplemente } from '@non-implemente';
import type { IdAppareil } from '../../commun/domaine/identifiants';
import type { Instant } from '../../commun/domaine/temps/instant';

// DAT §6.4, ADR-011 (ST-socle-ecriture.md §6.1).
export type Hlc = {
  readonly physique: Instant; // heure physique corrigée, ms UTC
  readonly compteur: number; // entier, 0 ≤ compteur ≤ COMPTEUR_HLC_MAX
  readonly appareil: IdAppareil; // départage des égalités (DS-11)
};

export const COMPTEUR_HLC_MAX = 65_535;

export const hlcSuivant = (
  _dernier: Hlc | undefined,
  _physiqueCorrigee: Instant,
  _appareil: IdAppareil,
): Hlc => nonImplemente('hlcSuivant');

/** Physique, puis compteur, puis appareil (opérateurs < et >, jamais localeCompare). */
export const comparerHlc = (_a: Hlc, _b: Hlc): -1 | 0 | 1 => nonImplemente('comparerHlc');

export const maxHlc = (_a: Hlc, _b: Hlc): Hlc => nonImplemente('maxHlc');
