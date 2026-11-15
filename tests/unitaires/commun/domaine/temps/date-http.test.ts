/**
 * En-tête HTTP `Date` (ST-US-017 v0.11 §6.8 n° 1 ; RFC 9110 §5.6.7). UT-US-017-79 (rang 11).
 */
import { describe, expect, it } from 'vitest';
import { lireDateHttp } from '@src/commun/domaine/temps/date-http';
import { instant } from '@tests/support/valeurs';

describe('lireDateHttp (ST-US-017 v0.11 §6.8 n° 1)', () => {
  it('UT-US-017-79 forme IMF-fixdate lue à la seconde ; toute autre forme, ou une date incohérente, rend undefined', () => {
    expect(lireDateHttp('Wed, 21 Oct 2026 08:00:00 GMT')).toBe(instant('2026-10-21T08:00:00.000Z'));
    expect(lireDateHttp('Sun, 01 Nov 2026 23:59:59 GMT')).toBe(instant('2026-11-01T23:59:59.000Z'));
    expect(lireDateHttp('Thu, 29 Feb 2024 12:00:00 GMT')).toBe(instant('2024-02-29T12:00:00.000Z'));
    for (const invalide of [
      undefined,
      '',
      'Wednesday, 21-Oct-26 08:00:00 GMT', // RFC 850 (obsolète)
      'Wed Oct 21 08:00:00 2026', // asctime (obsolète)
      'Wed, 21 Oct 2026 08:00:00 +0000',
      'Wed, 21 Oct 2026 08:00:00 UTC',
      'Thu, 21 Oct 2026 08:00:00 GMT', // jour de la semaine faux
      'Wed, 31 Feb 2026 08:00:00 GMT',
      'Wed, 21 Oct 2026 24:00:00 GMT',
      'Wed, 21 Oct 2026 08:00 GMT',
      ' Wed, 21 Oct 2026 08:00:00 GMT',
      '2026-10-21T08:00:00.000Z',
    ]) {
      expect(lireDateHttp(invalide)).toBe(undefined);
    }
  });
});
