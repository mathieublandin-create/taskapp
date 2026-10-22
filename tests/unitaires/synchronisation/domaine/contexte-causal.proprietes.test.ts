import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { Instant } from '@src/commun/domaine/temps/instant';
import {
  fusionnerContextes,
  type ContexteCausal,
} from '@src/synchronisation/domaine/contexte-causal';
import type { Hlc } from '@src/synchronisation/domaine/hlc';
import { PC, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

const appareil = fc.constantFrom(SMARTPHONE, PC, TROISIEME);

const contexte: fc.Arbitrary<ContexteCausal> = fc
  .uniqueArray(
    fc.record({
      appareil,
      physique: fc.integer({ min: 1_790_000_000_000, max: 1_790_000_100_000 }),
      compteur: fc.integer({ min: 0, max: 3 }),
    }),
    { selector: (e) => e.appareil, maxLength: 3 },
  )
  .map((entrees) =>
    Object.fromEntries(
      entrees.map((e): [string, Hlc] => [
        e.appareil,
        { physique: e.physique as Instant, compteur: e.compteur, appareil: e.appareil },
      ]),
    ),
  );

describe('fusionnerContextes — propriétés (DAT §4.2.1)', () => {
  it('UT-SOC-43 fusionnerContextes — est commutative', () => {
    fc.assert(
      fc.property(contexte, contexte, (a, b) => {
        expect(fusionnerContextes(a, b)).toEqual(fusionnerContextes(b, a));
      }),
    );
  });

  it('UT-SOC-43 fusionnerContextes — est associative', () => {
    fc.assert(
      fc.property(contexte, contexte, contexte, (a, b, c) => {
        expect(fusionnerContextes(fusionnerContextes(a, b), c)).toEqual(
          fusionnerContextes(a, fusionnerContextes(b, c)),
        );
      }),
    );
  });

  it('UT-SOC-43 fusionnerContextes — est idempotente', () => {
    fc.assert(
      fc.property(contexte, (a) => {
        expect(fusionnerContextes(a, a)).toEqual(a);
      }),
    );
  });
});
