import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { optionsPwa } from './pwa.config.ts';

// conventions.md §9.1, §14 : la portée du service worker et le manifeste dérivent de VITE_BASE_PATH, en un seul
// point (`pwa.config.ts`). Aucune adresse n'est écrite en dur.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const base = env['VITE_BASE_PATH'] ?? '/';
  return {
    base,
    plugins: [react(), VitePWA(optionsPwa({ env: env['VITE_ENV'], base }))],
  };
});
