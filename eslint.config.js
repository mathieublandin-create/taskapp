// Configuration ESLint (conventions.md §6, §7.2, §7.4, §10.2, §14.2). Export par défaut imposé par l'outil (RCD-13).
import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import globals from 'globals';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const interditsTemps = [
  {
    selector: "NewExpression[callee.name='Date'][arguments.length=0]",
    message: 'Heure courante : port Horloge (§7.2).',
  },
  {
    selector: "NewExpression[callee.name='Date'][arguments.length>1]",
    message: 'Date en heure locale interdite (§7.2).',
  },
  { selector: 'TSEnumDeclaration', message: 'Pas d’enum : union de littéraux (§6.2).' },
  { selector: 'ExportDefaultDeclaration', message: 'Exports nommés uniquement (RCD-13).' },
  { selector: 'TSModuleDeclaration[kind="namespace"]', message: 'Pas de namespace (§6.2).' },
  {
    selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
    message: 'dangerouslySetInnerHTML interdit (§9.3).',
  },
];

// Chaque restriction nomme les fichiers de src/ qui en sont dispensés : les exceptions sont déclarées ici,
// par blocs `files`, jamais par commentaire local (conventions.md §14.2).
const ADAPTATEUR_PLANIFICATEUR = 'src/commun/infrastructure/planificateur-navigateur.ts';
const ADAPTATEUR_ALEATOIRE = 'src/commun/infrastructure/source-aleatoire-crypto.ts';
const RETOUR_REDIRECTION = 'src/compte/infrastructure/auth/retour-redirection.ts';
const AVIS_ONGLETS = 'src/compte/infrastructure/avis-onglets-broadcast.ts';

const proprietesInterdites = [
  {
    object: 'Date',
    property: 'now',
    message: 'Heure courante : port Horloge (§7.2).',
    dispenses: ['src/commun/infrastructure/horloge-systeme.ts'],
  },
  { object: 'Date', property: 'parse', message: 'Interdit (§7.2).', dispenses: [] },
  {
    object: 'Math',
    property: 'random',
    message: 'Hasard : port SourceAleatoire (§7.4).',
    dispenses: [],
  },
  {
    object: 'crypto',
    property: 'randomUUID',
    message: 'Identifiants : port GenerateurIdentifiants (§7.5).',
    dispenses: [],
  },
  {
    object: 'crypto',
    property: 'getRandomValues',
    message: 'Hasard : port SourceAleatoire (§7.4).',
    dispenses: [ADAPTATEUR_ALEATOIRE],
  },
  {
    object: 'performance',
    property: 'now',
    message: 'Horloge monotone : port Horloge (§7.3).',
    dispenses: ['src/commun/infrastructure/horloge-systeme.ts'],
  },
  {
    object: 'location',
    property: 'hash',
    message: 'Seul retour-redirection.ts lit le fragment (§9.2.1).',
    dispenses: [RETOUR_REDIRECTION],
  },
  {
    object: 'history',
    property: 'replaceState',
    message: 'Seul retour-redirection.ts efface le fragment (§9.2.1).',
    dispenses: [RETOUR_REDIRECTION],
  },
  {
    object: 'history',
    property: 'pushState',
    message: 'Navigation : routeur de la ST-US concernée (§14.2).',
    dispenses: [],
  },
  {
    object: 'navigator',
    property: 'locks',
    message: 'Verrou entre onglets : port interne du contexte (§10.2).',
    dispenses: ['src/synchronisation/infrastructure/verrou-onglets-web.ts'],
  },
  {
    object: 'window',
    property: 'google',
    message: 'Google Identity Services : passerelle GIS du contexte compte (§9.2).',
    dispenses: ['src/compte/infrastructure/auth/passerelle-gis-navigateur.ts'],
  },
];

const globauxInterdits = [
  {
    name: 'setTimeout',
    message: 'Déclenchements différés : port Planificateur (§10.2).',
    dispenses: [ADAPTATEUR_PLANIFICATEUR],
  },
  {
    name: 'setInterval',
    message: 'Déclenchements périodiques : port Planificateur (§10.2).',
    dispenses: [ADAPTATEUR_PLANIFICATEUR],
  },
  {
    name: 'requestIdleCallback',
    message: 'Déclenchements différés : port Planificateur (§10.2).',
    dispenses: [ADAPTATEUR_PLANIFICATEUR],
  },
  {
    name: 'BroadcastChannel',
    message: 'Avis entre onglets : port AvisOnglets (§14.2).',
    dispenses: [AVIS_ONGLETS],
  },
];

const importsInterdits = [
  {
    id: 'date-fns',
    group: ['date-fns', 'date-fns/*', '@date-fns/*'],
    message: 'date-fns n’est utilisé que dans commun/domaine/temps (§7.2).',
  },
  {
    id: 'dexie',
    group: ['dexie'],
    message: 'Dexie est réservé aux adaptateurs d’infrastructure (§14.2).',
  },
  {
    id: 'zod',
    group: ['zod'],
    message: 'Zod est réservé à synchronisation/infrastructure et compte/infrastructure (§14.2).',
  },
  {
    id: 'interface',
    group: ['react', 'react/*', 'react-dom', 'react-dom/*', '@ionic/*', 'zustand', 'zustand/*'],
    message: 'React, Ionic et Zustand sont réservés à la présentation (ui) et à main.tsx (§14.2).',
  },
  {
    id: 'uuid',
    group: ['uuid'],
    message: 'Identifiants : port GenerateurIdentifiants (§7.5).',
  },
  {
    id: 'capacitor',
    group: ['@capacitor/*'],
    message: '@capacitor/* est interdit dans src/ en cible (§14.2, repli §19).',
  },
  {
    group: [
      'msw',
      'msw/*',
      'fake-indexeddb',
      'fake-indexeddb/*',
      'fast-check',
      '@cucumber/*',
      '@playwright/*',
      '@axe-core/*',
    ],
    message: 'Bibliothèques de test : tests/ uniquement (§14.2).',
    dispenses: [],
  },
];

const sansDispense = (restrictions, fichier) =>
  restrictions.filter(({ dispenses }) => !dispenses.includes(fichier));

const regleProprietes = (fichier) => [
  'error',
  ...sansDispense(proprietesInterdites, fichier).map(({ object, property, message }) => ({
    object,
    property,
    message,
  })),
];
const regleGlobaux = (fichier) => [
  'error',
  ...sansDispense(globauxInterdits, fichier).map(({ name, message }) => ({ name, message })),
];
const regleImports = (autorises) => [
  'error',
  {
    patterns: importsInterdits
      .filter(({ id }) => !autorises.includes(id))
      .map(({ group, message }) => ({ group, message })),
  },
];

/** Un bloc par fichier dispensé d'une restriction de propriété ou de variable globale. */
const fichiersDispenses = [
  ...new Set([...proprietesInterdites, ...globauxInterdits].flatMap(({ dispenses }) => dispenses)),
];
const blocsDispenses = fichiersDispenses.map((fichier) => ({
  files: [fichier],
  rules: {
    'no-restricted-properties': regleProprietes(fichier),
    'no-restricted-globals': regleGlobaux(fichier),
    // Les adaptateurs lisent l'heure : `new Date()` reste interdit hors HorlogeSysteme.
    ...(fichier === 'src/commun/infrastructure/horloge-systeme.ts'
      ? { 'no-restricted-syntax': 'off' }
      : {}),
  },
}));

// Zones d'importation autorisée, du général au particulier : le dernier bloc qui s'applique l'emporte,
// chaque zone reprend donc les autorisations des zones qu'elle recouvre.
const zonesImports = [
  { files: ['src/commun/domaine/temps/**'], autorises: ['date-fns'] },
  { files: ['src/**/infrastructure/**'], autorises: ['dexie'] },
  {
    files: ['src/synchronisation/infrastructure/**', 'src/compte/infrastructure/**'],
    autorises: ['dexie', 'zod'],
  },
  { files: ['src/commun/infrastructure/generateur-uuid-v7.ts'], autorises: ['dexie', 'uuid'] },
  { files: ['src/**/presentation/ui/**', 'src/main.tsx'], autorises: ['interface'] },
];
const blocsImportsDispenses = zonesImports.map(({ files, autorises }) => ({
  files,
  rules: { 'no-restricted-imports': regleImports(autorises) },
}));

export default tseslint.config(
  { ignores: ['poc/**', 'node_modules/**', 'coverage/**', 'dist/**', 'dev-dist/**', 'docs/**'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      // RCD-07 : tableaux déclarés ReadonlyArray<T>.
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'max-lines-per-function': ['error', { max: 30, skipBlankLines: true, skipComments: true }],
      complexity: ['error', 10],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],
      'no-restricted-syntax': ['error', ...interditsTemps],
      'no-restricted-properties': regleProprietes(''),
      'no-restricted-globals': regleGlobaux(''),
      'no-restricted-imports': regleImports([]),
    },
  },
  ...blocsDispenses,
  ...blocsImportsDispenses,
  {
    // Ports et service applicatif : interface pour le port, type pour ses données (conventions.md §5.3).
    files: ['src/**/ports/**/*.ts', 'src/synchronisation/application/service-etat-local.ts'],
    rules: { '@typescript-eslint/consistent-type-definitions': 'off' },
  },
  {
    files: ['src/**/*.tsx'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },
  {
    files: ['tests/**/*.ts'],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/no-disabled-tests': 'error',
      'vitest/no-focused-tests': 'error',
      'vitest/expect-expect': [
        'error',
        { assertFunctionNames: ['expect', 'expect*', 'verifier*'] },
      ],
    },
  },
  {
    files: ['eslint.config.js', '.dependency-cruiser.cjs', 'cucumber.mjs', 'scripts/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
