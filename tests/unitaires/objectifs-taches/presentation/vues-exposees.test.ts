import { describe, expect, it } from 'vitest';
import { VUES_EXPOSEES } from '@src/objectifs-taches/presentation/modeles-de-vue/vues-exposees';

describe('VUES_EXPOSEES (US-001 CA-11)', () => {
  it('UT-US-001-34 VUES_EXPOSEES — offre les six vues du lot 1 et aucune vue d’historique', () => {
    expect([...VUES_EXPOSEES].sort()).toEqual([
      'DETAIL_OBJECTIF',
      'DETAIL_TACHE',
      'FORMULAIRE_SOUS_TACHE',
      'FORMULAIRE_TACHE',
      'LISTE_OBJECTIFS',
      'LISTE_TACHES',
    ]);
    expect(VUES_EXPOSEES.some((vue) => vue.includes('HISTORIQUE'))).toBe(false);
  });
});
