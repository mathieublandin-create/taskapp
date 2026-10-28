import { describe, expect, it } from 'vitest';
import { construireRetourReprise } from '@src/compte/presentation/modeles-de-vue/retour-reprise';

describe('construireRetourReprise (guide v0.2.14 §6.6.6 ; RL-LOT-001-S6)', () => {
  it('UT-US-022-54 construireRetourReprise — SAISIE_A_TERMINER produit le toast TST-SAISIE-A-TERMINER ; les autres issues, aucun toast', () => {
    expect(construireRetourReprise({ type: 'SAISIE_A_TERMINER' })).toEqual({
      toast: 'TST-SAISIE-A-TERMINER',
    });
    expect(construireRetourReprise({ type: 'ACCES_RENOUVELE' })).toEqual({});
    expect(construireRetourReprise({ type: 'INCHANGE' })).toEqual({});
    expect(construireRetourReprise({ type: 'ACCES_PERDU' })).toEqual({});
    expect(construireRetourReprise({ type: 'REDIRECTION_LANCEE' })).toEqual({});
  });
});
