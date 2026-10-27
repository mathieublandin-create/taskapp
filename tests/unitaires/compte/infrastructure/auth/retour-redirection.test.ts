import { describe, expect, it } from 'vitest';
import {
  consommerRetourRedirection,
  type NavigationRetour,
} from '@src/compte/infrastructure/auth/retour-redirection';

/** Doublure de la navigation : journalise l'ordre des appels. */
class NavigationEspionne implements NavigationRetour {
  readonly appels: Array<string> = [];
  constructor(private fragment: string) {}
  lireFragment(): string {
    this.appels.push('lire');
    return this.fragment;
  }
  effacerFragment(): void {
    this.appels.push('effacer');
    this.fragment = '';
  }
}

const CAS: ReadonlyArray<readonly [string, string]> = [
  [
    'jeton',
    '#access_token=ya29.abc&expires_in=3599&scope=openid%20email&state=s1&token_type=Bearer',
  ],
  ['erreur', '#error=interaction_required&state=s1'],
  ['mal formé', '#%%%&&=='],
  ['vide', ''],
];

describe('consommerRetourRedirection (RED-02)', () => {
  it.each(CAS)(
    'UT-US-022-20 consommerRetourRedirection — lit puis efface le fragment avant toute analyse, cas « %s »',
    (_nom, fragment) => {
      const navigation = new NavigationEspionne(fragment);

      consommerRetourRedirection(navigation);

      expect(navigation.appels).toEqual(['lire', 'effacer']);
      expect(navigation.lireFragment()).toBe('');
    },
  );

  it('UT-US-022-20 consommerRetourRedirection — renvoie le jeton, sa durée, ses portées et le state', () => {
    const navigation = new NavigationEspionne(CAS[0]?.[1] ?? '');

    expect(consommerRetourRedirection(navigation)).toEqual({
      type: 'JETON',
      jeton: 'ya29.abc',
      expireEnSecondes: 3599,
      portees: ['openid', 'email'],
      state: 's1',
    });
  });

  it('UT-US-022-20 consommerRetourRedirection — renvoie l’erreur de Google et AUCUN pour un fragment vide', () => {
    expect(consommerRetourRedirection(new NavigationEspionne(CAS[1]?.[1] ?? ''))).toEqual({
      type: 'ERREUR',
      code: 'interaction_required',
      state: 's1',
    });
    expect(consommerRetourRedirection(new NavigationEspionne(''))).toEqual({ type: 'AUCUN' });
  });
});
