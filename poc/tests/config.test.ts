import { describe, expect, it } from 'vitest';
import { ErreurConfiguration, lireConfig } from '../src/config';

describe('lireConfig', () => {
  it('échoue explicitement si VITE_GOOGLE_WEB_CLIENT_ID est vide', () => {
    expect(() => lireConfig({ VITE_GOOGLE_WEB_CLIENT_ID: '  ' })).toThrow(ErreurConfiguration);
    expect(() => lireConfig({})).toThrow(/VITE_GOOGLE_WEB_CLIENT_ID/);
  });

  it('applique les valeurs par défaut', () => {
    expect(lireConfig({ VITE_GOOGLE_WEB_CLIENT_ID: 'id' })).toEqual({
      clientIdWeb: 'id',
      basePath: '/',
      origine: '(non renseignée)',
      proprieteApp: 'objectifs-taches-poc',
      nomDossier: 'Done Juan (POC)',
    });
  });

  it('lit les valeurs fournies', () => {
    const config = lireConfig({
      VITE_GOOGLE_WEB_CLIENT_ID: 'id',
      VITE_BASE_PATH: '/depot/',
      VITE_APP_ORIGIN: 'https://exemple.test',
      VITE_POC_APP_PROPERTY: 'prop',
      VITE_POC_FOLDER_NAME: 'Dossier',
    });
    expect(config).toMatchObject({
      basePath: '/depot/',
      proprieteApp: 'prop',
      nomDossier: 'Dossier',
    });
  });
});
