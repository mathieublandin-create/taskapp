// Contrôle d'hygiène du dépôt (conventions.md §9.1, §9.5, §14). Commande : `pnpm verifier:depot`.
// - le .gitignore contient les motifs exigés, et aucun fichier versionné n'y correspond ;
// - .env.example existe ; les versions de Node de .nvmrc et de package.json concordent ;
// - chaque workflow déclare ses permissions et épingle ses actions par empreinte de commit.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const MOTIFS_GITIGNORE: ReadonlyArray<string> = [
  '*.jks',
  '*.keystore',
  '*.p12',
  '*.pem',
  'keystore.properties',
  'secrets/',
  'android/keystore/',
  'local.properties',
  '.env',
  '.env.*',
  '!.env.example',
  'node_modules/',
  'dist/',
  'build/',
  'coverage/',
  'reports/',
  '*.apk',
  '*.aab',
  'android/.gradle/',
  'android/app/build/',
  'android/app/release/',
];

const FICHIERS_SENSIBLES: ReadonlyArray<RegExp> = [
  /\.(jks|keystore|p12|pem|apk|aab)$/,
  /(^|\/)(keystore|local)\.properties$/,
  /(^|\/)\.env(\.(?!example$)[^/]+)?$/,
  /(^|\/)secrets\//,
  /(^|\/)android\/keystore\//,
];

export type Workflow = { readonly nom: string; readonly texte: string };

export type EntreesDepot = {
  readonly gitignore: string;
  readonly fichiersSuivis: ReadonlyArray<string>;
  readonly workflows: ReadonlyArray<Workflow>;
  readonly nvmrc: string;
  readonly moteurNode: string;
  readonly envExempleExiste: boolean;
};

const verifierWorkflow = ({ nom, texte }: Workflow): ReadonlyArray<string> => {
  const actionsNonEpinglees = [...texte.matchAll(/^\s*-?\s*uses:\s*(\S+)/gm)]
    .map((m) => m[1] ?? '')
    .filter((action) => !action.startsWith('./') && !/@[0-9a-f]{40}$/.test(action));
  return [
    ...(/^permissions:/m.test(texte) ? [] : [`${nom} : permissions non déclarées`]),
    ...actionsNonEpinglees.map(
      (a) => `${nom} : action non épinglée par empreinte de commit : ${a}`,
    ),
  ];
};

export const verifierDepot = (e: EntreesDepot): ReadonlyArray<string> => {
  const lignes = new Set(e.gitignore.split('\n').map((ligne) => ligne.trim()));
  const majeure = /\d+/.exec(e.nvmrc)?.[0] ?? '';
  return [
    ...MOTIFS_GITIGNORE.filter((motif) => !lignes.has(motif)).map(
      (m) => `.gitignore : motif « ${m} » manquant`,
    ),
    ...e.fichiersSuivis
      .filter((fichier) => FICHIERS_SENSIBLES.some((motif) => motif.test(fichier)))
      .map((fichier) => `${fichier} : fichier sensible versionné`),
    ...(e.envExempleExiste ? [] : ['.env.example manquant']),
    ...(majeure !== '' && e.moteurNode.includes(`>=${majeure}`)
      ? []
      : [`.nvmrc (${e.nvmrc.trim()}) et engines.node (${e.moteurNode}) discordent`]),
    ...e.workflows.flatMap(verifierWorkflow),
  ];
};

const lireWorkflows = (): ReadonlyArray<Workflow> =>
  existsSync('.github/workflows')
    ? readdirSync('.github/workflows')
        .filter((nom) => /\.ya?ml$/.test(nom) && nom !== 'poc.yml')
        .map((nom) => ({ nom, texte: readFileSync(`.github/workflows/${nom}`, 'utf8') }))
    : [];

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const paquet = JSON.parse(readFileSync('package.json', 'utf8')) as { engines: { node: string } };
  const erreurs = verifierDepot({
    gitignore: readFileSync('.gitignore', 'utf8'),
    fichiersSuivis: execFileSync('git', ['ls-files'], { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean),
    workflows: lireWorkflows(),
    nvmrc: readFileSync('.nvmrc', 'utf8'),
    moteurNode: paquet.engines.node,
    envExempleExiste: existsSync('.env.example'),
  });
  erreurs.forEach((erreur) => process.stderr.write(`${erreur}\n`));
  process.stdout.write(`Hygiène du dépôt : ${String(erreurs.length)} erreur(s).\n`);
  process.exit(erreurs.length === 0 ? 0 : 1);
}
