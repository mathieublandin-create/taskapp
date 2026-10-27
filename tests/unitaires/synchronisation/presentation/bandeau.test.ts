import { describe, expect, it } from 'vitest';
import { construireBandeau } from '@src/synchronisation/presentation/modeles-de-vue/bandeau';
import type { EtatSynchronisationAffichable } from '@src/synchronisation/presentation/modeles-de-vue/etat-synchronisation-affichable';
import { instant } from '@tests/support/valeurs';

const PREMIERE = instant('2026-10-21T08:00:00.000Z');
const A_24H = instant('2026-10-22T08:00:00.000Z');
const A_24H_1MIN = instant('2026-10-22T08:01:00.000Z');
const ETAT: EtatSynchronisationAffichable = {
  reseau: 'COUPE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  enAttente: 1,
  plusAncienneEnAttente: PREMIERE,
  aLire: 0,
  rappelMasque: false,
};
const SANS_ATTENTE: EtatSynchronisationAffichable = {
  reseau: 'COUPE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  enAttente: 0,
  aLire: 0,
  rappelMasque: false,
};

describe('construireBandeau (RG-035, RG-057, RG-058 ; guide §6.6.3)', () => {
  it('UT-US-022-46 construireBandeau — accès perdu : un seul bandeau « Se reconnecter », variante 24H au-delà de 24 h strictes (DEC-025)', () => {
    const perdu = { ...ETAT, acces: 'PERDU' as const };

    expect(construireBandeau(perdu, A_24H)).toEqual({
      code: 'BAN-ACCES-GOOGLE',
      action: 'SE_RECONNECTER',
      fermable: false,
      bloquant: false,
      message: 'ERR-010',
    });
    expect(construireBandeau(perdu, A_24H_1MIN)).toEqual({
      code: 'BAN-ACCES-GOOGLE',
      variante: '24H',
      n: 1,
      action: 'SE_RECONNECTER',
      fermable: false,
      bloquant: false,
      message: 'ERR-010',
    });
    expect(
      construireBandeau(
        { ...perdu, rappelMasque: true, actionRequise: 'FORMAT_PLUS_RECENT' },
        A_24H_1MIN,
      )?.code,
    ).toBe('BAN-ACCES-GOOGLE');
  });

  it('UT-US-022-47 construireBandeau — rappel absent à 24 h exactement, sans attente ou masqué ; présent à 24 h + 1 min ; variante session (en ligne seulement) ; consultation seule prioritaire', () => {
    expect(construireBandeau(ETAT, A_24H)).toBeUndefined();
    expect(construireBandeau(SANS_ATTENTE, A_24H_1MIN)).toBeUndefined();
    expect(construireBandeau({ ...ETAT, rappelMasque: true }, A_24H_1MIN)).toBeUndefined();
    expect(construireBandeau(ETAT, A_24H_1MIN)).toEqual({
      code: 'BAN-RAPPEL-24H',
      n: 1,
      fermable: true,
      bloquant: false,
      message: 'ALR-002',
    });
    expect(
      construireBandeau({ ...ETAT, reseau: 'CONNECTE', acces: 'A_RENOUVELER' }, A_24H_1MIN),
    ).toEqual({
      code: 'BAN-RAPPEL-24H',
      variante: 'session',
      n: 1,
      action: 'REPRENDRE_LA_SYNCHRONISATION',
      fermable: true,
      bloquant: false,
      message: 'ALR-002',
    });
    // Q-ST022-STE-3 b) : hors ligne, l'indicateur n'est pas SYN-SESSION, donc rappel ordinaire.
    expect(construireBandeau({ ...ETAT, acces: 'A_RENOUVELER' }, A_24H_1MIN)).toEqual({
      code: 'BAN-RAPPEL-24H',
      n: 1,
      fermable: true,
      bloquant: false,
      message: 'ALR-002',
    });
    expect(
      construireBandeau({ ...ETAT, actionRequise: 'FORMAT_PLUS_RECENT', enAttente: 2 }, A_24H_1MIN),
    ).toEqual({
      code: 'BAN-CONSULTATION-SEULE',
      n: 2,
      action: 'METTRE_A_JOUR',
      fermable: false,
      bloquant: false,
      message: 'ERR-013',
    });
    expect(
      construireBandeau({ ...SANS_ATTENTE, actionRequise: 'FORMAT_PLUS_RECENT' }, A_24H),
    ).toEqual({
      code: 'BAN-CONSULTATION-SEULE',
      action: 'METTRE_A_JOUR',
      fermable: false,
      bloquant: false,
      message: 'ERR-013',
    });
  });
});
