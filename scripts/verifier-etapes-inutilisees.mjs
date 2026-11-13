// Contrôle des étapes inutilisées (conventions.md §11.13) : échoue si une définition d'étape n'est utilisée par
// aucune étape d'aucun .feature du lot, hors sélection. Entrée : la sortie `usage-json` de
// `cucumber-js --dry-run --format usage-json:<fichier>`, sans --strict (les étapes encore indéfinies des
// scénarios non sélectionnés n'y sont pas des erreurs).
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Définitions dont aucune étape ne se sert : `[{ pattern, uri }]`. */
export const definitionsInutilisees = (usage) =>
  usage
    .filter((definition) => definition.matches.length === 0)
    .map(({ pattern, uri }) => ({ pattern, uri }));

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const fichier = process.argv[2];
  if (fichier === undefined) {
    process.stderr.write('Usage : node scripts/verifier-etapes-inutilisees.mjs <usage.json>\n');
    process.exit(2);
  }
  const inutilisees = definitionsInutilisees(JSON.parse(readFileSync(fichier, 'utf8')));
  inutilisees.forEach(({ pattern, uri }) =>
    process.stderr.write(`Étape inutilisée : ${pattern} (${uri})\n`),
  );
  process.stdout.write(`${String(inutilisees.length)} définition(s) d'étape inutilisée(s).\n`);
  process.exit(inutilisees.length === 0 ? 0 : 1);
}
