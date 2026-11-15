/**
 * ST-US-017 v0.4 §13.1 (DT-011) : format de l'heure et ancienneté du « dernier échange » (guide §6.6.1), heure de
 * Paris (DEC-012). Fin octobre 2026, Paris est en UTC+2 jusqu'au 25 octobre, puis en UTC+1.
 */
import { describe, expect, it } from 'vitest';
import { formaterAnciennete, formaterHeure } from '@src/commun/presentation/format/heure';
import { instant } from '@tests/support/valeurs';

const INSECABLE = ' ';
/** Les espaces du texte attendu sont insécables (guide §6.6.1, « Typographie »). */
const attendu = (texte: string): string => texte.replaceAll('_', INSECABLE);

/** 10 h 32 à Paris, le mercredi 21 octobre 2026. */
const MAINTENANT = instant('2026-10-21T08:32:00.000Z');

describe('formaterHeure et formaterAnciennete (guide §6.6.1)', () => {
  it.each([
    ['2026-10-21T08:32:00.000Z', '10_h_32'],
    ['2026-10-21T07:05:00.000Z', '9_h_05'],
    ['2026-10-20T22:30:00.000Z', '0_h_30'],
    ['2026-12-01T08:32:00.000Z', '9_h_32'],
  ])('UT-US-017-34 formaterHeure — %s (heure de Paris)', (iso, texte) => {
    expect(formaterHeure(instant(iso))).toBe(attendu(texte));
  });

  it.each([
    ['même instant', '2026-10-21T08:32:00.000Z', 'à l’instant'],
    ['59 s avant', '2026-10-21T08:31:01.000Z', 'à l’instant'],
    ['30 s après (horloge en avance)', '2026-10-21T08:32:30.000Z', 'à l’instant'],
    ['1 min avant', '2026-10-21T08:31:00.000Z', 'il y a 1_min'],
    ['59 min 59 s avant', '2026-10-21T07:32:01.000Z', 'il y a 59_min'],
    ['1 h avant', '2026-10-21T07:32:00.000Z', 'il y a 1_h'],
    ['23 h 59 min avant (la veille à Paris)', '2026-10-20T08:33:00.000Z', 'il y a 23_h'],
    ['24 h avant', '2026-10-20T08:32:00.000Z', 'hier à 10_h_32'],
    [
      '34 h avant, la veille à Paris mais l’avant-veille en UTC',
      '2026-10-19T22:30:00.000Z',
      'hier à 0_h_30',
    ],
    ['deux jours de Paris avant', '2026-10-19T21:59:00.000Z', 'le 19 oct. à 23_h_59'],
    ['une autre année', '2025-12-31T10:00:00.000Z', 'le 31 déc. 2025 à 11_h_00'],
  ])('UT-US-017-34 formaterAnciennete — %s', (_cas, iso, texte) => {
    expect(formaterAnciennete(instant(iso), MAINTENANT)).toBe(attendu(texte));
  });
});
