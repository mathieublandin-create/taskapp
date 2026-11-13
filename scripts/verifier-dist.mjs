// Contrôle F1 (ST-US-018 v0.4 §6.4 n° 6) : le build de production ne contient jamais la composition de test `test-ihm`.
// Usage : node scripts/verifier-dist.mjs [dossier] (par défaut `dist`). Code de sortie 1 si une chaîne interdite est trouvée.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/** Chaînes propres à la composition de test : pont du `FauxDrive`, Google simulé, jeton de test. */
export const CHAINES_INTERDITES = ['donejuanFaux', 'jeton-test-ihm'];

const fichiersDe = (dossier) =>
  readdirSync(dossier, { withFileTypes: true }).flatMap((entree) =>
    entree.isDirectory() ? fichiersDe(join(dossier, entree.name)) : [join(dossier, entree.name)],
  );

/** Rend les couples « fichier : chaîne » trouvés dans le dossier. */
export const verifierDist = (dossier) =>
  fichiersDe(dossier).flatMap((fichier) => {
    const texte = readFileSync(fichier, 'utf8');
    return CHAINES_INTERDITES.filter((chaine) => texte.includes(chaine)).map(
      (chaine) => `${fichier} : « ${chaine} » (composition de test dans le build de production)`,
    );
  });

if (
  process.argv[1] !== undefined &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href
) {
  const dossier = process.argv[2] ?? 'dist';
  if (!existsSync(dossier)) {
    process.stderr.write(`Dossier absent : ${dossier} (lancer « pnpm build » d'abord).\n`);
    process.exit(1);
  }
  const erreurs = verifierDist(dossier);
  erreurs.forEach((erreur) => process.stderr.write(`${erreur}\n`));
  process.stdout.write(`Build de production (${dossier}) : ${String(erreurs.length)} erreur(s).\n`);
  process.exit(erreurs.length === 0 ? 0 : 1);
}
