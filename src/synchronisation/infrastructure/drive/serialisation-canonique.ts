import { ErreurProgrammation } from '../../../commun/domaine/erreur-programmation';

// conventions.md §10.3 : une seule sérialisation canonique, utilisée à l'écriture et à la lecture.

const comparerUnitesDeCode = (a: string, b: string): number => {
  if (a === b) return 0;
  return a < b ? -1 : 1;
};

const objetCanonique = (objet: object): string => {
  const entrees = Object.entries(objet)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => comparerUnitesDeCode(a, b));
  return `{${entrees.map(([cle, v]) => `${JSON.stringify(cle)}:${canonique(v)}`).join(',')}}`;
};

const canonique = (valeur: unknown): string => {
  if (valeur === null) return 'null';
  if (Array.isArray(valeur)) return `[${valeur.map(canonique).join(',')}]`;
  if (typeof valeur === 'object') return objetCanonique(valeur);
  if (typeof valeur === 'string' || typeof valeur === 'boolean') return JSON.stringify(valeur);
  if (typeof valeur === 'number' && Number.isFinite(valeur)) return JSON.stringify(valeur);
  throw new ErreurProgrammation(`Valeur non sérialisable : ${typeof valeur}`);
};

/**
 * JSON sans espace, clés d'objet triées (ordre des unités de code) à tous les niveaux, tableaux dans l'ordre.
 * Une propriété `undefined` est omise, comme dans JSON.stringify ; un nombre non fini est refusé.
 */
export const serialiserCanonique = (valeur: unknown): string => canonique(valeur);

/** SHA-256 de l'UTF-8 du texte, en hexadécimal minuscule (crypto.subtle). */
export const empreinteSha256 = async (texte: string): Promise<string> => {
  const condensat = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texte));
  return [...new Uint8Array(condensat)].map((o) => o.toString(16).padStart(2, '0')).join('');
};
