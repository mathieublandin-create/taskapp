import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FournisseurJetonAndroid } from '../src/auth/auth-android';
import { FournisseurJetonWeb } from '../src/auth/auth-web';
import type { GoogleAuthNativePlugin } from '../src/auth/plugin-natif';
import { SCOPES_POC } from '../src/auth/ports';
import type { FournisseurJeton } from '../src/auth/ports';
import { lireConfig } from '../src/config';
import { Diagnostic } from '../src/diagnostic';
import { ClientDrive } from '../src/drive/client-drive';
import { exporterCsv, exporterJson } from '../src/journal/export';
import { Journal } from '../src/journal/journal';
import { StockageMemoire } from '../src/journal/stockage';

// Sans préfixe reconnaissable : seule la déclaration du jeton peut le masquer.
const SENTINELLE = 'SENTINELLE-SECRETE-0123456789';
const SENTINELLE_GOOGLE = 'ya29.SENTINELLE-SECRETE-9876543210';
const SENTINELLE_ID = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxMjMifQ.SIGNATURESENTINELLE';
const SENTINELLE_CODE = 'SENTINELLE-CODE-AUTORISATION';
const config = lireConfig({ VITE_GOOGLE_WEB_CLIENT_ID: 'client-test' });

/** Simulateur de GIS : renvoie la sentinelle comme jeton d'accès. */
function simulerGis() {
  vi.stubGlobal('google', {
    accounts: {
      oauth2: {
        initTokenClient: (c: { callback: (r: unknown) => void; scope: string }) => ({
          requestAccessToken: () =>
            c.callback({
              access_token: SENTINELLE,
              expires_in: '3599',
              scope: c.scope,
              token_type: 'Bearer',
              id_token: SENTINELLE_ID,
              code: SENTINELLE_CODE,
            }),
        }),
        hasGrantedAllScopes: () => true,
      },
    },
  });
}

/** Simulateur de fetch : exige le jeton et l'inclut volontairement dans les corps d'erreur. */
function simulerFetch(): { appels: string[]; fetch: typeof fetch } {
  const appels: string[] = [];
  const fetchSimule = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    const adresse = String(url);
    appels.push(adresse);
    const entetes = (init?.headers ?? {}) as Record<string, string>;
    expect(entetes.Authorization).toBe(`Bearer ${SENTINELLE}`);
    const json = (corps: unknown, status = 200) => new Response(JSON.stringify(corps), { status });
    if (adresse.includes('userinfo')) return json({ email: 'a@b.test', name: 'A' });
    if (adresse.includes('alt=media')) return new Response(new Uint8Array([1, 2, 3]));
    if (adresse.includes('startPageToken')) return json({ startPageToken: '42' });
    if (adresse.includes('/changes')) return json({ changes: [], newStartPageToken: '43' });
    if (adresse.includes('pageSize=1&')) {
      return new Response(`token invalide ${SENTINELLE} ; Bearer ${SENTINELLE}`, { status: 401 });
    }
    if (adresse.includes('/files?q=')) {
      return json({
        files: [{ id: 'f1', name: 'pc-poc.etat.json.gz', mimeType: 'application/gzip' }],
      });
    }
    return json({ id: 'id-créé', name: 'x', mimeType: 'application/gzip' });
  });
  return { appels, fetch: fetchSimule as unknown as typeof fetch };
}

async function parcours(auth: FournisseurJeton, appelerFetch: typeof fetch) {
  const journal = new Journal(new StockageMemoire(), 'pc', undefined);
  const diagnostic = new Diagnostic({
    auth,
    drive: new ClientDrive(auth, config, appelerFetch),
    journal,
    config,
    appareil: 'pc',
    stockage: localStorage,
  });
  await diagnostic.seConnecter();
  await diagnostic.creer();
  await diagnostic.lister();
  await diagnostic.lire();
  await diagnostic.modifier();
  await diagnostic.changements();
  await diagnostic.appelerDrive();
  await diagnostic.synchroniser();
  return journal;
}

function verifierAbsenceDeSecrets(contenu: string) {
  expect(contenu).not.toContain(SENTINELLE);
  expect(contenu).not.toContain(SENTINELLE_GOOGLE);
  expect(contenu).not.toContain('SENTINELLE-SECRETE');
  expect(contenu).not.toContain(SENTINELLE_ID);
  expect(contenu).not.toContain(SENTINELLE_CODE);
}

describe('journal : aucune valeur de jeton (spécification §2)', () => {
  beforeEach(() => {
    localStorage.clear();
    simulerGis();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('Web : le journal exporté (JSON et CSV) ne contient pas la sentinelle', async () => {
    const { fetch: fetchSimule, appels } = simulerFetch();
    const auth = new FournisseurJetonWeb('client-test', fetchSimule, async () => undefined);
    const journal = await parcours(auth, fetchSimule);
    const entrees = await journal.lire();

    expect(appels.length).toBeGreaterThan(5); // le jeton a bien servi aux appels Drive
    expect(entrees.length).toBeGreaterThan(10);
    verifierAbsenceDeSecrets(exporterJson(entrees));
    verifierAbsenceDeSecrets(exporterCsv(entrees));
    expect(exporterJson(entrees)).toContain('"codeHttp": 401'); // l'erreur est bien journalisée
  });

  it('Android : le journal exporté ne contient pas la sentinelle', async () => {
    const plugin: GoogleAuthNativePlugin = {
      signIn: async () => ({ email: 'a@b.test', nom: 'A' }),
      authorizeSilently: async () => ({
        statut: 'OK',
        echeance: 1,
        scopesAccordes: [...SCOPES_POC],
      }),
      authorizeInteractive: async () => ({
        statut: 'OK',
        echeance: 1,
        scopesAccordes: [...SCOPES_POC],
      }),
      getAccessToken: async () => ({ accessToken: SENTINELLE }),
      signatureInfo: vi.fn(),
      signOut: async () => undefined,
      clearAuthorizationState: async () => undefined,
    };
    const { fetch: fetchSimule } = simulerFetch();
    const journal = await parcours(new FournisseurJetonAndroid(plugin), fetchSimule);
    const entrees = await journal.lire();
    verifierAbsenceDeSecrets(exporterJson(entrees));
    verifierAbsenceDeSecrets(exporterCsv(entrees));
  });

  it('masque les motifs de secrets même sans déclaration préalable', async () => {
    const journal = new Journal(new StockageMemoire(), 'pc');
    await journal.enregistrer({
      mesure: '3.5',
      operation: 'test',
      resultat: 'Échec',
      codeErreur: `Authorization: Bearer ${SENTINELLE_GOOGLE}`,
      detail: `access_token=${SENTINELLE} id_token: ${SENTINELLE_ID} ${SENTINELLE_GOOGLE}`,
    });
    verifierAbsenceDeSecrets(exporterJson(await journal.lire()));
  });
});
