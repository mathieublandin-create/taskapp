import { defineConfig } from '@playwright/test';

// conventions.md §11.12 : parcours Playwright hors Cucumber (tests/e2e/), Chromium, sur le build de production
// servi en statique (`vite preview`). Les variables VITE_* sont des valeurs de test, sans secret ni accès à Google.
const PORT = 4173;
const ORIGINE = `http://localhost:${String(PORT)}`;

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: process.env['CI'] === 'true',
  reporter: 'list',
  use: {
    baseURL: ORIGINE,
    browserName: 'chromium',
    // Poste sans le Chromium attendu par cette version de Playwright : PLAYWRIGHT_CHROMIUM_EXECUTABLE désigne un autre.
    ...(process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE'] === undefined
      ? {}
      : { launchOptions: { executablePath: process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE'] } }),
  },
  webServer: {
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
});
