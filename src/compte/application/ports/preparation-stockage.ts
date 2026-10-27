import type { Resultat } from '../../../commun/domaine/resultat';

// RG-020, US-022 CA-3 : dossier « Done Juan » prêt avant l'ouverture de l'espace local.
export type ErreurPreparation =
  | { readonly type: 'DriveIndisponiblePourLeCompte' }
  | { readonly type: 'DriveMomentanementIndisponible' }
  | { readonly type: 'ReseauInterrompu' };

export interface PreparationStockage {
  preparer(): Promise<Resultat<undefined, ErreurPreparation>>;
}
