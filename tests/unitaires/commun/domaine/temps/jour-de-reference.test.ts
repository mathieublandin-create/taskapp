import { describe, expect, it } from 'vitest';
import { jourDeReference } from '@src/commun/domaine/temps/jour-de-reference';
import { instant } from '@tests/support/valeurs';

describe('jourDeReference (RG-053)', () => {
  it.each([
    ['2026-10-21T21:59:59.999Z', '2026-10-21'],
    ['2026-10-21T22:00:00.000Z', '2026-10-22'],
  ])('UT-SOC-05 jourDeReference — %s est le %s à Paris (minuit de Paris, RG-053)', (iso, jour) => {
    expect(jourDeReference(instant(iso))).toBe(jour);
  });

  it.each([
    ['2026-10-24T22:30:00.000Z', '2026-10-25'],
    ['2026-10-25T00:30:00.000Z', '2026-10-25'],
    ['2026-10-25T22:30:00.000Z', '2026-10-25'],
    ['2026-10-25T23:30:00.000Z', '2026-10-26'],
  ])(
    'UT-SOC-06 jourDeReference — %s est le %s à Paris (passage à l’heure d’hiver, PT-16)',
    (iso, jour) => {
      expect(jourDeReference(instant(iso))).toBe(jour);
    },
  );

  it.each([
    ['2027-03-27T23:30:00.000Z', '2027-03-28'],
    ['2027-03-28T21:30:00.000Z', '2027-03-28'],
    ['2027-03-28T22:00:00.000Z', '2027-03-29'],
  ])(
    'UT-SOC-07 jourDeReference — %s est le %s à Paris (passage à l’heure d’été, PT-16)',
    (iso, jour) => {
      expect(jourDeReference(instant(iso))).toBe(jour);
    },
  );
});
