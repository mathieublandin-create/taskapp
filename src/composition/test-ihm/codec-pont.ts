import { ErreurProgrammation } from '../../commun/domaine/erreur-programmation';

// ST-US-018 v0.4 §6.4 (rang 12, tranche B2) ; ST-US-031 §6.5. Codec des appels qui franchissent les bindings Playwright
// (`donejuanFauxDrive`, `donejuanFauxGoogle`) entre la page de la composition `test-ihm` et le processus cucumber.

/** Nom lisible du type refusé (message d'`ErreurProgrammation`) : jamais la valeur elle-même. */
const typeDe = (valeur: unknown): string => {
  if (typeof valeur === 'number') return `nombre non fini (${String(valeur)})`;
  if (typeof valeur !== 'object' || valeur === null) return typeof valeur;
  const prototype: unknown = Object.getPrototypeOf(valeur);
  const constructeur: unknown =
    typeof prototype === 'object' && prototype !== null && 'constructor' in prototype
      ? prototype.constructor
      : undefined;
  return typeof constructeur === 'function' && constructeur.name !== ''
    ? constructeur.name
    : 'objet';
};

const refuser = (chemin: string, valeur: unknown): never => {
  throw new ErreurProgrammation(
    `Valeur non transmissible par le pont en ${chemin} : ${typeDe(valeur)}`,
  );
};

const estObjetSimple = (valeur: object): boolean => {
  const prototype: unknown = Object.getPrototypeOf(valeur);
  return prototype === Object.prototype || prototype === null;
};

/** Valeur non composite admise par JSON strict (`null`, booléen, chaîne, nombre fini). */
const estScalaireAdmis = (valeur: unknown): boolean =>
  valeur === null ||
  typeof valeur === 'boolean' ||
  typeof valeur === 'string' ||
  (typeof valeur === 'number' && Number.isFinite(valeur));

/** Vérifie récursivement que `valeur` est du JSON strict ; `enObjet` : `undefined` admis (propriété omise). */
const verifier = (valeur: unknown, chemin: string, enObjet: boolean): void => {
  if ((valeur === undefined && enObjet) || estScalaireAdmis(valeur)) return;
  if (typeof valeur !== 'object' || valeur === null) {
    refuser(chemin, valeur);
    return;
  }
  if (Array.isArray(valeur)) {
    const elements: ReadonlyArray<unknown> = valeur;
    elements.forEach((element, indice) => {
      verifier(element, `${chemin}[${String(indice)}]`, false);
    });
    return;
  }
  if (!estObjetSimple(valeur)) {
    refuser(chemin, valeur);
    return;
  }
  // Une clé symbole serait perdue en silence par JSON.stringify.
  if (Object.getOwnPropertySymbols(valeur).length > 0) refuser(`${chemin}[symbole]`, Symbol());
  for (const [cle, element] of Object.entries(valeur)) verifier(element, `${chemin}.${cle}`, true);
};

/**
 * JSON strict : seuls `null`, booléens, nombres finis, chaînes, tableaux et objets simples sont admis ; une propriété
 * d'objet de valeur `undefined` est omise (`exactOptionalPropertyTypes`). Toute autre valeur (`undefined` en tableau
 * ou à la racine, `NaN`, `Infinity`, `bigint`, fonction, `Uint8Array`, `Map`, `Set`, `Date`, instance de classe) lève
 * `ErreurProgrammation` : rien n'est perdu en silence.
 */
export const encoderPont = (valeur: unknown): string => {
  verifier(valeur, '$', false);
  return JSON.stringify(valeur);
};

/** `JSON.parse` ; un texte qui n'est pas du JSON lève `ErreurProgrammation` (le texte n'est pas recopié). */
export const decoderPont = (texte: string): unknown => {
  try {
    return JSON.parse(texte) as unknown;
  } catch {
    throw new ErreurProgrammation(`Texte du pont illisible (${String(texte.length)} caractères)`);
  }
};
