/**
 * Horloge, « Mettre à jour » et persistance d'une application sans espace ouvert : aucune correction, aucune version
 * plus récente, stockage protégé (ST-US-018 v0.4 §6.3 : la ligne « Stockage » est alors `PROTEGE`, sans carte).
 */
export const HORLOGE_ABSENTE = {
  lireCorrectionHorloge: () => Promise.resolve(undefined),
  mettreAJour: () => Promise.resolve('AUCUNE_VERSION' as const),
  etatPersistance: () => Promise.resolve('PERSISTANT' as const),
};
