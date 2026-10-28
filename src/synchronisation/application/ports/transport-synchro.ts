import type { IdAppareil } from '../../../commun/domaine/identifiants';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ContenuFichierAppareil, ContenuManifeste } from '../../domaine/contenu-fichier';
import type { IdFichierDrive } from '../../domaine/meta-synchronisation';

// DS-10, DS-11, ADR-003 ; ST-US-022 §4.3 (rang 1) et ST-US-017 §4.3 (rang 3).
export type { IdFichierDrive } from '../../domaine/meta-synchronisation';

export type CauseIllisible = 'DECOMPRESSION' | 'JSON' | 'SCHEMA' | 'EMPREINTE';

export type ErreurTransport =
  | { readonly type: 'ReseauIndisponible' }
  | { readonly type: 'NonAutorise' }
  | { readonly type: 'DriveIndisponible' }
  | { readonly type: 'EspaceDrivePlein' }
  | { readonly type: 'ServeurIndisponible' }
  | { readonly type: 'RessourceIntrouvable' }
  | { readonly type: 'FichierIllisible'; readonly cause: CauseIllisible }
  | { readonly type: 'FormatPlusRecent'; readonly schemaVersion: number }
  /** `changements` : jeton inconnu ou périmé (Drive 400 ou 404) ; jamais une erreur transitoire (DAT v0.11.4 §4.3). */
  | { readonly type: 'JetonChangementsInvalide' };

export type FichierAppareilDistant = { readonly id: IdFichierDrive; readonly appareil: IdAppareil };
export type Changements = {
  readonly fichiers: ReadonlyArray<FichierAppareilDistant>;
  readonly jeton: string;
};
export type ManifesteDistant = { readonly id: IdFichierDrive; readonly contenu: ContenuManifeste };

export interface TransportSynchro {
  /** Recherche le dossier « Done Juan » (appProperties), le crée s'il est absent. Idempotent. */
  preparerDossier(): Promise<Resultat<IdFichierDrive, ErreurTransport>>;
  /**
   * Premier passage (ou après JetonChangementsInvalide) : jeton de départ (changes.getStartPageToken) obtenu
   * **avant** l'inventaire (files.list), puis tous les fichiers d'appareil du dossier (DAT v0.11.4 §4.3).
   */
  listerFichiersAppareils(dossier: IdFichierDrive): Promise<Resultat<Changements, ErreurTransport>>;
  /** changes.list depuis `jeton` : fichiers d'appareil créés ou modifiés, non supprimés ; jeton refusé → JetonChangementsInvalide. */
  changements(
    dossier: IdFichierDrive,
    jeton: string,
  ): Promise<Resultat<Changements, ErreurTransport>>;
  lireFichierAppareil(
    id: IdFichierDrive,
  ): Promise<Resultat<ContenuFichierAppareil, ErreurTransport>>;
  /** Crée (fichierExistant absent) ou remplace le fichier de l'appareil ; idempotent. */
  deposerFichierAppareil(p: {
    readonly dossier: IdFichierDrive;
    readonly contenu: ContenuFichierAppareil;
    readonly fichierExistant?: IdFichierDrive;
  }): Promise<Resultat<IdFichierDrive, ErreurTransport>>;
  lireManifeste(
    dossier: IdFichierDrive,
  ): Promise<Resultat<ManifesteDistant | undefined, ErreurTransport>>;
  ecrireManifeste(p: {
    readonly dossier: IdFichierDrive;
    readonly contenu: ContenuManifeste;
    readonly fichierExistant?: IdFichierDrive;
  }): Promise<Resultat<IdFichierDrive, ErreurTransport>>;
}
