/**
 * ST-CORR-E13B-LOT-001 §7 (tranche T6) : ANO-004, vue initiale `OUVERTURE` (guide v0.2.26 §6.2, §6.6.16 n° 4). Tant que
 * l'ouverture n'a pas conclu, l'absence de session n'est pas établie : cadre neutre, jamais l'écran de connexion.
 * Rang 14 (rangs-tests.json). Le second paramètre de `construireRacine` est ajouté en T6 (le transtypage ci-dessous
 * pourra alors être retiré, sans autre changement).
 */
import { describe, expect, it } from 'vitest';
import type { EtatSession } from '@src/compte/application/session-courante';
import {
  construireRacine,
  type ModeleVueRacine,
} from '@src/compte/presentation/modeles-de-vue/racine';
import { IDENTITE_A } from '@tests/support/compte/doublures-compte';

type EtatOuverture = 'EN_COURS' | 'ETABLIE';
const construire = construireRacine as (
  etat: EtatSession,
  ouverture: EtatOuverture,
) => ModeleVueRacine;

describe('construireRacine — ouverture en cours (ANO-004)', () => {
  it('UT-ANO-004-01 sans session : OUVERTURE tant que l’ouverture est en cours, CONNEXION une fois établie ; une session ou l’attente de Google l’emportent ; ETABLIE par défaut', () => {
    expect(construire({ type: 'SANS_SESSION' }, 'EN_COURS')).toEqual({ ecran: 'OUVERTURE' });
    expect(construire({ type: 'SANS_SESSION' }, 'ETABLIE')).toEqual({ ecran: 'CONNEXION' });
    expect(construireRacine({ type: 'SANS_SESSION' })).toEqual({ ecran: 'CONNEXION' });
    expect(
      construire({ type: 'OUVERTE', identite: IDENTITE_A, acces: 'VALIDE' }, 'EN_COURS'),
    ).toEqual({ ecran: 'APPLICATION' });
    expect(construire({ type: 'ATTENTE_GOOGLE', identite: IDENTITE_A }, 'EN_COURS')).toEqual({
      ecran: 'ATTENTE_GOOGLE',
      etat: 'SYN-REDIRECTION',
      nomAccessible: 'Connexion à Google en cours',
    });
  });
});
