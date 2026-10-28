import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import {
  erreurClientGis,
  lireReponseGis,
  PasserelleGisNavigateur,
  type GoogleGis,
} from '@src/compte/infrastructure/auth/passerelle-gis-navigateur';

type Configuration = Parameters<GoogleGis['accounts']['oauth2']['initTokenClient']>[0];

/** Script GIS simulé : `repondre` choisit le rappel appelé par requestAccessToken. */
const googleSimule = (
  repondre: (c: Configuration) => void,
  configurations: Array<Configuration>,
): GoogleGis => ({
  accounts: {
    oauth2: {
      initTokenClient: (c) => {
        configurations.push(c);
        return {
          requestAccessToken: () => {
            repondre(c);
          },
        };
      },
    },
  },
});

describe('PasserelleGisNavigateur (ST-US-022 §4.4, R12)', () => {
  it('UT-COMP-US-022-12 demanderJeton — script indisponible : SCRIPT_INDISPONIBLE ; jeton : portées et durée lues ; login_hint transmis', async () => {
    expect(
      await new PasserelleGisNavigateur(() => Promise.resolve(undefined)).demanderJeton({
        clientId: 'c',
        portees: ['openid'],
      }),
    ).toEqual(echec({ type: 'SCRIPT_INDISPONIBLE' }));

    const configurations: Array<Configuration> = [];
    const google = googleSimule((c) => {
      c.callback({ access_token: 'j', expires_in: '3599', scope: 'openid email' });
    }, configurations);
    const passerelle = new PasserelleGisNavigateur(() => Promise.resolve(google));

    expect(
      await passerelle.demanderJeton({
        clientId: 'c',
        portees: ['openid', 'email'],
        indice: 'a@b.c',
      }),
    ).toEqual(succes({ jeton: 'j', expireEnSecondes: 3599, portees: ['openid', 'email'] }));
    expect(configurations[0]?.login_hint).toBe('a@b.c');
    expect(configurations[0]?.scope).toBe('openid email');
  });

  it('UT-COMP-US-022-13 demanderJeton — erreurs de la fenêtre et de la réponse traduites', async () => {
    const google = googleSimule((c) => {
      c.error_callback({ type: 'popup_closed' });
    }, []);

    expect(
      await new PasserelleGisNavigateur(() => Promise.resolve(google)).demanderJeton({
        clientId: 'c',
        portees: [],
      }),
    ).toEqual(echec({ type: 'POPUP_CLOSED' }));
    expect(erreurClientGis('popup_failed_to_open')).toEqual({ type: 'POPUP_FAILED_TO_OPEN' });
    expect(erreurClientGis(undefined)).toEqual({ type: 'INCONNUE', code: 'inconnue' });
    expect(lireReponseGis({ error: 'access_denied' })).toEqual(echec({ type: 'ACCESS_DENIED' }));
    expect(lireReponseGis({ error: 'invalid_scope' })).toEqual(
      echec({ type: 'INCONNUE', code: 'invalid_scope' }),
    );
    expect(lireReponseGis({ access_token: 'j' })).toEqual(succes({ jeton: 'j', portees: [] }));
  });
});
