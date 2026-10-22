import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const chemin = (relatif: string): string => fileURLToPath(new URL(relatif, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@src': chemin('./src'),
      '@tests': chemin('./tests'),
      // Phase rouge (E10) : les squelettes de src/ lèvent ErreurNonImplementee (ST-socle-ecriture §13).
      // Alias retiré quand plus aucun squelette ne l'importe (E12).
      '@non-implemente': chemin('./tests/support/erreur-non-implementee.ts'),
    },
  },
  test: {
    include: [
      'tests/unitaires/**/*.test.ts',
      'tests/integration/**/*.test.ts',
      'tests/contrats/**/*.contrat.ts',
    ],
    environment: 'node',
    setupFiles: ['tests/support/fast-check.ts'],
    sequence: { shuffle: process.env['CI'] === 'true' },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/composition/**', 'src/main.tsx', '**/*.d.ts'],
    },
  },
});
