import { describe, expect, it } from 'vitest';
import {
  construireUrlAutorisation,
  encoderBase64Url,
  uriRedirection,
} from '@src/compte/infrastructure/auth/url-autorisation';

describe('URL d’autorisation (DAT §4.1.7)', () => {
  it('UT-US-022-43 construireUrlAutorisation — porte exactement les paramètres de la redirection silencieuse', () => {
    const url = new URL(
      construireUrlAutorisation({
        clientId: 'client.apps.googleusercontent.com',
        redirectUri: 'https://mathieublandin-create.github.io/taskapp/',
        portees: ['openid', 'email', 'https://www.googleapis.com/auth/drive.file'],
        state: 'etat',
        indice: 'a@exemple.test',
        interaction: 'SILENCIEUSE',
      }),
    );

    expect(`${url.origin}${url.pathname}`).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: 'client.apps.googleusercontent.com',
      redirect_uri: 'https://mathieublandin-create.github.io/taskapp/',
      response_type: 'token',
      scope: 'openid email https://www.googleapis.com/auth/drive.file',
      prompt: 'none',
      include_granted_scopes: 'true',
      login_hint: 'a@exemple.test',
      state: 'etat',
    });
  });

  it('UT-US-022-43 construireUrlAutorisation — repli interactif d’un geste : mêmes paramètres, sans prompt (DAT v0.11.3 §4.1.7, Q-ST022-STA-2)', () => {
    const url = new URL(
      construireUrlAutorisation({
        clientId: 'client.apps.googleusercontent.com',
        redirectUri: 'https://mathieublandin-create.github.io/taskapp/',
        portees: ['openid', 'email', 'https://www.googleapis.com/auth/drive.file'],
        state: 'Zq9xStateUnique',
        indice: 'a@exemple.test',
        interaction: 'INTERACTIVE',
      }),
    );

    expect(url.searchParams.has('prompt')).toBe(false);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: 'client.apps.googleusercontent.com',
      redirect_uri: 'https://mathieublandin-create.github.io/taskapp/',
      response_type: 'token',
      scope: 'openid email https://www.googleapis.com/auth/drive.file',
      include_granted_scopes: 'true',
      login_hint: 'a@exemple.test',
      state: 'Zq9xStateUnique',
    });
  });

  it('UT-US-022-43 uriRedirection et encoderBase64Url — barre oblique finale ; base64url sans +, / ni =', () => {
    expect(
      uriRedirection({
        origine: 'https://mathieublandin-create.github.io',
        cheminDeBase: '/taskapp/',
      }),
    ).toBe('https://mathieublandin-create.github.io/taskapp/');
    expect(encoderBase64Url(new Uint8Array([0xfb, 0xff, 0xbf, 0x00]))).toBe('-_-_AA');
    expect(encoderBase64Url(new Uint8Array(16).fill(0xff))).toMatch(/^[A-Za-z0-9_-]{22}$/);
  });
});
