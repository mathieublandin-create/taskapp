import type { IdAppareil } from '../../../commun/domaine/identifiants';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { Instant } from '../../../commun/domaine/temps/instant';
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

/**
 * `version` (incrément 3, ST-US-017 v0.10 §4.7) : champ `version` de Drive, qui croît à chaque modification du
 * fichier ; absente : inconnue (le fichier propre est alors relu, §6.7 n° 5).
 */
export type FichierAppareilDistant = {
  readonly id: IdFichierDrive;
  readonly appareil: IdAppareil;
  readonly version?: string;
};
/** Dépôt confirmé (incrément 3) : identifiant et `version` Drive du fichier écrit (absente : inconnue). */
export type FichierDepose = { readonly id: IdFichierDrive; readonly version?: string };
/** Fichier ou dossier du Drive et sa date de création (`createdTime`), pour l'ordre canonique (§6.7 n° 13). */
export type ElementDrive = { readonly id: IdFichierDrive; readonly creeA: Instant };
/** Métadonnées d'un dossier (incrément 3) : manifestes en ordre canonique, fichiers d'appareil avec leur version. */
export type InventaireDossier = {
  readonly manifestes: ReadonlyArray<ElementDrive>;
  readonly fichiers: ReadonlyArray<FichierAppareilDistant>;
};
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
  /**
   * Crée (fichierExistant absent) ou remplace le fichier de l'appareil ; idempotent. Incrément 3 : rend aussi la
   * `version` Drive du fichier écrit (`fields=id,version`), sans requête supplémentaire.
   */
  deposerFichierAppareil(p: {
    readonly dossier: IdFichierDrive;
    readonly contenu: ContenuFichierAppareil;
    readonly fichierExistant?: IdFichierDrive;
  }): Promise<Resultat<FichierDepose, ErreurTransport>>;
  lireManifeste(
    dossier: IdFichierDrive,
  ): Promise<Resultat<ManifesteDistant | undefined, ErreurTransport>>;
  ecrireManifeste(p: {
    readonly dossier: IdFichierDrive;
    readonly contenu: ContenuManifeste;
    readonly fichierExistant?: IdFichierDrive;
  }): Promise<Resultat<IdFichierDrive, ErreurTransport>>;
  // ---- Incrément 3 (ST-US-017 v0.10 §4.7 ; DAT §4.2.2) ----------------------------------------------------
  /** Dossiers « Done Juan » (appProperties) hors corbeille, en ordre canonique (createdTime, puis id). Ne crée rien. */
  listerDossiers(): Promise<Resultat<ReadonlyArray<ElementDrive>, ErreurTransport>>;
  /**
   * Métadonnées du dossier, hors corbeille : manifestes (ordre canonique) et fichiers d'appareil (avec `version`) ;
   * aucun contenu lu. Dossier supprimé : listes vides.
   */
  inventorierDossier(
    dossier: IdFichierDrive,
  ): Promise<Resultat<InventaireDossier, ErreurTransport>>;
  /** Contenu d'un manifeste désigné ; 404 → RessourceIntrouvable ; illisible → FichierIllisible ou FormatPlusRecent. */
  lireContenuManifeste(id: IdFichierDrive): Promise<Resultat<ContenuManifeste, ErreurTransport>>;
  /** Met un fichier ou un dossier à la corbeille ; déjà absent (404) → succès (idempotent). */
  supprimerFichier(id: IdFichierDrive): Promise<Resultat<undefined, ErreurTransport>>;
}
