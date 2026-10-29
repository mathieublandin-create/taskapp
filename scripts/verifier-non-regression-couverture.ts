// Non-régression de la couverture par fichier (conventions.md §12, DT-005). Commande :
// `pnpm verifier:couverture-fichiers <rapport-base> <racine-base> [<reference-base>]`, lancée par la CI sur les
// pull requests. Pour chaque fichier de `src/` modifié par la PR, les pourcentages de lignes et de branches du rapport
// `coverage-summary.json` de la PR ne doivent pas être inférieurs à ceux de la branche de base.
// - Fichier absent de la base (nouveau, ou non mesuré à la base) : pas de référence, signalé sans échec.
// - Pourcentage non numérique (« Unknown » : aucun élément à couvrir) : pas de comparaison pour cette métrique.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

type Metrique = { readonly pct: number | string };
type EntreeRapport = { readonly lines: Metrique; readonly branches: Metrique };
type RapportBrut = Readonly<Record<string, EntreeRapport>>;

/** Couverture par fichier, clés = chemins relatifs à la racine du dépôt, séparateurs `/`. */
export type CouvertureParFichier = Readonly<Record<string, EntreeRapport>>;

export type EntreesNonRegression = {
  readonly fichiersModifies: ReadonlyArray<string>;
  readonly base: CouvertureParFichier;
  readonly pr: CouvertureParFichier;
};

export type ResultatNonRegression = {
  readonly erreurs: ReadonlyArray<string>;
  readonly sansReference: ReadonlyArray<string>;
  readonly compares: ReadonlyArray<string>;
};

const METRIQUES: ReadonlyArray<readonly [keyof EntreeRapport, string]> = [
  ['lines', 'lignes'],
  ['branches', 'branches'],
];

/** Fichiers de `src/` (hors déclarations de types) qui peuvent être mesurés. */
export const estFichierMesurable = (chemin: string): boolean =>
  chemin.startsWith('src/') && /\.tsx?$/.test(chemin) && !chemin.endsWith('.d.ts');

/** Rapport `coverage-summary.json` (chemins absolus) ramené à des chemins relatifs à `racine`. */
export const normaliserRapport = (brut: RapportBrut, racine: string): CouvertureParFichier => {
  const prefixe = racine.endsWith('/') ? racine : `${racine}/`;
  return Object.fromEntries(
    Object.entries(brut)
      .filter(([cle]) => cle !== 'total')
      .map(([cle, entree]) => [cle.startsWith(prefixe) ? cle.slice(prefixe.length) : cle, entree]),
  );
};

export const verifierNonRegression = ({
  fichiersModifies,
  base,
  pr,
}: EntreesNonRegression): ResultatNonRegression => {
  const erreurs: Array<string> = [];
  const sansReference: Array<string> = [];
  const compares: Array<string> = [];

  fichiersModifies
    .filter(estFichierMesurable)
    .sort()
    .forEach((fichier) => {
      const reference = base[fichier];
      if (reference === undefined) {
        sansReference.push(
          `${fichier} : absent du rapport de la base (nouveau fichier ou non mesuré)`,
        );
        return;
      }
      const mesure = pr[fichier];
      if (mesure === undefined) {
        erreurs.push(`${fichier} : absent du rapport de couverture de la PR`);
        return;
      }
      compares.push(fichier);
      METRIQUES.forEach(([cle, libelle]) => {
        const avant = reference[cle].pct;
        const apres = mesure[cle].pct;
        if (typeof avant === 'number' && typeof apres === 'number' && apres < avant) {
          erreurs.push(
            `${fichier} : couverture des ${libelle} en baisse, ${String(avant)} % (base) → ${String(apres)} % (PR)`,
          );
        }
      });
    });

  return { erreurs, sansReference, compares };
};

const lireJson = (chemin: string): unknown => JSON.parse(readFileSync(chemin, 'utf8'));

const fichiersModifies = (racine: string, reference: string): ReadonlyArray<string> =>
  execFileSync(
    'git',
    ['diff', '--name-only', '--diff-filter=AMR', `${reference}...HEAD`, '--', 'src'],
    {
      cwd: racine,
      encoding: 'utf8',
    },
  )
    .split('\n')
    .filter(Boolean);

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [rapportBase, racineBase, reference] = process.argv.slice(2);
  if (rapportBase === undefined || racineBase === undefined || reference === undefined) {
    process.stderr.write(
      'Usage : verifier-non-regression-couverture.ts <rapport-base> <racine-base> <reference-base>\n',
    );
    process.exit(2);
  }
  const racinePr = process.cwd();
  const resultat = verifierNonRegression({
    fichiersModifies: fichiersModifies(racinePr, reference),
    base: normaliserRapport(lireJson(rapportBase) as RapportBrut, racineBase),
    pr: normaliserRapport(lireJson('coverage/coverage-summary.json') as RapportBrut, racinePr),
  });
  resultat.sansReference.forEach((ligne) => process.stdout.write(`Ignoré : ${ligne}\n`));
  resultat.erreurs.forEach((erreur) => process.stderr.write(`${erreur}\n`));
  process.stdout.write(
    `Non-régression de la couverture : ${String(resultat.compares.length)} fichier(s) comparé(s), ${String(resultat.erreurs.length)} erreur(s).\n`,
  );
  process.exit(resultat.erreurs.length === 0 ? 0 : 1);
}
