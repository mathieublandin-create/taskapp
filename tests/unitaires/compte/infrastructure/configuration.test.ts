import { describe, expect, it } from 'vitest';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import { lireConfiguration, plateformeDepuisAgent } from '@src/compte/infrastructure/configuration';

const VARIABLES = {
  VITE_ENV: 'recette',
  VITE_BASE_PATH: '/taskapp/',
  VITE_APP_ORIGIN: 'https://exemple.test',
  VITE_GOOGLE_WEB_CLIENT_ID: 'client.apps.googleusercontent.com',
};
const SAFARI_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1';
const CHROME_ANDROID =
  'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36';

describe('lireConfiguration (ST-US-022 §3.2 n° 31, conventions §9.1)', () => {
  it('UT-COMP-US-022-40 lit les variables publiques et calcule l’URI de redirection et la plateforme', () => {
    expect(lireConfiguration(VARIABLES, { agent: CHROME_ANDROID })).toEqual({
      env: 'recette',
      clientId: 'client.apps.googleusercontent.com',
      cheminDeBase: '/taskapp/',
      origine: 'https://exemple.test',
      redirectUri: 'https://exemple.test/taskapp/',
      plateforme: 'web',
    });
    expect(plateformeDepuisAgent(SAFARI_IPHONE)).toBe('web-ios');
    expect(plateformeDepuisAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5)).toBe(
      'web-ios',
    );
    expect(plateformeDepuisAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 0)).toBe('web');
  });

  it('UT-COMP-US-022-41 une variable absente ou un environnement inconnu est une erreur de programmation', () => {
    expect(() => lireConfiguration({ ...VARIABLES, VITE_ENV: 'test' }, { agent: '' })).toThrow(
      ErreurProgrammation,
    );
    expect(() =>
      lireConfiguration({ ...VARIABLES, VITE_GOOGLE_WEB_CLIENT_ID: '' }, { agent: '' }),
    ).toThrow(ErreurProgrammation);
  });
});
