import { nonImplemente } from '@non-implemente';
import type { CodeCatalogue } from './codes';

// conventions.md §8.5 : interpolation des variables du guide ({n}, {element}, {date}…), pluriel
// (0 et 1 au singulier, Intl.PluralRules('fr')), typographie (espaces insécables, guillemets « »).
// Les gabarits sont dans catalogue.fr.ts (CATALOGUE), réalisé par Benjamin (E12).
export type VariablesLibelle = Readonly<Record<string, string | number>>;

export const libelle = (_code: CodeCatalogue, _variables: VariablesLibelle = {}): string =>
  nonImplemente('libelle');
