import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { manifeste, optionsWorkbox } from './src/sw/strategie.ts';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const base = env.VITE_BASE_PATH?.trim() || '/';
  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: { ...manifeste, start_url: base, scope: base },
        workbox: optionsWorkbox,
      }),
    ],
    test: { environment: 'jsdom', include: ['tests/**/*.test.ts'] },
  };
});
