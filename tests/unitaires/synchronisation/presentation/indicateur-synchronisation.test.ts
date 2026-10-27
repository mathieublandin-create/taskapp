import { describe, expect, it } from 'vitest';
import type { EtatSynchronisationAffichable } from '@src/synchronisation/presentation/modeles-de-vue/etat-synchronisation-affichable';
import {
  construireIndicateur,
  selectionnerEtatIndicateur,
} from '@src/synchronisation/presentation/modeles-de-vue/indicateur-synchronisation';

const AU_REPOS: EtatSynchronisationAffichable = {
  reseau: 'CONNECTE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  enAttente: 0,
  aLire: 0,
  rappelMasque: false,
};

describe('Indicateur de synchronisation (guide §6.6.2, conventions §8.5)', () => {
  it('UT-US-022-44 selectionnerEtatIndicateur — applique l’ordre de gravité, chaque état l’emportant sur les suivants', () => {
    const cas: ReadonlyArray<readonly [Partial<EtatSynchronisationAffichable>, string]> = [
      [{}, 'SYN-OK'],
      [{ aLire: 2 }, 'SYN-INFO'],
      [{ aLire: 2, enAttente: 1 }, 'SYN-ATTENTE'],
      [{ enAttente: 1, cycle: 'EN_COURS' }, 'SYN-EN-COURS'],
      [{ cycle: 'EN_COURS', reseau: 'COUPE' }, 'SYN-HORS-LIGNE'],
      [{ reseau: 'COUPE', cycle: 'RETENTATIVE' }, 'SYN-RETENTATIVE'],
      [{ cycle: 'RETENTATIVE', acces: 'A_RENOUVELER' }, 'SYN-SESSION'],
      // Q-ST022-STE-3 b) (guide v0.2.12) : hors ligne, SYN-SESSION n'est jamais exposé.
      [{ acces: 'A_RENOUVELER', reseau: 'COUPE' }, 'SYN-HORS-LIGNE'],
      [{ acces: 'A_RENOUVELER', reseau: 'COUPE', cycle: 'RETENTATIVE' }, 'SYN-RETENTATIVE'],
      [{ acces: 'PERDU', reseau: 'COUPE' }, 'SYN-ACTION'],
      [{ acces: 'A_RENOUVELER', actionRequise: 'DRIVE_PLEIN' }, 'SYN-ACTION'],
      [{ actionRequise: 'ECHEC_PERSISTANT' }, 'SYN-ACTION'],
    ];

    cas.forEach(([modification, attendu]) => {
      expect(selectionnerEtatIndicateur({ ...AU_REPOS, ...modification })).toBe(attendu);
    });
  });

  it('UT-US-022-45 construireIndicateur — SYN-SESSION porte l’action et ERR-015, jamais hors ligne ; n et a-lire seulement quand ils ont un sens', () => {
    expect(construireIndicateur({ ...AU_REPOS, acces: 'A_RENOUVELER', enAttente: 2 })).toEqual({
      code: 'SYN-SESSION',
      action: 'REPRENDRE_LA_SYNCHRONISATION',
      messageFeuille: 'ERR-015',
    });
    expect(
      construireIndicateur({ ...AU_REPOS, acces: 'A_RENOUVELER', reseau: 'COUPE', enAttente: 2 }),
    ).toEqual({ code: 'SYN-HORS-LIGNE', n: 2 });
    expect(construireIndicateur({ ...AU_REPOS, reseau: 'COUPE', enAttente: 0, aLire: 1 })).toEqual({
      code: 'SYN-HORS-LIGNE',
      n: 0,
      aLire: 1,
    });
    expect(construireIndicateur({ ...AU_REPOS, enAttente: 3 })).toEqual({
      code: 'SYN-ATTENTE',
      n: 3,
    });
    expect(construireIndicateur({ ...AU_REPOS, aLire: 2 })).toEqual({ code: 'SYN-INFO', aLire: 2 });
    expect(construireIndicateur({ ...AU_REPOS, acces: 'PERDU' })).toEqual({
      code: 'SYN-ACTION',
      messageFeuille: 'ERR-010',
    });
    expect(construireIndicateur({ ...AU_REPOS, actionRequise: 'DRIVE_PLEIN' }).messageFeuille).toBe(
      'ERR-011',
    );
    expect(
      construireIndicateur({ ...AU_REPOS, actionRequise: 'DONNEES_ABSENTES' }).messageFeuille,
    ).toBe('ERR-012');
    expect(
      construireIndicateur({ ...AU_REPOS, actionRequise: 'FORMAT_PLUS_RECENT' }).messageFeuille,
    ).toBe('ERR-013');
    expect(
      construireIndicateur({ ...AU_REPOS, actionRequise: 'ECHEC_PERSISTANT' }).messageFeuille,
    ).toBe('ERR-016');
    expect(construireIndicateur(AU_REPOS)).toEqual({ code: 'SYN-OK' });
  });
});
