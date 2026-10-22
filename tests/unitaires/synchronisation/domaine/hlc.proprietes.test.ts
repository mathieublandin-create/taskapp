import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { Instant } from '@src/commun/domaine/temps/instant';
import { comparerHlc, hlcSuivant, type Hlc } from '@src/synchronisation/domaine/hlc';
import { instant, SMARTPHONE } from '@tests/support/valeurs';

const ORIGINE = instant('2026-10-21T08:00:00.000Z');

describe('hlcSuivant — propriétés (DAT §6.4)', () => {
  it('UT-SOC-42 hlcSuivant — produit une suite strictement croissante pour toute suite d’heures physiques', () => {
    const decalages = fc.array(fc.integer({ min: -5_000, max: 5_000 }), {
      minLength: 1,
      maxLength: 50,
    });

    fc.assert(
      fc.property(decalages, (suite) => {
        const comparaisons: Array<-1 | 0 | 1> = [];
        let precedent: Hlc | undefined;
        for (const decalage of suite) {
          const suivant = hlcSuivant(precedent, (ORIGINE + decalage) as Instant, SMARTPHONE);
          if (precedent !== undefined) comparaisons.push(comparerHlc(precedent, suivant));
          precedent = suivant;
        }
        expect(comparaisons.every((c) => c === -1)).toBe(true);
      }),
    );
  });
});
