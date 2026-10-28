// Profils cucumber-js (conventions.md §11.8, §11.13). Tous en `strict`, `# language: fr`, steps TypeScript chargés
// par tsx (`--import tsx`, voir scripts/lancer-cucumber.mjs). Les profils `default`, `rapide` et `ihm` ne portent
// que les scénarios exécutables au rang courant ; quand cette sélection est vide (rang 0), le lanceur n'appelle
// pas cucumber-js : une liste vide ne doit jamais retomber sur « tous les .feature ».
import { lireRangCourant, selectionnerScenarios } from './scripts/selection-scenarios.mjs';

const SUPPORT = [
  'tests/support/indexeddb-fake.ts',
  'tests/support/types-parametres.ts',
  'tests/support/monde.ts',
  'tests/support/hooks.ts',
];
const SANS_RECETTE_NI_REEL = 'not @google-reel and not @recette';
const selection = selectionnerScenarios(lireRangCourant());

const profil = (steps, tags, paths = selection) => ({
  strict: true,
  language: 'fr',
  import: [...SUPPORT, steps],
  paths,
  tags,
  format: ['progress'],
});

// Profil par défaut = export par défaut ; les autres profils sont des exports nommés (cucumber-js 13).
export default profil('tests/steps/**/*.ts', `not @ihm and ${SANS_RECETTE_NI_REEL}`);

export const rapide = profil(
  'tests/steps/**/*.ts',
  `not @ihm and not @lent and ${SANS_RECETTE_NI_REEL}`,
);

export const ihm = profil('tests/steps-ihm/**/*.ts', `@ihm and ${SANS_RECETTE_NI_REEL}`);

// Contrôle des étapes inutilisées (§11.13) : tous les scénarios du lot, sans --strict, sans exécution.
const stepsInutilises = {
  ...profil('tests/steps/**/*.ts', 'not @recette', ['tests/features/*.feature']),
  strict: false,
  dryRun: true,
  format: ['usage-json:reports/usage.json'],
};

const googleReel = profil('tests/steps/**/*.ts', '@google-reel', ['tests/features/*.feature']);

export { googleReel as 'google-reel', stepsInutilises as 'steps-inutilises' };
