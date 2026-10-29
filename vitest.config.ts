import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import {
  fichiersCouverts,
  lireRangCourant,
  motifSelection,
  type RangsFichier,
  type RegleRang,
} from './tests/support/rangs/selection-rangs.ts';

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
    testNamePattern: motifSelection(regles, rangCourant),
    // Q-BEN-LOT001-7 : jsdom pour les seuls tests de composants (presentation/ui), dans un projet dédié ; la
    // sélection par rang (testNamePattern) et la couverture s'appliquent aux deux projets.
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          include: [
            'tests/unitaires/**/*.test.ts',
            'tests/integration/**/*.test.ts',
            'tests/contrats/**/*.contrat.ts',
          ],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'ihm',
          include: ['tests/unitaires/**/presentation/ui/**/*.test.tsx'],
          environment: 'jsdom',
          // Les composants Ionic passent par @lit/react, dont l'export « node » est la version sans effets de
          // bord (rendu serveur) : les propriétés des composants ne seraient pas appliquées dans jsdom. Vite doit
          // résoudre ces paquets avec la condition « browser ».
          server: { deps: { inline: [/@lit\/react/, /@stencil\/react-output-target/] } },
        },
        resolve: { conditions: ['browser'] },
      },
    ],
    setupFiles: ['tests/support/fast-check.ts', 'tests/support/indexeddb-fake.ts'],
    sequence: { shuffle: process.env['CI'] === 'true' },
    coverage: {
      provider: 'v8',
      // json-summary : rapport par fichier lu par la non-régression de couverture (conventions.md §12, DT-005).
      reporter: ['text', 'html', 'clover', 'json', 'json-summary'],
      include: [...fichiersCouverts(fichiers, rangCourant)],
      exclude: ['src/composition/**', 'src/main.tsx', '**/*.d.ts'],
      // conventions.md §12 : tous les seuils par motif de chemin, dès le rang 0 (Q-BEN-E12-2). Un motif qui ne
      // couvre encore aucun fichier (`coverage.include` limité aux rangs livrés) est sans effet jusqu'à son rang.
      thresholds: {
        lines: 85,
        branches: 75,
        'src/*/domaine/**': { lines: 95, branches: 90 },
        'src/synchronisation/{domaine,application}/**': { lines: 95, branches: 90 },
        'src/*/application/**': { lines: 90, branches: 85 },
        'src/*/presentation/modeles-de-vue/**': { lines: 90, branches: 85 },
        'src/commun/presentation/{format,messages}/**': { lines: 90, branches: 85 },
        'src/*/presentation/ui/**': { lines: 70, branches: 60 },
        'src/*/infrastructure/**': { lines: 70, branches: 60 },
        'src/infrastructure-google/**': { lines: 70, branches: 60 },
      },
    },
  },
});
