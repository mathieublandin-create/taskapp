// Contrôle du catalogue des codes (conventions.md §8.5). Commande : `pnpm verifier:catalogue`.
// - chaque code des tableaux du guide d'ergonomie §6.6 existe dans CODES_CATALOGUE, et réciproquement ;
// - chaque code cité dans un .feature existe au catalogue ;
// - quand `catalogue.fr.ts` est livré (rang 2), il a exactement les mêmes codes (gabarits : mêmes textes que le guide).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const CODE = '[A-Z]+-[A-Z0-9]+(?:-[A-Z0-9]+)*';
const FAMILLES = 'SYN|BAN|MEN|ETA|EVD|TST|CNF|ERR|ALR|SEC';

export type EntreesCatalogue = {
  readonly codesDuGuide: ReadonlySet<string>;
  readonly codesDuCode: ReadonlySet<string>;
  readonly codesDesFeatures: ReadonlySet<string>;
  /** Codes de `catalogue.fr.ts` ; undefined tant que le catalogue n'est pas livré. */
  readonly codesDuCatalogue: ReadonlySet<string> | undefined;
};

const manquants = (
  attendus: ReadonlySet<string>,
  presents: ReadonlySet<string>,
): ReadonlyArray<string> => [...attendus].filter((code) => !presents.has(code)).sort();

export const verifierCatalogue = (e: EntreesCatalogue): ReadonlyArray<string> => [
  ...manquants(e.codesDuGuide, e.codesDuCode).map(
    (c) => `${c} : dans le guide, absent de CODES_CATALOGUE`,
  ),
  ...manquants(e.codesDuCode, e.codesDuGuide).map(
    (c) => `${c} : dans CODES_CATALOGUE, absent du guide`,
  ),
  ...manquants(e.codesDesFeatures, e.codesDuCode).map(
    (c) => `${c} : cité dans un .feature, absent du catalogue`,
  ),
  ...(e.codesDuCatalogue === undefined
    ? []
    : [
        ...manquants(e.codesDuCode, e.codesDuCatalogue).map(
          (c) => `${c} : absent de catalogue.fr.ts`,
        ),
        ...manquants(e.codesDuCatalogue, e.codesDuCode).map(
          (c) => `${c} : dans catalogue.fr.ts, absent de CODES_CATALOGUE`,
        ),
      ]),
];

/** Codes des lignes de tableau du §6.6 du guide : « | `SYN-OK` | … ». */
export const codesDuGuide = (texte: string): ReadonlySet<string> => {
  const debut = texte.indexOf('### 6.6 Catalogue');
  const fin = texte.indexOf('\n## ', debut);
  const section = texte.slice(debut, fin === -1 ? undefined : fin);
  return new Set(
    [...section.matchAll(new RegExp(`^\\| \`(${CODE})\``, 'gm'))].map((m) => m[1] ?? ''),
  );
};

export const codesCites = (texte: string): ReadonlySet<string> =>
  new Set(
    [...texte.matchAll(new RegExp(`"((?:${FAMILLES})-[A-Z0-9-]+)"`, 'g'))].map((m) => m[1] ?? ''),
  );

const codesEntreGuillemets = (texte: string): ReadonlySet<string> =>
  new Set([...texte.matchAll(new RegExp(`'(${CODE})'`, 'g'))].map((m) => m[1] ?? ''));

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const lire = (chemin: string): string => readFileSync(chemin, 'utf8');
  const fichierCatalogue = 'src/commun/presentation/messages/catalogue.fr.ts';
  const features = readdirSync('tests/features').filter((nom) => nom.endsWith('.feature'));
  const erreurs = verifierCatalogue({
    codesDuGuide: codesDuGuide(lire('docs/02-ux/guide-ergonomie.md')),
    codesDuCode: codesEntreGuillemets(lire('src/commun/presentation/messages/codes.ts')),
    codesDesFeatures: new Set(
      features.flatMap((nom) => [...codesCites(lire(`tests/features/${nom}`))]),
    ),
    codesDuCatalogue: existsSync(fichierCatalogue)
      ? codesEntreGuillemets(lire(fichierCatalogue))
      : undefined,
  });
  erreurs.forEach((erreur) => process.stderr.write(`${erreur}\n`));
  process.stdout.write(`Catalogue des codes : ${String(erreurs.length)} erreur(s).\n`);
  process.exit(erreurs.length === 0 ? 0 : 1);
}
