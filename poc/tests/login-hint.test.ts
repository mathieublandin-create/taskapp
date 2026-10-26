import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FournisseurJetonWeb } from '../src/auth/auth-web';
import { SCOPES_POC } from '../src/auth/ports';
import { lireConfig } from '../src/config';
import { Diagnostic } from '../src/diagnostic';
import { ClientDrive } from '../src/drive/client-drive';
import { Journal } from '../src/journal/journal';
import { StockageMemoire } from '../src/journal/stockage';

const config = lireConfig({ VITE_GOOGLE_WEB_CLIENT_ID: 'client-test' });

/** Simulateur de GIS qui capture la configuration passée à initTokenClient. */
function simulerGis() {
  const configurations: { login_hint?: string }[] = [];
  vi.stubGlobal('google', {
    accounts: {
      oauth2: {
        initTokenClient: (c: {
          callback: (r: unknown) => void;
          scope: string;
          login_hint?: string;
        }) => {
          configurations.push(c);
          return {
            requestAccessToken: () =>
              c.callback({
                access_token: 'jeton-test-0123456789',
                expires_in: '3599',
                scope: c.scope,
              }),
          };
        },
        hasGrantedAllScopes: () => true,
      },
    },
  });
  return configurations;
}

const fetchIdentite = (async () =>
  new Response(JSON.stringify({ email: 'a@b.test', name: 'A' }))) as unknown as typeof fetch;

describe('login_hint envoyé à GIS (V-DEC034-5)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('sans identité en cache : pas de login_hint', async () => {
    const configurations = simulerGis();
    const auth = new FournisseurJetonWeb('client-test', fetchIdentite, async () => undefined);
    await auth.connecter(SCOPES_POC);
    expect(configurations[0]?.login_hint).toBeUndefined();
    expect(auth.loginHintEnvoye()).toBe(false);
  });

  it('avec identité en cache : login_hint = adresse, journalisé dans le détail', async () => {
    localStorage.setItem('poc.identite', JSON.stringify({ email: 'a@b.test', nom: 'A' }));
    const configurations = simulerGis();
    const auth = new FournisseurJetonWeb('client-test', fetchIdentite, async () => undefined);
    const journal = new Journal(new StockageMemoire(), 'pc');
    const diagnostic = new Diagnostic({
      auth,
      drive: new ClientDrive(auth, config),
      journal,
      config,
      appareil: 'pc',
      stockage: localStorage,
    });
    await diagnostic.synchroniser();
    expect(configurations[0]?.login_hint).toBe('a@b.test');
    const entrees = await journal.lire();
    expect(entrees.find((e) => e.operation === 'Synchroniser')?.detail).toContain(
      'login_hint : oui',
    );
  });
});
