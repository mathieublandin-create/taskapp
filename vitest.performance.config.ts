import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const chemin = (relatif: string): string => fileURLToPath(new URL(relatif, import.meta.url));

// Mesures de performance indicatives (ST-socle-ecriture.md §11, §14) : hors du jeu de tests courant, car la
// préparation des 85 000 lignes sur fake-indexeddb dure plusieurs minutes. Commande : `pnpm test:performance`.
export default defineConfig({
  resolve: {
    alias: {
      '@src': chemin('./src'),
      '@tests': chemin('./tests'),
      '@non-implemente': chemin('./tests/support/erreur-non-implementee.ts'),
    },
  },
  test: {
    include: ['tests/performance/**/*.perf.ts'],
    environment: 'node',
    setupFiles: ['tests/support/indexeddb-fake.ts'],
    testTimeout: 600_000,
  },
});
