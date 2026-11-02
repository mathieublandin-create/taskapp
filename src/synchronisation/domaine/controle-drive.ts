import type { ContenuFichierAppareil, ContenuManifeste, Generation } from './contenu-fichier';
import { comparerHlc, maxHlc, type Hlc } from './hlc';
import { comparerGenerations, fusionnerManifestes, manifestesEgaux } from './manifeste';
import type { IdFichierDrive, MetaSynchronisation } from './meta-synchronisation';
import { SCHEMA_VERSION } from './version-schema';

// ST-US-017 v0.10 §6.7 (incrément 3, rang 10) ; RG-044 ; DAT §4.2.2 (ordre des contrôles, qui affiche ERR-012,
// restauration, génération, manifeste à plusieurs écrivains) ; DEC-030 (« repartir de zéro » l'emporte).

export type GenerationNouvelle = Extract<Generation, { readonly type: 'NOUVELLE' }>;

export const GENERATION_INITIALE: Generation = { type: 'INITIALE' };

/**
 * Ordre total des générations (n° 1) : `INITIALE` précède toute `NOUVELLE` ; deux `NOUVELLE` sont ordonnées par
 * `comparerHlc` de leur HLC.
 */
export { comparerGenerations };

/** Plus grande génération (n° 1) ; `INITIALE` si `generations` est vide. */
export const generationMax = (generations: Iterable<Generation>): Generation => {
  let max: Generation = GENERATION_INITIALE;
  for (const g of generations) if (comparerGenerations(g, max) > 0) max = g;
  return max;
};

/** Plus grand HLC d'une suite ; `undefined` si elle est vide. */
const hlcMax = (hlcs: Iterable<Hlc | undefined>): Hlc | undefined => {
  let max: Hlc | undefined;
  for (const h of hlcs) if (h !== undefined) max = max === undefined ? h : maxHlc(max, h);
  return max;
};

/**
 * Plus grand HLC d'un fichier d'appareil (n° 5) : maximum des HLC de ses registres, de son journal et de ses
 * lectures ; `undefined` si le fichier n'en contient aucun.
 */
export const hlcMaxDuContenu = (contenu: ContenuFichierAppareil): Hlc | undefined =>
  hlcMax([
    ...contenu.registres.map((r) => r.ecriture.hlc),
    ...contenu.journal.map((e) => e.hlc),
    ...(contenu.lectures ?? []).map((l) => l.hlc),
  ]);

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
  /**
   * v0.10.1, condition C8 de Starck (DAT v0.11.10 §4.2.2 b) : fichiers de **cet** appareil présents dans l'inventaire
   * du dossier autres que `meta.fichierPropre` (création interrompue, ou tous si `meta.fichierPropre` est absent), tous
   * lus à chaque cycle (introuvable : omis), dans l'ordre canonique. Leur génération compte au contrôle 3 et leur
   * format au contrôle 2 ; ils ne sont jamais fusionnés ni une altération ; le cycle les met à la corbeille (n° 12).
   */
  readonly orphelins: ReadonlyArray<{
    readonly id: IdFichierDrive;
    readonly lecture: LectureDrive<ContenuFichierAppareil>;
  }>;
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
export const situationDe = (meta: MetaSynchronisation): SituationLocale => ({
  manifesteAttendu: meta.manifeste !== undefined,
  fichierPropreAttendu: meta.fichierPropre !== undefined,
  generation: meta.generation ?? GENERATION_INITIALE,
  ...(meta.deposeJusquA === undefined ? {} : { deposeJusquA: meta.deposeJusquA }),
  restaurationDemandee: meta.restaurationDemandee === true,
  ...(meta.restaurationConnue === undefined ? {} : { restaurationConnue: meta.restaurationConnue }),
});

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
  /**
   * RG-044 b (contrôle 3) : génération effective plus récente que celle de l'appareil. `restaurationVue` : plus grande
   * `restauration` des manifestes lisibles, valeur initiale de `restaurationConnue` dans la méta de réinitialisation
   * (v0.10.1, condition C2). Si `generation.hlc.appareil` est cet appareil, c'est l'achèvement d'un « Repartir de zéro »
   * interrompu (condition C9, n° 11).
   */
  | {
      readonly type: 'NOUVELLE_GENERATION';
      readonly generation: GenerationNouvelle;
      readonly restaurationVue?: Hlc;
    }
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
 * v0.10.1, condition C1 de Starck (DAT v0.11.10 §4.2.2 b) : valeur de `restaurationConnue` après un cycle qui
 * synchronise ou restaure **sans changer de génération** = maximum (`comparerHlc`) de l'ancienne et de la
 * `restaurationVue` de la décision ; `undefined` si les deux le sont. Elle ne décroît jamais : un manifeste revenu en
 * arrière après une écriture concurrente perdue ne la fait pas reculer. (À un changement de génération, elle est
 * **initialisée**, et non maximisée : n° 11, condition C2.)
 */
export const restaurationConnueApres = (
  connue: Hlc | undefined,
  vue: Hlc | undefined,
): Hlc | undefined => hlcMax([connue, vue]);

/**
 * v0.10.1, condition C3 de Starck (DAT v0.11.10 §4.2.2 b, « HLC des choix ») : plancher du HLC d'un choix
 * (« Restaurer », « Repartir de zéro ») = maximum (`comparerHlc`) de `situation.restaurationConnue`, du HLC de
 * `situation.generation` (si `NOUVELLE`), des HLC de génération et de `restauration` des manifestes `LU`, et des HLC de
 * génération des fichiers `LU` (propre, autres, orphelins) ; `undefined` s'il n'y en a aucun. Les lectures
 * `ILLISIBLE` et `FORMAT_PLUS_RECENT` ne comptent pas. Le cycle tire `h = hlcSuivant(max(dernierHlc, plancher), …)`.
 */
export const hlcPlancherDesChoix = (
  observation: ObservationDrive,
  situation: SituationLocale,
): Hlc | undefined => {
  const lus = lecturesDe(observation);
  return hlcMax([
    situation.restaurationConnue,
    hlcDeGeneration(situation.generation),
    ...lus.manifestes.flatMap((m) => [hlcDeGeneration(m.generation), m.restauration]),
    ...lus.fichiers.map((f) => hlcDeGeneration(f.generation)),
  ]);
};

const hlcDeGeneration = (g: Generation): Hlc | undefined =>
  g.type === 'NOUVELLE' ? g.hlc : undefined;

/** Contenus lus valides de l'observation, et présence d'un format plus récent (contrôle 2). */
type Lus = {
  /** Manifestes `LU`, dans l'ordre canonique. */
  readonly manifestes: ReadonlyArray<ContenuManifeste>;
  /** Fichiers d'appareil `LU` : propre, autres et orphelins (C8). */
  readonly fichiers: ReadonlyArray<ContenuFichierAppareil>;
  readonly formatPlusRecent: boolean;
};

const lecturesDe = (o: ObservationDrive): Lus => {
  const lecturesFichiers: ReadonlyArray<LectureDrive<ContenuFichierAppareil>> = [
    ...(o.fichierPropre.type === 'ABSENT' || o.fichierPropre.type === 'INCHANGE'
      ? []
      : [o.fichierPropre]),
    ...o.autres.map((a) => a.lecture),
    ...o.orphelins.map((a) => a.lecture),
  ];
  const lecturesManifestes = o.manifestes.map((m) => m.lecture);
  return {
    manifestes: lecturesManifestes.flatMap((l) => (l.type === 'LU' ? [l.contenu] : [])),
    fichiers: lecturesFichiers.flatMap((l) => (l.type === 'LU' ? [l.contenu] : [])),
    formatPlusRecent: [...lecturesManifestes, ...lecturesFichiers].some(
      (l) => l.type === 'FORMAT_PLUS_RECENT',
    ),
  };
};

/** n° 6 : autres fichiers valides de la génération de l'appareil, dans l'ordre lu ; les autres sont ignorés. */
const fusionnablesDe = (o: ObservationDrive, generation: Generation): Fusionnables => {
  const aFusionner: Array<ContenuFichierAppareil> = [];
  const ignores: Array<IdFichierDrive> = [];
  for (const { id, lecture } of o.autres) {
    if (
      lecture.type === 'LU' &&
      comparerGenerations(lecture.contenu.generation, generation) === 0
    ) {
      aFusionner.push(lecture.contenu);
    } else {
      ignores.push(id);
    }
  }
  return { aFusionner, ignores };
};

/**
 * n° 8 : manifeste intact (vérifié par l'appelant), de la génération de l'appareil, restauration vue plus récente que
 * la dernière connue (ou celle-ci absente).
 */
const restaurationFaiteAilleurs = (
  lus: Lus,
  s: SituationLocale,
  restaurationVue: Hlc | undefined,
): boolean =>
  restaurationVue !== undefined &&
  comparerGenerations(generationMax(lus.manifestes.map((m) => m.generation)), s.generation) === 0 &&
  (s.restaurationConnue === undefined || comparerHlc(restaurationVue, s.restaurationConnue) > 0);

/**
 * n° 7 : sans altération (n° 4), les manifestes présents sont tous `LU`, et aucun manifeste présent implique que rien
 * n'est attendu. Aucun : première connexion si aucun autre fichier n'est présent, sinon rien. Sinon, jointure de tous
 * et de l'apport, si elle diffère du canonique.
 */
const manifesteAEcrireDe = (
  o: ObservationDrive,
  s: SituationLocale,
  manifestes: ReadonlyArray<ContenuManifeste>,
): ContenuManifeste | undefined => {
  const apport: ContenuManifeste = { schemaVersion: SCHEMA_VERSION, generation: s.generation };
  const [canonique, ...suivants] = manifestes;
  if (canonique === undefined) {
    return o.autresPresents ? undefined : apport;
  }
  const cible = [...suivants, apport].reduce(fusionnerManifestes, canonique);
  return manifestesEgaux(cible, canonique) ? undefined : cible;
};

/** n° 5 : fichier propre relu valide mais d'une autre génération, ou plus ancien que le dernier dépôt confirmé. */
const depotForce = (o: ObservationDrive, s: SituationLocale): boolean => {
  if (o.fichierPropre.type !== 'LU') return false;
  const contenu = o.fichierPropre.contenu;
  if (comparerGenerations(contenu.generation, s.generation) !== 0) return true;
  if (s.deposeJusquA === undefined) return false;
  const plusGrand = hlcMaxDuContenu(contenu);
  return plusGrand === undefined || comparerHlc(plusGrand, s.deposeJusquA) < 0;
};

/** Plus grande `restauration` des manifestes lisibles, toutes générations (n° 3 b, n° 7 ; C2). */
const restaurationVueDe = (lus: Lus): Hlc | undefined =>
  hlcMax(lus.manifestes.map((m) => m.restauration));

/** Contrôle 3 (n° 3 b) : génération effective (manifestes et fichiers lus valides) si elle dépasse celle de l'appareil. */
const generationPlusRecente = (lus: Lus, s: SituationLocale): GenerationNouvelle | undefined => {
  const hlc = hlcMax(
    [...lus.manifestes, ...lus.fichiers].map((c) => hlcDeGeneration(c.generation)),
  );
  if (hlc === undefined) return undefined;
  const generation: GenerationNouvelle = { type: 'NOUVELLE', hlc };
  return comparerGenerations(generation, s.generation) > 0 ? generation : undefined;
};

/** Contrôle 1 (n° 4) : portée de l'altération constatée, ou `undefined`. */
const alterationDe = (
  o: ObservationDrive,
  s: SituationLocale,
): 'MANIFESTE' | 'FICHIER_PROPRE' | undefined => {
  const manifesteAltere =
    o.manifestes.some((m) => m.lecture.type === 'ILLISIBLE') ||
    (o.manifestes.length === 0 && (s.manifesteAttendu || s.fichierPropreAttendu));
  if (manifesteAltere) return 'MANIFESTE';
  const fichierPropreAltere =
    s.fichierPropreAttendu &&
    (o.fichierPropre.type === 'ABSENT' || o.fichierPropre.type === 'ILLISIBLE');
  return fichierPropreAltere ? 'FICHIER_PROPRE' : undefined;
};

/** n° 8, n° 9 : décision devant une altération. */
const decisionSurAlteration = (
  portee: 'MANIFESTE' | 'FICHIER_PROPRE',
  lus: Lus,
  s: SituationLocale,
  fusion: Fusionnables,
): DecisionControle => {
  const restaurationVue = restaurationVueDe(lus);
  const vue = restaurationVue === undefined ? {} : { restaurationVue };
  if (s.restaurationDemandee) return { type: 'RESTAURER', motif: 'DEMANDEE', fusion, ...vue };
  if (portee === 'FICHIER_PROPRE' && restaurationFaiteAilleurs(lus, s, restaurationVue)) {
    return { type: 'RESTAURER', motif: 'FAITE_AILLEURS', fusion, ...vue };
  }
  return { type: 'ALTERATION', portee };
};

/**
 * Point unique des contrôles du DAT §4.2.2 (n° 3) : fonction pure, sans effet. Précédence :
 * FORMAT_PLUS_RECENT, puis NOUVELLE_GENERATION, puis RESTAURER ou ALTERATION, puis SYNCHRONISER.
 */
export const controlerDrive = (
  observation: ObservationDrive,
  situation: SituationLocale,
): DecisionControle => {
  const lus = lecturesDe(observation);
  // Contrôle 2 (RG-058) : seul contrôle qui arrête les suivants.
  if (lus.formatPlusRecent) return { type: 'FORMAT_PLUS_RECENT' };
  const restaurationVue = restaurationVueDe(lus);
  const vue = restaurationVue === undefined ? {} : { restaurationVue };
  // Contrôle 3 (RG-044 b, DEC-030) : même si une altération est constatée (DAT v0.11.10 §4.2.2 a).
  const generation = generationPlusRecente(lus, situation);
  if (generation !== undefined) return { type: 'NOUVELLE_GENERATION', generation, ...vue };
  const fusion = fusionnablesDe(observation, situation.generation);
  const portee = alterationDe(observation, situation);
  if (portee !== undefined) {
    return decisionSurAlteration(portee, lus, situation, fusion);
  }
  // n° 5 à 7.
  const manifesteAEcrire = manifesteAEcrireDe(observation, situation, lus.manifestes);
  return {
    type: 'SYNCHRONISER',
    fusion,
    ...(manifesteAEcrire === undefined ? {} : { manifesteAEcrire }),
    depotForce: depotForce(observation, situation),
    abandonnerDemande: situation.restaurationDemandee,
    ...vue,
  };
};
