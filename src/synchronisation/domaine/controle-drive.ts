import { nonImplemente } from '@non-implemente';
import type { ContenuFichierAppareil, ContenuManifeste, Generation } from './contenu-fichier';
import type { Hlc } from './hlc';
import type { IdFichierDrive, MetaSynchronisation } from './meta-synchronisation';

// ST-US-017 v0.10 §6.7 (incrément 3, rang 10) ; RG-044 ; DAT §4.2.2 (ordre des contrôles, qui affiche ERR-012,
// restauration, génération, manifeste à plusieurs écrivains) ; DEC-030 (« repartir de zéro » l'emporte).

export type GenerationNouvelle = Extract<Generation, { readonly type: 'NOUVELLE' }>;

export const GENERATION_INITIALE: Generation = { type: 'INITIALE' };

/**
 * Ordre total des générations (n° 1) : `INITIALE` précède toute `NOUVELLE` ; deux `NOUVELLE` sont ordonnées par
 * `comparerHlc` de leur HLC.
 */
export const comparerGenerations = (a: Generation, b: Generation): -1 | 0 | 1 =>
  nonImplemente(`comparerGenerations (${a.type}, ${b.type})`);

/** Plus grande génération (n° 1) ; `INITIALE` si `generations` est vide. */
export const generationMax = (generations: Iterable<Generation>): Generation =>
  nonImplemente(`generationMax (${typeof generations})`);

/**
 * Plus grand HLC d'un fichier d'appareil (n° 5) : maximum des HLC de ses registres, de son journal et de ses
 * lectures ; `undefined` si le fichier n'en contient aucun.
 */
export const hlcMaxDuContenu = (contenu: ContenuFichierAppareil): Hlc | undefined =>
  nonImplemente(`hlcMaxDuContenu (${contenu.appareil})`);

/** Lecture d'un fichier du Drive vue par le domaine (n° 2) ; la cause d'une illisibilité ne change aucune décision. */
export type LectureDrive<T> =
  | { readonly type: 'LU'; readonly contenu: T }
  | { readonly type: 'ILLISIBLE' }
  | { readonly type: 'FORMAT_PLUS_RECENT'; readonly schemaVersion: number };

/** Ce que le cycle a observé du Drive avant toute écriture (n° 2). */
export type ObservationDrive = {
  /** Faux : aucun dossier « Done Juan » (ni le dossier mémorisé, ni un autre). `manifestes` et `autres` sont alors vides. */
  readonly dossierPresent: boolean;
  /** Manifestes présents du dossier, dans l'ordre canonique (n° 13) ; un manifeste introuvable à la lecture est omis. */
  readonly manifestes: ReadonlyArray<{
    readonly id: IdFichierDrive;
    readonly lecture: LectureDrive<ContenuManifeste>;
  }>;
  /**
   * Fichier de cet appareil : `ABSENT` (introuvable dans l'inventaire du dossier, ou non attendu : non cherché) ;
   * `INCHANGE` (version égale à `versionFichierPropre`, non relu) ; sinon sa lecture.
   */
  readonly fichierPropre:
    | { readonly type: 'ABSENT' }
    | { readonly type: 'INCHANGE' }
    | LectureDrive<ContenuFichierAppareil>;
  /** Fichiers des autres appareils lus pendant ce cycle (nouveaux ou modifiés depuis le jeton, ou tous). */
  readonly autres: ReadonlyArray<{
    readonly id: IdFichierDrive;
    readonly lecture: LectureDrive<ContenuFichierAppareil>;
  }>;
  /** Vrai si l'inventaire du dossier contient au moins un fichier d'un autre appareil (lu ou non pendant ce cycle). */
  readonly autresPresents: boolean;
};

/** Ce que l'appareil sait de lui-même (méta locale, n° 2). */
export type SituationLocale = {
  /** Manifeste lu ou écrit au moins une fois (`meta.manifeste` défini). */
  readonly manifesteAttendu: boolean;
  /** Premier dépôt confirmé (`meta.fichierPropre` défini). */
  readonly fichierPropreAttendu: boolean;
  readonly generation: Generation;
  readonly deposeJusquA?: Hlc;
  readonly restaurationDemandee: boolean;
  readonly restaurationConnue?: Hlc;
};

/** Situation locale tirée de la méta (n° 2) : clés absentes → faux, `INITIALE`, ou absentes. */
export const situationDe = (meta: MetaSynchronisation): SituationLocale =>
  nonImplemente(`situationDe (${String(meta.fusionNonDeposee)})`);

/** Fichiers des autres appareils retenus pour la fusion (n° 6). */
export type Fusionnables = {
  /** Fichiers lus valides de la génération de l'appareil, dans l'ordre de `ObservationDrive.autres`. */
  readonly aFusionner: ReadonlyArray<ContenuFichierAppareil>;
  /** Identifiants des fichiers lus illisibles ou d'une autre génération (journal « avertissement », sans message). */
  readonly ignores: ReadonlyArray<IdFichierDrive>;
};

/** Décision unique d'un cycle (n° 3 à n° 7), dans l'ordre de précédence du n° 3. */
export type DecisionControle =
  /** RG-058 (contrôle 2) : aucune écriture, aucun effacement, aucun contrôle suivant (incrément 4 : consultation seule). */
  | { readonly type: 'FORMAT_PLUS_RECENT' }
  /** RG-044 b (contrôle 3) : génération effective plus récente que celle de l'appareil. */
  | { readonly type: 'NOUVELLE_GENERATION'; readonly generation: GenerationNouvelle }
  /** `ERR-012` (n° 4) : rien n'est écrit dans le Drive tant que l'altération demeure. */
  | { readonly type: 'ALTERATION'; readonly portee: 'MANIFESTE' | 'FICHIER_PROPRE' }
  /** n° 8, n° 9 : réécriture du fichier propre (et, si `DEMANDEE`, du manifeste) ; fusion des fichiers valides avant. */
  | {
      readonly type: 'RESTAURER';
      readonly motif: 'DEMANDEE' | 'FAITE_AILLEURS';
      readonly fusion: Fusionnables;
      readonly restaurationVue?: Hlc;
    }
  /** Cycle normal (n° 5, n° 6, n° 7). */
  | {
      readonly type: 'SYNCHRONISER';
      readonly fusion: Fusionnables;
      /** Contenu à écrire dans le manifeste canonique (première connexion ou manifeste en retard), sinon absent. */
      readonly manifesteAEcrire?: ContenuManifeste;
      /** Fichier propre relu valide mais périmé (autre génération, ou plus ancien que `deposeJusquA`). */
      readonly depotForce: boolean;
      /** Une restauration demandée devenue sans objet (aucune altération) est oubliée. */
      readonly abandonnerDemande: boolean;
      /** Plus grande `restauration` des manifestes lisibles, à mémoriser dans `restaurationConnue`. */
      readonly restaurationVue?: Hlc;
    };

/**
 * Point unique des contrôles du DAT §4.2.2 (n° 3) : fonction pure, sans effet. Précédence :
 * FORMAT_PLUS_RECENT, puis NOUVELLE_GENERATION, puis RESTAURER ou ALTERATION, puis SYNCHRONISER.
 */
export const controlerDrive = (
  observation: ObservationDrive,
  situation: SituationLocale,
): DecisionControle =>
  nonImplemente(
    `controlerDrive (${String(observation.manifestes.length)}, ${situation.generation.type})`,
  );
