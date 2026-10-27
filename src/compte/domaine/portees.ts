import { nonImplemente } from '@non-implemente';

// DS-05, ADR-005, ENF-05 : portées du lot 1, toutes non sensibles.
export type Portee = 'openid' | 'email' | 'https://www.googleapis.com/auth/drive.file';

export const PORTEES_LOT_1: ReadonlyArray<Portee> = [
  'openid',
  'email',
  'https://www.googleapis.com/auth/drive.file',
];

/** Google renvoie `email` sous la forme `https://www.googleapis.com/auth/userinfo.email`. */
export const normaliserPortee = (_brute: string): string => nonImplemente('normaliserPortee');

/** Portées requises absentes des portées accordées (normalisées), dans l'ordre de `requises`. */
export const porteesManquantes = (
  _accordees: ReadonlyArray<string>,
  _requises: ReadonlyArray<Portee>,
): ReadonlyArray<Portee> => nonImplemente('porteesManquantes');
