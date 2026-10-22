import { describe, expect, it } from 'vitest';
import { normaliserDescription } from '@src/objectifs-taches/domaine/description';

describe('normaliserDescription (US-001 CA-1)', () => {
  it.each([undefined, '', ' '])(
    'UT-US-001-03 normaliserDescription — renvoie undefined pour %j',
    (brute) => {
      expect(normaliserDescription(brute)).toBeUndefined();
    },
  );

  it('UT-US-001-03 normaliserDescription — retire les espaces de début et de fin', () => {
    expect(normaliserDescription(' A5 ')).toBe('A5');
  });
});
