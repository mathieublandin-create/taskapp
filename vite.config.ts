import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// conventions.md §9.1, §14 : la portée du service worker et le manifeste dérivent de VITE_BASE_PATH, en un seul
// point. Aucune adresse n'est écrite en dur ; le service worker de l'application arrive au rang 12.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const base = env['VITE_BASE_PATH'] ?? '/';
  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        // Le service worker n'est pas enregistré avant le rang 12 (US-018) : aucun script d'enregistrement injecté.
        injectRegister: false,
        manifest: {
          name: env['VITE_ENV'] === 'recette' ? 'Done Juan (recette)' : 'Done Juan',
          short_name: 'Done Juan',
          lang: 'fr',
          start_url: base,
          scope: base,
          display: 'standalone',
        },
      }),
    ],
  };
});
