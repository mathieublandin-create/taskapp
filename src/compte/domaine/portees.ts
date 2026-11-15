// DS-05, ADR-005, ENF-05 : portées du lot 1, toutes non sensibles.
export type Portee = 'openid' | 'email' | 'https://www.googleapis.com/auth/drive.file';

export const PORTEES_LOT_1: ReadonlyArray<Portee> = [
  'openid',
  'email',
  'https://www.googleapis.com/auth/drive.file',
];

const NOMS_LONGS: ReadonlyMap<string, string> = new Map([
  ['https://www.googleapis.com/auth/userinfo.email', 'email'],
]);

/** Google renvoie `email` sous la forme `https://www.googleapis.com/auth/userinfo.email`. */
export const normaliserPortee = (brute: string): string => NOMS_LONGS.get(brute) ?? brute;

/** Portées requises absentes des portées accordées (normalisées), dans l'ordre de `requises`. */
export const porteesManquantes = (
  accordees: ReadonlyArray<string>,
  requises: ReadonlyArray<Portee>,
): ReadonlyArray<Portee> => {
  const normalisees = new Set(accordees.map(normaliserPortee));
  return requises.filter((p) => !normalisees.has(p));
};
