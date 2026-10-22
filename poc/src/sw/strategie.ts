import type { VitePWAOptions } from 'vite-plugin-pwa';

/**
 * Stratégie de service worker (R12) : précache complet de l'application,
 * navigation de repli sur index.html. Le script Google Identity Services
 * n'est ni précaché ni mis en cache à l'exécution : l'application démarre sans lui.
 */
export const optionsWorkbox: NonNullable<VitePWAOptions['workbox']> = {
  globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'],
  navigateFallback: 'index.html',
  runtimeCaching: [],
  cleanupOutdatedCaches: true,
};

export const manifeste: NonNullable<VitePWAOptions['manifest']> = {
  name: 'Diagnostic POC',
  short_name: 'Diagnostic',
  description: 'Application de test jetable (R1, R2, R11)',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#3880ff',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
};
