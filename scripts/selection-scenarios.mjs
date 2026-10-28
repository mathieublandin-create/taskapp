// Sélection des scénarios exécutables au rang courant (conventions.md §11.13).
// Affiche un `chemin:ligne` par scénario dont le rang est inférieur ou égal à `rangCourant`.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { lireScenarios } from './lire-scenarios.mjs';

/** Rang courant : variable RANG_COURANT si elle est un entier, sinon le fichier (conventions.md §11.14). */
export const lireRangCourant = () => {
  const variable = process.env.RANG_COURANT;
  if (variable !== undefined && /^-?\d+$/.test(variable)) return Number(variable);
  return JSON.parse(readFileSync('tests/support/rangs/rang-courant.json', 'utf8')).rangCourant;
};

export const lireRangsScenarios = () =>
  JSON.parse(readFileSync('tests/support/rangs-scenarios.json', 'utf8')).scenarios;

/** Scénarios (`chemin:ligne`) de rang inférieur ou égal à `rangCourant` ; un scénario sans rang n'est jamais retenu. */
export const selectionnerScenarios = (rangCourant, rangs = lireRangsScenarios()) =>
  lireScenarios()
    .filter((s) => s.identifiant !== undefined && (rangs[s.identifiant] ?? Infinity) <= rangCourant)
    .map((s) => `${s.chemin}:${String(s.ligne)}`);

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.stdout.write(
    selectionnerScenarios(lireRangCourant())
      .map((ligne) => `${ligne}\n`)
      .join(''),
  );
}
