import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { optionsPwa } from './pwa.config.ts';

// conventions.md §9.1, §14 : la portée du service worker et le manifeste dérivent de VITE_BASE_PATH, en un seul
// point (`pwa.config.ts`). Aucune adresse n'est écrite en dur.

/** Mode de construction de la chaîne `@ihm` (ST-US-018 v0.4 §6.4 n° 6) : `vite build --mode test-ihm`. */
export const MODE_TEST_IHM = 'test-ihm';

/**
 * Dans le seul mode `test-ihm`, l'import de la composition par `main.tsx` (`./composition/web`) désigne la composition
 * de test. `test-ihm.ts` importe `./web` (spécificateur distinct) : il réutilise `demarrerAvec` sans se désigner
 * lui-même. Tout autre mode n'a aucun alias : le build de production ne contient jamais la composition de test.
 */
export const aliasDuMode = (
  mode: string,
): ReadonlyArray<{ readonly find: RegExp; readonly replacement: string }> =>
  mode === MODE_TEST_IHM
    ? [
        {
          find: /^\.\/composition\/web$/,
          replacement: fileURLToPath(new URL('./src/composition/test-ihm.ts', import.meta.url)),
        },
      ]
    : [];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const base = env['VITE_BASE_PATH'] ?? '/';
  return {
    base,
    resolve: { alias: aliasDuMode(mode) },
    plugins: [react(), VitePWA(optionsPwa({ env: env['VITE_ENV'], base }))],
  };
});
