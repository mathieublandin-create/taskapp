import { describe, expect, it } from 'vitest';
import { construireRacine } from '@src/compte/presentation/modeles-de-vue/racine';
import { IDENTITE_A } from '@tests/support/compte/doublures-compte';

describe('construireRacine (ST-US-022 §4.5 ; RL-LOT-001-S5)', () => {
  it('UT-US-022-59 construireRacine — sans session : connexion ; attente de Google : SYN-REDIRECTION ; session ouverte : application (CA-1)', () => {
    expect(construireRacine({ type: 'SANS_SESSION' })).toEqual({ ecran: 'CONNEXION' });
    expect(construireRacine({ type: 'ATTENTE_GOOGLE', identite: IDENTITE_A })).toEqual({
      ecran: 'ATTENTE_GOOGLE',
      etat: 'SYN-REDIRECTION',
      nomAccessible: 'Connexion à Google en cours',
    });
    expect(
      construireRacine({ type: 'OUVERTE', identite: IDENTITE_A, acces: 'A_RENOUVELER' }),
    ).toEqual({ ecran: 'APPLICATION' });
    expect(construireRacine({ type: 'OUVERTE', identite: IDENTITE_A, acces: 'PERDU' })).toEqual({
      ecran: 'APPLICATION',
    });
  });
});
