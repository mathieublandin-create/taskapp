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
  cause: CauseEchecConnexion,
  contexte: { readonly espaceLocalExistant: boolean },
): MotifEchecConnexion => {
  switch (cause) {
    case 'ANNULEE':
      return 'ERR-001';
    case 'PORTEES_REFUSEES':
      return 'ERR-002';
    case 'HORS_LIGNE':
      return contexte.espaceLocalExistant ? 'ERR-004' : 'ERR-003';
    case 'INTERROMPUE':
    case 'DRIVE_MOMENTANEMENT_INDISPONIBLE':
      return 'ERR-005';
    case 'DRIVE_INDISPONIBLE_POUR_LE_COMPTE':
      return 'ERR-006';
  }
};
