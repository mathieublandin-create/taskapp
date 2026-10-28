import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import {
  fichiersCouverts,
  lireRangCourant,
  motifSelection,
  type RangsFichier,
  type RegleRang,
} from './tests/support/rangs/selection-rangs';

const chemin = (relatif: string): string => fileURLToPath(new URL(relatif, import.meta.url));
const lireJson = (relatif: string): unknown => JSON.parse(readFileSync(chemin(relatif), 'utf8'));

// conventions.md §11.14 (Q-BEN-LOT001-2, 3) : seuls les tests des rangs livrés s'exécutent ; la branche de lot
// et `main` restent vertes. RANG_COURANT=n (entier) remplace le rang du fichier pour le travail sur une branche d'US.
const rangCourant = lireRangCourant(
  process.env['RANG_COURANT'],
  (lireJson('./tests/support/rangs/rang-courant.json') as { rangCourant: number }).rangCourant,
);
const regles = (
  lireJson('./tests/support/rangs/rangs-tests.json') as { regles: ReadonlyArray<RegleRang> }
).regles;
const fichiers = (
  lireJson('./tests/support/rangs/rangs-fichiers.json') as {
    fichiers: Record<string, RangsFichier>;
  }
).fichiers;

export default defineConfig({
  resolve: {
    alias: {
      '@src': chemin('./src'),
      '@tests': chemin('./tests'),
      // Phase rouge (E10) : les squelettes de src/ lèvent ErreurNonImplementee (ST-socle-ecriture §13).
      // Alias retiré quand plus aucun squelette ne l'importe (fin du lot, conventions.md §11.14).
      '@non-implemente': chemin('./tests/support/erreur-non-implementee.ts'),
    },
  },
  test: {
    include: [
      'tests/unitaires/**/*.test.ts',
      'tests/integration/**/*.test.ts',
      'tests/contrats/**/*.contrat.ts',
    ],
    testNamePattern: motifSelection(regles, rangCourant),
    environment: 'node',
    setupFiles: ['tests/support/fast-check.ts'],
    sequence: { shuffle: process.env['CI'] === 'true' },
    coverage: {
      provider: 'v8',
      include: [...fichiersCouverts(fichiers, rangCourant)],
      exclude: ['src/composition/**', 'src/main.tsx', '**/*.d.ts'],
    },
  },
});
