/** Horloge et « Mettre à jour » d'une application sans espace ouvert : aucune correction, aucune version plus récente. */
export const HORLOGE_ABSENTE = {
  lireCorrectionHorloge: () => Promise.resolve(undefined),
  mettreAJour: () => Promise.resolve('AUCUNE_VERSION' as const),
};
