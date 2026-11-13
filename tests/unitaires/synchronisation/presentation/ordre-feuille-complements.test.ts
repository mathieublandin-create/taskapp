import { describe, expect, it } from 'vitest';
import { comparerLignesFeuille } from '@src/synchronisation/presentation/modeles-de-vue/ordre-feuille';
import { instant } from '@tests/support/valeurs';

describe('Ordre des listes de la feuille : compléments (ST-US-017 §4.5)', () => {
  it('UT-COMP-US-017-50 comparerLignesFeuille — deux lignes identiques sont égales ; la plus ancienne vient après', () => {
    const ligne = { id: 'a', intitule: 'Relire', instant: instant('2026-10-21T08:00:00.000Z') };
    const recente = { ...ligne, id: 'b', instant: instant('2026-10-21T09:00:00.000Z') };

    expect(comparerLignesFeuille(ligne, { ...ligne })).toBe(0);
    expect(comparerLignesFeuille(ligne, recente)).toBeGreaterThan(0);
    expect(comparerLignesFeuille({ ...ligne, id: 'b' }, ligne)).toBe(1);
  });
});
