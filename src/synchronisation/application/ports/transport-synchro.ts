import type { Marque } from '../../../commun/domaine/marque';
import type { Resultat } from '../../../commun/domaine/resultat';

// DS-10, DS-11, ADR-003 ; ST-US-022 §4.3 (rang 1) et ST-US-017 §4.3 (rang 3).
export type IdFichierDrive = Marque<string, 'IdFichierDrive'>;

export type ErreurTransport =
  | { readonly type: 'ReseauIndisponible' }
  | { readonly type: 'NonAutorise' }
  | { readonly type: 'DriveIndisponible' }
  | { readonly type: 'EspaceDrivePlein' }
  | { readonly type: 'ServeurIndisponible' }
  | { readonly type: 'RessourceIntrouvable' };

export interface TransportSynchro {
  /** Recherche le dossier « Done Juan » (appProperties), le crée s'il est absent. Idempotent. */
  preparerDossier(): Promise<Resultat<IdFichierDrive, ErreurTransport>>;
}
