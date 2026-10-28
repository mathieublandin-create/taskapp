// Règles d'architecture (conventions.md §2.2, §14.2). Commande : `pnpm architecture`.
const { readFileSync } = require('node:fs');

const lireJson = (chemin) => JSON.parse(readFileSync(chemin, 'utf8'));
const rangCourant = Number(
  process.env.RANG_COURANT ?? lireJson('tests/support/rangs/rang-courant.json').rangCourant,
);
const echapper = (chemin) => chemin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// conventions.md §11.14 : les fichiers créés à un rang ultérieur au rang courant ne sont pas encore reliés à
// l'application ; ils sont exemptés de la règle « aucun orphelin ».
const fichiersDesRangsSuivants = Object.entries(
  lireJson('tests/support/rangs/rangs-fichiers.json').fichiers,
)
  .filter(([, rangs]) => rangs.debut > rangCourant)
  .map(([chemin]) => `^${echapper(chemin)}$`);

const paquets = (...noms) => `node_modules/(${noms.join('|')})/`;
const BIBLIOTHEQUES_INTERFACE = paquets('react', 'react-dom', '@ionic', 'zustand', '@capacitor');
const BIBLIOTHEQUES_DE_TEST = paquets(
  'msw',
  'fake-indexeddb',
  'fast-check',
  '@cucumber',
  '@playwright',
  '@axe-core',
);

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'aucun-cycle',
      comment:
        'Aucune dépendance circulaire (fichiers des rangs suivants exemptés, conventions.md §11.14).',
      severity: 'error',
      from: { pathNot: fichiersDesRangsSuivants },
      to: { circular: true },
    },
    {
      name: 'aucun-orphelin',
      comment:
        'Tout module de src/ est utilisé (sauf les fichiers des rangs suivants, conventions.md §11.14).',
      severity: 'error',
      from: {
        orphan: true,
        path: '^src/',
        pathNot: ['\\.d\\.ts$', ...fichiersDesRangsSuivants],
      },
      to: {},
    },
    {
      name: 'domaine-pur',
      comment:
        'Le domaine ne dépend ni de l’application, ni de l’infrastructure, ni de la présentation (§2.2).',
      severity: 'error',
      from: { path: '^src/[^/]+/domaine/' },
      to: { path: '^src/[^/]+/(application|infrastructure|presentation)/' },
    },
    {
      name: 'domaine-sans-bibliotheque-technique',
      comment: 'Le domaine n’importe ni interface, ni Dexie, ni Zod (§2.2).',
      severity: 'error',
      from: { path: '^src/[^/]+/domaine/' },
      to: { path: `${BIBLIOTHEQUES_INTERFACE}|${paquets('dexie', 'zod')}` },
    },
    {
      name: 'date-fns-dans-temps-seulement',
      comment: 'date-fns et @date-fns/tz ne sont utilisés que dans commun/domaine/temps (§7.2).',
      severity: 'error',
      from: { pathNot: '^src/commun/domaine/temps/' },
      to: { path: paquets('date-fns', '@date-fns') },
    },
    {
      name: 'application-sans-infrastructure',
      comment:
        'L’application ne dépend ni de l’infrastructure, ni de la présentation, ni de Zod, ni de Dexie (§2.2).',
      severity: 'error',
      from: { path: '^src/[^/]+/application/' },
      to: {
        path: [
          '^src/[^/]+/(infrastructure|presentation)/',
          `${BIBLIOTHEQUES_INTERFACE}|${paquets('dexie', 'zod')}`,
        ],
      },
    },
    {
      name: 'infrastructure-sans-presentation',
      comment: 'L’infrastructure ne dépend pas de la présentation (§2.2).',
      severity: 'error',
      from: { path: '^src/[^/]+/infrastructure/' },
      to: { path: '^src/[^/]+/presentation/' },
    },
    {
      name: 'modeles-de-vue-sans-interface',
      comment: 'Les modèles de vue sont purs : ni React, ni Ionic, ni Zustand (§2.2).',
      severity: 'error',
      from: { path: '^src/[^/]+/presentation/modeles-de-vue/' },
      to: { path: BIBLIOTHEQUES_INTERFACE },
    },
    {
      name: 'ui-sans-infrastructure',
      comment: 'L’interface passe par la composition, jamais par l’infrastructure (§2.2).',
      severity: 'error',
      from: { path: '^src/[^/]+/presentation/ui/' },
      to: { path: '^src/[^/]+/infrastructure/' },
    },
    {
      name: 'contextes-par-index',
      comment: 'Un contexte n’importe un autre contexte que par son index.ts (§4.2, §10.1).',
      severity: 'error',
      from: {
        path: '^src/([^/]+)/',
        pathNot: ['^src/composition/', '^src/commun/', '^src/infrastructure-google/'],
      },
      to: {
        path: '^src/[^/]+/',
        pathNot: ['^src/$1/', '^src/[^/]+/index\\.ts$', '^src/commun/'],
      },
    },
    {
      name: 'src-sans-tests',
      comment:
        'src/ ne dépend pas de tests/. Exception transitoire : les squelettes des rangs à venir importent ' +
        'l’alias @non-implemente, retiré à la fin du lot (conventions.md §11.14).',
      severity: 'error',
      from: { path: '^src/' },
      to: { path: '^tests/', pathNot: '^tests/support/erreur-non-implementee\\.ts$' },
    },
    {
      name: 'bibliotheques-de-test-hors-src',
      comment:
        'Msw, fake-indexeddb, fast-check, Cucumber et Playwright sont réservés aux tests (§14.2).',
      severity: 'error',
      from: { path: '^src/' },
      to: { path: BIBLIOTHEQUES_DE_TEST },
    },
    {
      name: 'capacitor-interdit',
      comment: '@capacitor/* est interdit dans src/ en cible (§14.2, repli §19).',
      severity: 'error',
      from: { path: '^src/' },
      to: { path: paquets('@capacitor') },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
};
