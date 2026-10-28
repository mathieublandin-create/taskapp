// Contrôle des rangs de scénarios (conventions.md §11.13). Commande : `pnpm verifier:rangs`.
// Échoue si un scénario n'a pas de rang, si une clé ne correspond à aucun scénario, ou si `rangCourant` est
// inférieur au rang déjà atteint sur la branche de lot (variable RANG_BASE, rang lu dans la branche de base).
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { lireScenarios, type Scenario } from './lire-scenarios.mjs';

export type EntreesRangs = {
  readonly scenarios: ReadonlyArray<Pick<Scenario, 'chemin' | 'ligne' | 'identifiant'>>;
  readonly rangs: Readonly<Record<string, number>>;
  readonly rangCourant: number;
  readonly rangDeBase?: number;
};

export const verifierRangs = ({
  scenarios,
  rangs,
  rangCourant,
  rangDeBase,
}: EntreesRangs): ReadonlyArray<string> => {
  const identifiants = new Set(
    scenarios.flatMap((s) => (s.identifiant === undefined ? [] : [s.identifiant])),
  );
  const sansIdentifiant = scenarios
    .filter((s) => s.identifiant === undefined)
    .map((s) => `${s.chemin}:${String(s.ligne)} : titre sans identifiant « Snn — … »`);
  const sansRang = [...identifiants]
    .filter((identifiant) => !(identifiant in rangs))
    .map((identifiant) => `${identifiant} : scénario sans rang`);
  const orphelines = Object.keys(rangs)
    .filter((cle) => !identifiants.has(cle))
    .map((cle) => `${cle} : clé de rang sans scénario`);
  const recul =
    rangDeBase !== undefined && rangCourant < rangDeBase
      ? [`rangCourant ${String(rangCourant)} inférieur au rang ${String(rangDeBase)} déjà atteint`]
      : [];
  return [...sansIdentifiant, ...sansRang, ...orphelines, ...recul];
};

const lireJson = (chemin: string): unknown => JSON.parse(readFileSync(chemin, 'utf8'));

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const base = process.env['RANG_BASE'];
  const erreurs = verifierRangs({
    scenarios: lireScenarios(),
    rangs: (lireJson('tests/support/rangs-scenarios.json') as { scenarios: Record<string, number> })
      .scenarios,
    rangCourant: (lireJson('tests/support/rangs/rang-courant.json') as { rangCourant: number })
      .rangCourant,
    ...(base !== undefined && /^-?\d+$/.test(base) ? { rangDeBase: Number(base) } : {}),
  });
  erreurs.forEach((erreur) => process.stderr.write(`${erreur}\n`));
  process.stdout.write(`Rangs des scénarios : ${String(erreurs.length)} erreur(s).\n`);
  process.exit(erreurs.length === 0 ? 0 : 1);
}
