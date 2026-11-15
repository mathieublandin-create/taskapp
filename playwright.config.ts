import { readFileSync } from 'node:fs';
import { defineConfig } from '@playwright/test';
import { ORIGINE_HARNAIS, PORT_HARNAIS } from './tests/support/harnais/port';
import { ORIGINE_IHM, PORT_IHM } from './tests/steps-ihm/support/serveur-ihm';
import {
  lireRangCourant,
  motifTestsNonLivres,
  type RegleRang,
} from './tests/support/rangs/selection-rangs';

// conventions.md §11.12 : parcours Playwright hors Cucumber (tests/e2e/), Chromium, sur le build de production
// servi en statique (`vite preview`). Les variables VITE_* sont des valeurs de test, sans secret ni accès à Google.
const PORT = 4173;
const ORIGINE = `http://localhost:${String(PORT)}`;

// ST-CORR-E13B-LOT-001 §9.1 (conventions.md §11.14) : un test de navigateur qui porte un identifiant `E2E-…` suit les
// règles de `rangs-tests.json` ; il ne s'exécute qu'à partir de son rang (RANG_COURANT=n le remplace en local, jamais en
// CI). Les tests sans identifiant (antérieurs aux corrections de l'E13b) s'exécutent toujours.
const lireJson = (chemin: string): unknown =>
  JSON.parse(readFileSync(new URL(chemin, import.meta.url), 'utf8'));
const RANG_COURANT = lireRangCourant(
  process.env['RANG_COURANT'],
  (lireJson('./tests/support/rangs/rang-courant.json') as { rangCourant: number }).rangCourant,
);
const REGLES = (
  lireJson('./tests/support/rangs/rangs-tests.json') as { regles: ReadonlyArray<RegleRang> }
).regles;

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: process.env['CI'] === 'true',
  grepInvert: motifTestsNonLivres(REGLES, RANG_COURANT),
  reporter: 'list',
  use: {
    baseURL: ORIGINE,
    browserName: 'chromium',
    // Poste sans le Chromium attendu par cette version de Playwright : PLAYWRIGHT_CHROMIUM_EXECUTABLE désigne un autre.
    ...(process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE'] === undefined
      ? {}
      : { launchOptions: { executablePath: process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE'] } }),
  },
  webServer: [
    {
      command: `pnpm build && pnpm exec vite preview --port ${String(PORT)} --strictPort`,
      url: ORIGINE,
      reuseExistingServer: process.env['CI'] !== 'true',
      timeout: 120_000,
      env: {
        VITE_ENV: 'recette',
        VITE_BASE_PATH: '/',
        VITE_APP_ORIGIN: ORIGINE,
        VITE_GOOGLE_WEB_CLIENT_ID: 'test.apps.googleusercontent.com',
      },
    },
    // Harnais de l'écran connecté (tests/support/harnais/) : servi par vite, hors du build de production.
    {
      command: `pnpm exec vite --port ${String(PORT_HARNAIS)} --strictPort`,
      url: ORIGINE_HARNAIS,
      reuseExistingServer: process.env['CI'] !== 'true',
      timeout: 120_000,
    },
    // Build `test-ihm` (ST-US-018 v0.4 §12.3), partagé par les tests de navigateur qui ouvrent l'application réelle avec
    // Google et Drive simulés (onglets, feuille de synchronisation, ouverture : ST-CORR-E13B-LOT-001 §9.2). Un seul
    // serveur pour tous les fichiers : deux fichiers lancés en parallèle ne se disputent plus le port. Le build n'est
    // produit que s'il manque (en CI, `pnpm cucumber:ihm` vient de le produire) ; en local, le refaire après un
    // changement de src/ (`pnpm build:test-ihm`).
    {
      command: `(test -f dist-test-ihm/index.html || pnpm build:test-ihm) && pnpm exec vite preview --mode test-ihm --outDir dist-test-ihm --port ${String(PORT_IHM)} --strictPort`,
      url: ORIGINE_IHM,
      reuseExistingServer: process.env['CI'] !== 'true',
      timeout: 180_000,
      // Mêmes valeurs fictives que le job `ihm` de la CI (aucun secret, aucun accès à Google).
      env: {
        VITE_BASE_PATH: '/',
        VITE_APP_ORIGIN: ORIGINE_IHM,
        VITE_GOOGLE_WEB_CLIENT_ID: 'ihm-fictif.apps.googleusercontent.com',
      },
    },
  ],
});
