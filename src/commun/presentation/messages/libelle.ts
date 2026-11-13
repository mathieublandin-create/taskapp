import { ErreurProgrammation } from '../../domaine/erreur-programmation';
import { CATALOGUE, type GabaritLibelle, type TextesLibelle } from './catalogue.fr';
import type { CodeCatalogue } from './codes';

// conventions.md §8.5 : interpolation des variables du guide ({n}, {element}, {date}…), pluriel
// (0 et 1 au singulier, Intl.PluralRules('fr')), typographie (espaces insécables, guillemets « »).
// Les gabarits sont dans catalogue.fr.ts (CATALOGUE).
export type VariablesLibelle = Readonly<Record<string, string | number>>;

/** Partie du texte d'un code : le libellé visible par défaut. */
export type PartieLibelle = keyof TextesLibelle;

/** Variable réservée : choisit la variante d'un gabarit (ERR-030, BAN-RAPPEL-24H, SYN-HORS-LIGNE…). */
const VARIABLE_VARIANTE = 'variante';

const ESPACE_INSECABLE = '\u00a0';
const REGLES_TYPOGRAPHIQUES: ReadonlyArray<readonly [RegExp, string]> = [
  [/ ([?!:;])/g, `${ESPACE_INSECABLE}$1`], // avant « : », « ? », « ! » et « ; »
  [/« /g, `«${ESPACE_INSECABLE}`], // guillemets français
  [/ »/g, `${ESPACE_INSECABLE}»`],
];

const FORME_PLURIELLE = /\{(\w+):([^{}|]*)\|([^{}]*)\}/g;
const VARIABLE = /\{(\w+)\}/g;
const REGLE_PLURIEL = new Intl.PluralRules('fr');

const valeurDe = (
  variables: VariablesLibelle,
  nom: string,
  code: CodeCatalogue,
): string | number => {
  const valeur = variables[nom];
  if (valeur === undefined) {
    throw new ErreurProgrammation(`Variable « ${nom} » absente pour le code ${code}`);
  }
  return valeur;
};

const accorder = (gabarit: string, variables: VariablesLibelle, code: CodeCatalogue): string =>
  gabarit.replace(FORME_PLURIELLE, (_, nom: string, singulier: string, pluriel: string) => {
    const nombre = Number(valeurDe(variables, nom, code));
    return REGLE_PLURIEL.select(nombre) === 'one' ? singulier : pluriel;
  });

const interpoler = (gabarit: string, variables: VariablesLibelle, code: CodeCatalogue): string =>
  gabarit.replace(VARIABLE, (_, nom: string) => String(valeurDe(variables, nom, code)));

/** Appliquée au gabarit seul : les valeurs interpolées (intitulés saisis) ne sont jamais retouchées. */
const typographie = (gabarit: string): string =>
  REGLES_TYPOGRAPHIQUES.reduce(
    (courant, [motif, remplacement]) => courant.replace(motif, remplacement),
    gabarit,
  );

const gabaritDe = (code: CodeCatalogue): GabaritLibelle => CATALOGUE[code];

const textesDe = (code: CodeCatalogue, variante: string | number | undefined): TextesLibelle => {
  const gabarit = gabaritDe(code);
  if (variante === undefined) return gabarit;
  const specifique = gabarit.variantes?.[String(variante)];
  if (specifique === undefined) {
    throw new ErreurProgrammation(`Variante « ${String(variante)} » inconnue pour le code ${code}`);
  }
  return { ...gabarit, ...specifique };
};

/** Texte du code dans la langue de l'application ; `partie` choisit le libellé, le texte, l'action ou le nom accessible. */
export const libelle = (
  code: CodeCatalogue,
  variables: VariablesLibelle = {},
  partie: PartieLibelle = 'libelle',
): string => {
  const gabarit = textesDe(code, variables[VARIABLE_VARIANTE])[partie];
  if (gabarit === undefined) {
    throw new ErreurProgrammation(`Le code ${code} n'a pas de « ${partie} »`);
  }
  return interpoler(typographie(accorder(gabarit, variables, code)), variables, code);
};

/** Vrai si le gabarit du code a cette partie : évite d'afficher un bouton ou un texte absent. */
export const aUnePartie = (code: CodeCatalogue, partie: PartieLibelle): boolean =>
  gabaritDe(code)[partie] !== undefined;

export const aUneVariante = (code: CodeCatalogue, variante: string): boolean =>
  gabaritDe(code).variantes?.[variante] !== undefined;
