import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import {
  identiteDepuisUserinfo,
  lireIdentiteUserinfo,
  URL_USERINFO,
} from '@src/compte/infrastructure/auth/lecture-identite';
import { IDENTITE_A } from '@tests/support/compte/doublures-compte';

describe('Lecture de l’identité par userinfo (ST-US-022 §6.4, §7)', () => {
  it('UT-COMP-US-022-76 identiteDepuisUserinfo — sub et email valides ; sinon accès à renouveler', () => {
    expect(identiteDepuisUserinfo({ sub: 'sub-A', email: 'a@exemple.test' })).toEqual(
      succes(IDENTITE_A),
    );
    expect(identiteDepuisUserinfo({ sub: '', email: 'a@exemple.test' })).toEqual(
      echec({ type: 'SessionARenouveler', code: 'userinfo_invalide' }),
    );
    expect(identiteDepuisUserinfo(undefined)).toEqual(
      echec({ type: 'SessionARenouveler', code: 'userinfo_invalide' }),
    );
  });

  it('UT-COMP-US-022-77 lireIdentiteUserinfo — en-tête Authorization ; 401 : à renouveler ; réseau : ReseauIndisponible', async () => {
    const appels: Array<{ url: string; init: RequestInit | undefined }> = [];
    const ok = lireIdentiteUserinfo(((url: string, init?: RequestInit) => {
      appels.push({ url, init });
      return Promise.resolve(
        new Response(JSON.stringify({ sub: 'sub-A', email: 'a@exemple.test' }), { status: 200 }),
      );
    }) as typeof fetch);

    expect(await ok('ya29.j')).toEqual(succes(IDENTITE_A));
    expect(appels).toEqual([
      { url: URL_USERINFO, init: { headers: { Authorization: 'Bearer ya29.j' } } },
    ]);
    expect(
      await lireIdentiteUserinfo(() => Promise.resolve(new Response('x', { status: 401 })))('j'),
    ).toEqual(echec({ type: 'SessionARenouveler', code: 'userinfo_401' }));
    expect(
      await lireIdentiteUserinfo(() => Promise.resolve(new Response('pas du json')))('j'),
    ).toEqual(echec({ type: 'SessionARenouveler', code: 'userinfo_invalide' }));
    expect(await lireIdentiteUserinfo(() => Promise.reject(new TypeError('x')))('j')).toEqual(
      echec({ type: 'ReseauIndisponible' }),
    );
  });
});
