import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { construireIntitule } from '@src/objectifs-taches/domaine/intitule';

describe('construireIntitule (Q-US-001-3)', () => {
  it('UT-US-001-01 construireIntitule — retire les espaces de début et de fin', () => {
    expect(construireIntitule('  Publier le guide ')).toEqual(succes('Publier le guide'));
  });

  it.each(['', '   '])('UT-US-001-02 construireIntitule — refuse « %s » (US-001 CA-1)', (brut) => {
    expect(construireIntitule(brut)).toEqual(echec({ type: 'IntituleVide' }));
  });
});
