/**
 * ST-US-031 v0.4 §4.1, §10 (rang 13, tranche B1) ; DAT v0.11.12 §4.1.6 : noms des deux verrous d'un espace, dérivés du
 * seul nom de l'espace (empreinte du `sub`, jamais le `sub` ni l'adresse).
 */
import { describe, expect, it } from 'vitest';
import { nomVerrouCycle, nomVerrouMeneur } from '@src/synchronisation/application/noms-verrous';

const ESPACE = 'donejuan-recette-3f5a9c0e';

describe('Noms des verrous entre onglets (ST-US-031 §4.1)', () => {
  it('UT-US-031-12 meneur et cycle — suffixes exacts du DAT, distincts, propres à chaque espace', () => {
    expect(nomVerrouMeneur(ESPACE)).toBe('donejuan-recette-3f5a9c0e:synchronisation-meneur');
    expect(nomVerrouCycle(ESPACE)).toBe('donejuan-recette-3f5a9c0e:synchronisation-cycle');
    expect(nomVerrouMeneur('donejuan-production-77aa')).toBe(
      'donejuan-production-77aa:synchronisation-meneur',
    );
    expect(nomVerrouCycle('donejuan-production-77aa')).toBe(
      'donejuan-production-77aa:synchronisation-cycle',
    );
  });
});
