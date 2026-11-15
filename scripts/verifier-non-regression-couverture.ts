// Non-régression de la couverture par fichier (conventions.md §12, DT-005). Commande :
// `pnpm verifier:couverture-fichiers <rapport-base> <racine-base> [<reference-base>]`, lancée par la CI sur les
// pull requests. Pour chaque fichier de `src/` modifié par la PR, les pourcentages de lignes et de branches du rapport
// `coverage-summary.json` de la PR ne doivent pas être inférieurs à ceux de la branche de base.
// - Fichier absent de la base (nouveau, ou non mesuré à la base) : pas de référence, signalé sans échec.
// - Métrique sans élément (`total` nul) à la base ou dans la PR : pas de comparaison pour cette métrique.
//   Une métrique n'est comparée que si son `total` est strictement positif des deux côtés.
// - Rapport absent, illisible ou malformé (`total`, `pct` numériques pour `lines` et `branches`) : message
//   `Rapport de couverture illisible : <chemin>` sur la sortie d'erreur, et sortie avec le code 2.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

type Metrique = { readonly total: number; readonly pct: number };
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

const estObjet = (valeur: unknown): valeur is Record<string, unknown> =>
  typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur);

/** Garde : le rapport a la forme attendue (`lines` et `branches` avec `total` et `pct` numériques, par entrée). */
export const estRapportValide = (brut: unknown): brut is RapportBrut =>
  estObjet(brut) &&
  Object.values(brut).every(
    (entree) =>
      estObjet(entree) &&
      METRIQUES.every(([cle]) => {
        const metrique = entree[cle];
        return (
          estObjet(metrique) &&
          typeof metrique['total'] === 'number' &&
          typeof metrique['pct'] === 'number'
        );
      }),
  );

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
        const avant = reference[cle];
        const apres = mesure[cle];
        if (avant.total > 0 && apres.total > 0 && apres.pct < avant.pct) {
          erreurs.push(
            `${fichier} : couverture des ${libelle} en baisse, ${String(avant.pct)} % (base) → ${String(apres.pct)} % (PR)`,
          );
        }
      });
    });

  return { erreurs, sansReference, compares };
};

/** Lit un rapport ; `undefined` si le fichier est absent, n'est pas du JSON ou n'a pas la forme attendue. */
const lireRapport = (chemin: string): RapportBrut | undefined => {
  let contenu: unknown;
  try {
    contenu = JSON.parse(readFileSync(chemin, 'utf8'));
  } catch {
    return undefined;
  }
  return estRapportValide(contenu) ? contenu : undefined;
};

const lireRapportOuArreter = (chemin: string): RapportBrut => {
  const rapport = lireRapport(chemin);
  if (rapport === undefined) {
    process.stderr.write(`Rapport de couverture illisible : ${chemin}\n`);
    process.exit(2);
  }
  return rapport;
};

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
  const rapportBaseLu = lireRapportOuArreter(rapportBase);
  const rapportPrLu = lireRapportOuArreter('coverage/coverage-summary.json');
  const resultat = verifierNonRegression({
    fichiersModifies: fichiersModifies(racinePr, reference),
    base: normaliserRapport(rapportBaseLu, racineBase),
    pr: normaliserRapport(rapportPrLu, racinePr),
  });
  resultat.sansReference.forEach((ligne) => process.stdout.write(`Ignoré : ${ligne}\n`));
  resultat.erreurs.forEach((erreur) => process.stderr.write(`${erreur}\n`));
  process.stdout.write(
    `Non-régression de la couverture : ${String(resultat.compares.length)} fichier(s) comparé(s), ${String(resultat.erreurs.length)} erreur(s).\n`,
  );
  process.exit(resultat.erreurs.length === 0 ? 0 : 1);
}
