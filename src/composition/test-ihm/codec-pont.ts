import { nonImplemente } from '@non-implemente';

// ST-US-018 v0.4 §6.4 (rang 12, tranche B2) ; ST-US-031 §6.5. Codec des appels qui franchissent les bindings Playwright
// (`donejuanFauxDrive`, `donejuanFauxGoogle`) entre la page de la composition `test-ihm` et le processus cucumber.

/**
 * JSON strict : seuls `null`, booléens, nombres finis, chaînes, tableaux et objets simples sont admis ; une propriété
 * d'objet de valeur `undefined` est omise (`exactOptionalPropertyTypes`). Toute autre valeur (`undefined` en tableau
 * ou à la racine, `NaN`, `Infinity`, `bigint`, fonction, `Uint8Array`, `Map`, `Set`, `Date`, instance de classe) lève
 * `ErreurProgrammation` : rien n'est perdu en silence.
 */
export const encoderPont = (valeur: unknown): string =>
  nonImplemente(`encoderPont ${typeof valeur}`);

/** `JSON.parse` ; un texte qui n'est pas du JSON lève `ErreurProgrammation`. */
export const decoderPont = (texte: string): unknown => nonImplemente(`decoderPont ${texte}`);
