// Contrôle des tags des scénarios (conventions.md §11.8). Commande : `pnpm verifier:tags`.
// Chaque scénario porte @US-, au moins un @RG- (existant au cahier des charges) et @LOT- ; aucun @wip ;
// aucun tag technique hors de la liste (tags de traçabilité de Pepper admis : @DEC-nnn, Q-BEN-E12-5 ; @ANO-nnn,
// conventions v0.4.8 §11.8).
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { lireScenarios, type Scenario } from './lire-scenarios.mjs';

const TAGS_TECHNIQUES = new Set(['@ihm', '@recette', '@lent', '@google-reel']);

export type EntreesTags = {
  readonly scenarios: ReadonlyArray<Pick<Scenario, 'chemin' | 'ligne' | 'tags'>>;
  readonly regles: ReadonlySet<string>;
};

export const verifierTags = ({ scenarios, regles }: EntreesTags): ReadonlyArray<string> =>
  scenarios.flatMap(({ chemin, ligne, tags }) => {
    const lieu = `${chemin}:${String(ligne)}`;
    const regleCitees = tags.filter((t) => t.startsWith('@RG-'));
    return [
      ...(tags.some((t) => t.startsWith('@US-')) ? [] : [`${lieu} : tag @US- manquant`]),
      ...(regleCitees.length === 0 ? [`${lieu} : tag @RG- manquant`] : []),
      ...(tags.some((t) => t.startsWith('@LOT-')) ? [] : [`${lieu} : tag @LOT- manquant`]),
      ...tags.filter((t) => t === '@wip').map(() => `${lieu} : @wip interdit`),
      ...regleCitees
        .filter((t) => !regles.has(t.slice(1)))
        .map((t) => `${lieu} : ${t} absent du cahier des charges`),
      ...tags
        .filter((t) => !/^@(US|RG|LOT|DEC|ANO)-/.test(t) && t !== '@wip' && !TAGS_TECHNIQUES.has(t))
        .map((t) => `${lieu} : tag inconnu ${t}`),
    ];
  });

/** Identifiants RG-nnn des lignes de tableau du cahier des charges. */
export const reglesDuCahier = (texte: string): ReadonlySet<string> =>
  new Set([...texte.matchAll(/^\| (RG-\d+[a-z]?) \|/gm)].map((m) => m[1] ?? ''));

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cahier = readFileSync('docs/01-specification-fonctionnelle/cahier-des-charges.md', 'utf8');
  const erreurs = verifierTags({ scenarios: lireScenarios(), regles: reglesDuCahier(cahier) });
  erreurs.forEach((erreur) => process.stderr.write(`${erreur}\n`));
  process.stdout.write(`Tags des scénarios : ${String(erreurs.length)} erreur(s).\n`);
  process.exit(erreurs.length === 0 ? 0 : 1);
}
