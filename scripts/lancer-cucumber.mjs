// Lance cucumber-js avec un profil (conventions.md §11.8, §11.13). Quand la sélection de scénarios du rang
// courant est vide (rang 0 : aucun scénario), rien n'est lancé et la commande réussit : une liste vide ne doit
// jamais retomber sur « tous les .feature ».
import { spawnSync } from 'node:child_process';
import { lireRangCourant, selectionnerScenarios } from './selection-scenarios.mjs';

const profil = process.argv[2] ?? 'default';
const profilsAvecSelection = new Set(['default', 'rapide', 'ihm']);

if (profilsAvecSelection.has(profil) && selectionnerScenarios(lireRangCourant()).length === 0) {
  process.stdout.write(
    `Aucun scénario exécutable au rang ${String(lireRangCourant())} : cucumber-js non lancé.\n`,
  );
  process.exit(0);
}

const execution = spawnSync('cucumber-js', ['--profile', profil, ...process.argv.slice(3)], {
  stdio: 'inherit',
  env: { ...process.env, NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --import tsx`.trim() },
  shell: process.platform === 'win32',
});
process.exit(execution.status ?? 1);
