import { echec, succes } from '@src/commun/domaine/resultat';

/** Gestes de restauration d'une application sans espace ouvert : aucun choix n'a d'objet (`AucuneAlteration`). */
export const RESTAURATION_ABSENTE = {
  lireChoixRestauration: () => Promise.resolve(undefined),
  lireRestaurationFaiteIci: () => Promise.resolve(undefined),
  demanderRestauration: () => Promise.resolve(echec({ type: 'AucuneAlteration' as const })),
  annulerRestauration: () => Promise.resolve(succes(undefined)),
  evaluerRepartirDeZero: () => Promise.resolve(echec({ type: 'AucuneAlteration' as const })),
  repartirDeZero: () => Promise.resolve(echec({ type: 'AucuneAlteration' as const })),
};
