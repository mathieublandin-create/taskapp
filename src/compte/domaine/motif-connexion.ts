import { nonImplemente } from '@non-implemente';

// US-022 « Motifs de connexion » ; guide d'ergonomie §6.6.8 ; conventions.md §8.5.
export type MotifEchecConnexion =
  'ERR-001' | 'ERR-002' | 'ERR-003' | 'ERR-004' | 'ERR-005' | 'ERR-006';

export type CauseEchecConnexion =
  | 'ANNULEE'
  | 'PORTEES_REFUSEES'
  | 'HORS_LIGNE'
  | 'INTERROMPUE'
  | 'DRIVE_MOMENTANEMENT_INDISPONIBLE'
  | 'DRIVE_INDISPONIBLE_POUR_LE_COMPTE';

/** HORS_LIGNE : ERR-004 si un espace de compte existe sur l'appareil, sinon ERR-003 (ST-US-022 §6.7). */
export const motifEchecConnexion = (
  _cause: CauseEchecConnexion,
  _contexte: { readonly espaceLocalExistant: boolean },
): MotifEchecConnexion => nonImplemente('motifEchecConnexion');
