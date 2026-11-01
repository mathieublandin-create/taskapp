/**
 * Générations et manifeste à plusieurs écrivains (ST-US-017 v0.10 §6.7 n° 1, n° 13 ; DAT §4.2.2 d) : ordre total des
 * générations, jointure monotone du manifeste, ordre canonique des doublons. UT-US-017-63.
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { Instant } from '@src/commun/domaine/temps/instant';
import type { ContenuManifeste, Generation } from '@src/synchronisation/domaine/contenu-fichier';
import {
  comparerGenerations,
  GENERATION_INITIALE,
  generationMax,
} from '@src/synchronisation/domaine/controle-drive';
import { comparerHlc, type Hlc } from '@src/synchronisation/domaine/hlc';
import {
  comparerCanonique,
  fusionnerManifestes,
  manifestesEgaux,
} from '@src/synchronisation/domaine/manifeste';
import type { IdFichierDrive } from '@src/synchronisation/domaine/meta-synchronisation';
import { hlc, instant, PC, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

const ORIGINE = instant('2026-10-21T08:00:00.000Z');
const APPAREILS = [SMARTPHONE, PC, TROISIEME] as const;

const hlcArbitraire: fc.Arbitrary<Hlc> = fc
  .record({
    ms: fc.integer({ min: 0, max: 5 }),
    compteur: fc.integer({ min: 0, max: 2 }),
    appareil: fc.constantFrom(...APPAREILS),
  })
  .map(({ ms, compteur, appareil }) => ({
    physique: (ORIGINE + ms) as Instant,
    compteur,
    appareil,
  }));

const generationArbitraire: fc.Arbitrary<Generation> = fc.oneof(
  fc.constant(GENERATION_INITIALE),
  hlcArbitraire.map((h): Generation => ({ type: 'NOUVELLE', hlc: h })),
);

const manifesteArbitraire: fc.Arbitrary<ContenuManifeste> = fc
  .record({
    schemaVersion: fc.integer({ min: 1, max: 2 }),
    generation: generationArbitraire,
    restauration: fc.option(hlcArbitraire, { nil: undefined }),
  })
  .map(({ schemaVersion, generation, restauration }) => ({
    schemaVersion,
    generation,
    ...(restauration === undefined ? {} : { restauration }),
  }));

const H1 = hlc('2026-10-21T08:00:00.000Z', 0, SMARTPHONE);
const H2 = hlc('2026-10-21T08:00:00.000Z', 1, SMARTPHONE);
const H3 = hlc('2026-10-21T08:00:00.000Z', 1, PC);

describe('Générations (ST-US-017 v0.10 §6.7 n° 1)', () => {
  it('UT-US-017-63 comparerGenerations — INITIALE précède toute NOUVELLE ; deux NOUVELLE suivent comparerHlc ; generationMax d’un ensemble vide = INITIALE', () => {
    const g = (h: Hlc): Generation => ({ type: 'NOUVELLE', hlc: h });
    expect(comparerGenerations(GENERATION_INITIALE, GENERATION_INITIALE)).toBe(0);
    expect(comparerGenerations(GENERATION_INITIALE, g(H1))).toBe(-1);
    expect(comparerGenerations(g(H1), GENERATION_INITIALE)).toBe(1);
    expect(comparerGenerations(g(H1), g(H2))).toBe(-1);
    expect(comparerGenerations(g(H3), g(H2))).toBe(1);
    expect(comparerGenerations(g(H2), g({ ...H2 }))).toBe(0);
    expect(generationMax([])).toEqual(GENERATION_INITIALE);
    expect(generationMax([g(H2), GENERATION_INITIALE, g(H3), g(H1)])).toEqual(g(H3));
  });

  it('UT-US-017-63 comparerGenerations — ordre total (antisymétrique, transitif) cohérent avec comparerHlc ; generationMax majore chaque élément et en fait partie', () => {
    fc.assert(
      fc.property(generationArbitraire, generationArbitraire, generationArbitraire, (a, b, c) => {
        expect(comparerGenerations(a, b)).toBe(-comparerGenerations(b, a) || 0);
        const transitif =
          comparerGenerations(a, b) > 0 ||
          comparerGenerations(b, c) > 0 ||
          comparerGenerations(a, c) <= 0;
        expect(transitif).toBe(true);
        const coherent =
          a.type !== 'NOUVELLE' ||
          b.type !== 'NOUVELLE' ||
          comparerGenerations(a, b) === comparerHlc(a.hlc, b.hlc);
        expect(coherent).toBe(true);
        const max = generationMax([a, b, c]);
        [a, b, c].forEach((x) => {
          expect(comparerGenerations(x, max)).toBeLessThanOrEqual(0);
        });
        expect([a, b, c].some((x) => comparerGenerations(x, max) === 0)).toBe(true);
      }),
    );
  });
});

describe('Manifeste à plusieurs écrivains (n° 13 ; DAT §4.2.2 d)', () => {
  it('UT-US-017-63 fusionnerManifestes — champ par champ : schemaVersion, génération et restauration maximales ; restauration absente des deux : omise ; résultat égal à a : même référence', () => {
    const a: ContenuManifeste = { schemaVersion: 1, generation: GENERATION_INITIALE };
    const b: ContenuManifeste = {
      schemaVersion: 1,
      generation: { type: 'NOUVELLE', hlc: H1 },
      restauration: H2,
    };
    const c: ContenuManifeste = {
      schemaVersion: 2,
      generation: GENERATION_INITIALE,
      restauration: H3,
    };
    expect(fusionnerManifestes(a, b)).toEqual(b);
    expect(fusionnerManifestes(b, c)).toEqual({
      schemaVersion: 2,
      generation: { type: 'NOUVELLE', hlc: H1 },
      restauration: H3,
    });
    expect(fusionnerManifestes(a, { ...a })).toBe(a);
    expect('restauration' in fusionnerManifestes(a, { ...a })).toBe(false);
    expect(fusionnerManifestes(b, a)).toBe(b);
  });

  it('UT-US-017-63 fusionnerManifestes — commutative, associative, idempotente (à l’égalité de contenu près) et monotone : le résultat n’est jamais inférieur à l’un des deux', () => {
    fc.assert(
      fc.property(manifesteArbitraire, manifesteArbitraire, manifesteArbitraire, (a, b, c) => {
        expect(manifestesEgaux(fusionnerManifestes(a, b), fusionnerManifestes(b, a))).toBe(true);
        expect(
          manifestesEgaux(
            fusionnerManifestes(fusionnerManifestes(a, b), c),
            fusionnerManifestes(a, fusionnerManifestes(b, c)),
          ),
        ).toBe(true);
        expect(fusionnerManifestes(a, a)).toBe(a);
        const j = fusionnerManifestes(a, b);
        [a, b].forEach((x) => {
          expect(j.schemaVersion).toBeGreaterThanOrEqual(x.schemaVersion);
          expect(comparerGenerations(x.generation, j.generation)).toBeLessThanOrEqual(0);
          const majoree =
            x.restauration === undefined ||
            (j.restauration !== undefined && comparerHlc(x.restauration, j.restauration) <= 0);
          expect(majoree).toBe(true);
        });
        // Une écriture concurrente perdue puis réécrite par la jointure ne fait jamais reculer le contenu.
        expect(manifestesEgaux(fusionnerManifestes(j, a), j)).toBe(true);
      }),
    );
  });

  it('UT-US-017-63 manifestesEgaux — compare schemaVersion, génération (par valeur) et restauration (absente des deux, ou égale)', () => {
    const a: ContenuManifeste = { schemaVersion: 1, generation: { type: 'NOUVELLE', hlc: H1 } };
    expect(
      manifestesEgaux(a, { schemaVersion: 1, generation: { type: 'NOUVELLE', hlc: { ...H1 } } }),
    ).toBe(true);
    expect(manifestesEgaux(a, { ...a, schemaVersion: 2 })).toBe(false);
    expect(manifestesEgaux(a, { ...a, generation: GENERATION_INITIALE })).toBe(false);
    expect(manifestesEgaux(a, { ...a, restauration: H2 })).toBe(false);
    expect(manifestesEgaux({ ...a, restauration: H2 }, { ...a, restauration: { ...H2 } })).toBe(
      true,
    );
    expect(manifestesEgaux({ ...a, restauration: H2 }, { ...a, restauration: H3 })).toBe(false);
  });

  it('UT-US-017-63 comparerCanonique — le plus ancien (creeA) d’abord, puis l’identifiant en unités de code', () => {
    const e = (id: string, ms: number) => ({
      id: id as IdFichierDrive,
      creeA: (ORIGINE + ms) as Instant,
    });
    const tries = [e('b', 5), e('Z', 5), e('a', 9), e('c', 1)].sort(comparerCanonique);
    expect(tries.map((x) => x.id)).toEqual(['c', 'Z', 'b', 'a']);
    expect(comparerCanonique(e('a', 1), e('a', 1))).toBe(0);
  });
});
