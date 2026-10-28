// Lecture des scénarios des fichiers .feature (conventions.md §11.8, §11.13) : partagée par la sélection des
// scénarios exécutables et par les contrôles de CI. Analyse faite par @cucumber/gherkin.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AstBuilder, GherkinClassicTokenMatcher, Parser } from '@cucumber/gherkin';

export const DOSSIER_FEATURES = 'tests/features';

/** @typedef {{ chemin: string, ligne: number, nom: string, tags: ReadonlyArray<string>, identifiant: string | undefined }} Scenario */

const FORME_SCENARIO = /^(S\d+[a-z]*)\b/;
const FORME_FICHIER = /^(US-\d+)-/;

/** `US-001 S06` tiré du nom du fichier et du titre « S06 — … » ; undefined si le titre n'a pas ce format. */
const identifiantDe = (nomFichier, titre) => {
  const us = FORME_FICHIER.exec(nomFichier)?.[1];
  const numero = FORME_SCENARIO.exec(titre)?.[1];
  return us === undefined || numero === undefined ? undefined : `${us} ${numero}`;
};

const scenariosDeLEnfant = (enfant) => {
  if (enfant.scenario !== undefined) return [enfant.scenario];
  return (enfant.rule?.children ?? []).flatMap((e) =>
    e.scenario === undefined ? [] : [e.scenario],
  );
};

/**
 * Tous les scénarios du dossier, dans l'ordre des fichiers puis des lignes.
 * @param {string} [racine]
 * @returns {Array<Scenario>}
 */
export const lireScenarios = (racine = '.') => {
  const dossier = join(racine, DOSSIER_FEATURES);
  return readdirSync(dossier)
    .filter((nom) => nom.endsWith('.feature'))
    .sort()
    .flatMap((nom) => {
      let compteur = 0;
      const parser = new Parser(
        new AstBuilder(() => String((compteur += 1))),
        new GherkinClassicTokenMatcher(),
      );
      const feature = parser.parse(readFileSync(join(dossier, nom), 'utf8')).feature;
      if (feature === undefined) return [];
      const tagsFeature = feature.tags.map((tag) => tag.name);
      return feature.children.flatMap(scenariosDeLEnfant).map((scenario) => ({
        chemin: `${DOSSIER_FEATURES}/${nom}`,
        ligne: scenario.location.line,
        nom: scenario.name,
        tags: [...tagsFeature, ...scenario.tags.map((tag) => tag.name)],
        identifiant: identifiantDe(nom, scenario.name),
      }));
    });
};
