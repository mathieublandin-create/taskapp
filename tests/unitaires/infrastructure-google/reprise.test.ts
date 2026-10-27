import { describe, expect, it } from 'vitest';
import { delaiAvantTentative } from '@src/infrastructure-google/reprise';

describe('delaiAvantTentative (DAT §4.4.5)', () => {
  it('UT-US-022-49 delaiAvantTentative — double à chaque tentative jusqu’au plafond de 5 min, gigue entre 50 % et 100 %', () => {
    expect([1, 2, 3, 4].map((n) => delaiAvantTentative(n, 0.999999))).toEqual([
      999, 1999, 3999, 7999,
    ]);
    expect(delaiAvantTentative(1, 0)).toBe(500);
    expect(delaiAvantTentative(3, 0.5)).toBe(3000);
    expect(delaiAvantTentative(20, 0)).toBe(150_000);
    expect(delaiAvantTentative(20, 0.999999)).toBe(299_999);
  });
});
