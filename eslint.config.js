// Configuration ESLint (conventions.md §6, §7.2, §7.4, §14.2). Export par défaut imposé par l'outil (RCD-13).
import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import globals from 'globals';
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
];

const proprietesInterdites = [
  { object: 'Date', property: 'now', message: 'Heure courante : port Horloge (§7.2).' },
  { object: 'Date', property: 'parse', message: 'Interdit (§7.2).' },
  { object: 'Math', property: 'random', message: 'Hasard : port SourceAleatoire (§7.4).' },
  {
    object: 'crypto',
    property: 'randomUUID',
    message: 'Identifiants : port GenerateurIdentifiants (§7.5).',
  },
  { object: 'performance', property: 'now', message: 'Horloge monotone : port Horloge (§7.3).' },
];

export default tseslint.config(
  { ignores: ['poc/**', 'node_modules/**', 'coverage/**', 'dist/**', 'docs/**'] },
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
    files: ['src/**/*.ts'],
    rules: {
      'max-lines-per-function': ['error', { max: 30, skipBlankLines: true, skipComments: true }],
      complexity: ['error', 10],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],
      'no-restricted-syntax': ['error', ...interditsTemps],
      'no-restricted-properties': ['error', ...proprietesInterdites],
    },
  },
  {
    // Ports et service applicatif : interface pour le port, type pour ses données (conventions.md §5.3).
    files: ['src/**/ports/**/*.ts', 'src/synchronisation/application/service-etat-local.ts'],
    rules: { '@typescript-eslint/consistent-type-definitions': 'off' },
  },
  {
    // Seul adaptateur autorisé à lire l'heure système (conventions.md §7.2, §14.2).
    files: ['src/commun/infrastructure/horloge-systeme.ts'],
    rules: { 'no-restricted-properties': 'off', 'no-restricted-syntax': 'off' },
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
    files: ['eslint.config.js'],
    ...tseslint.configs.disableTypeChecked,
  },
);
