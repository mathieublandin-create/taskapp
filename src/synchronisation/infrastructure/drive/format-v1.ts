import type { z } from 'zod';
import type { IdAppareil } from '../../../commun/domaine/identifiants';
import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import { Instant } from '../../../commun/domaine/temps/instant';
import type { CauseIllisible, ErreurTransport } from '../../application/ports/transport-synchro';
import type { ContexteCausal } from '../../domaine/contexte-causal';
import type {
  ContenuFichierAppareil,
  ContenuManifeste,
  Generation,
} from '../../domaine/contenu-fichier';
import { trierParIdentifiant } from '../../domaine/depot';
import type { RegistreQuelconque } from '../../domaine/ecriture';
import type { EvenementJournal } from '../../domaine/evenement-journal';
import type { Hlc } from '../../domaine/hlc';
import type {
  CleInformation,
  CycleDeVie,
  PlacementObjectif,
  TypeElement,
} from '../../domaine/information';
import type { Lecture } from '../../domaine/lectures';
import type { MotifValeurEcartee, ValeurEcartee } from '../../domaine/valeurs-ecartees';
import { SCHEMA_VERSION } from '../../domaine/version-schema';
import { compresser, decompresser } from './compression';
import {
  lireEvenementV1,
  lireIdElementV1,
  MOTIFS_VALEUR_ECARTEE_V1,
  schemaDeValeurV1,
  SchemaMotifV1,
  schemasFichierV1,
  SchemaManifesteV1,
  SchemaTableAppareilsV1,
  SchemaVersionLue,
  TYPES_ELEMENT_V1,
  TYPES_EVENEMENT_V1,
  type SchemasFichierV1,
} from './schemas/v1';
import { empreinteSha256, serialiserCanonique } from './serialisation-canonique';

// ST-US-017 §5.2 : schéma 1 (schémas Zod lâches dans ./schemas/v1.ts, `.strict()` interdit).
export type ErreurLecture = Extract<
  ErreurTransport,
  { readonly type: 'FichierIllisible' | 'FormatPlusRecent' }
>;

const PLATEFORME = 'web';
const CLE_EMPREINTE = 'empreinte';

const TYPES_ELEMENT: ReadonlySet<string> = new Set(Object.keys(TYPES_ELEMENT_V1));
const TYPES_EVENEMENT: ReadonlySet<string> = new Set(Object.keys(TYPES_EVENEMENT_V1));
const estMotifV1 = (motif: string): motif is MotifValeurEcartee =>
  Object.hasOwn(MOTIFS_VALEUR_ECARTEE_V1, motif);

const illisible = (cause: CauseIllisible): Resultat<never, ErreurLecture> =>
  echec({ type: 'FichierIllisible', cause });

// --- Encodage ------------------------------------------------------------------------------------

const hlcsDuPlacement = (valeur: unknown): ReadonlyArray<Hlc> => {
  const placement = valeur as Partial<PlacementObjectif>;
  return placement.hlcOrigine === undefined ? [] : [placement.hlcOrigine];
};

const hlcsDuRegistre = ({ cle, ecriture }: RegistreQuelconque): ReadonlyArray<Hlc> => [
  ecriture.hlc,
  ...Object.values(ecriture.contexte),
  ...(cle.type === 'OBJECTIF' && cle.champ === 'parent' ? hlcsDuPlacement(ecriture.valeur) : []),
];

const hlcsDeLEvenement = (e: EvenementJournal): ReadonlyArray<Hlc> => [
  e.hlc,
  ...(e.type === 'CHANGEMENT_PARENT'
    ? [...hlcsDuPlacement(e.avant), ...hlcsDuPlacement(e.apres)]
    : []),
];

const hlcsDeLaValeurEcartee = (v: ValeurEcartee): ReadonlyArray<Hlc> => [
  ...hlcsDuRegistre(v.ecartee),
  ...(v.motif === 'DONNEES_EFFACEES' ? [v.generation] : hlcsDuRegistre(v.gagnante)),
];

/**
 * Table des appareils cités par les HLC (écritures, contextes, placements, journal, génération, et, depuis l'incrément 2,
 * valeurs écartées et lectures : ST-US-017 v0.5 §5.2), triée.
 */
const tableDesAppareils = (contenu: ContenuFichierAppareil): ReadonlyArray<IdAppareil> => {
  const hlcs = [
    ...contenu.registres.flatMap(hlcsDuRegistre),
    ...contenu.journal.flatMap(hlcsDeLEvenement),
    ...(contenu.generation.type === 'NOUVELLE' ? [contenu.generation.hlc] : []),
    ...(contenu.valeursEcartees ?? []).flatMap(hlcsDeLaValeurEcartee),
    ...(contenu.lectures ?? []).map((l) => l.hlc),
  ];
  const cites = new Set(hlcs.map((h) => h.appareil));
  return [...cites].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
};

type Indices = ReadonlyMap<IdAppareil, number>;

const encoderHlc = (h: Hlc, indices: Indices): object => ({
  physique: Instant.enIso(h.physique),
  compteur: h.compteur,
  appareil: indices.get(h.appareil),
});

const encoderContexte = (contexte: ContexteCausal, indices: Indices): object =>
  Object.fromEntries(
    Object.values(contexte).map((h) => [String(indices.get(h.appareil)), encoderHlc(h, indices)]),
  );

const encoderPlacement = (placement: PlacementObjectif, indices: Indices): object => ({
  ...(placement.parentId === undefined ? {} : { parentId: placement.parentId }),
  origine: placement.origine,
  hlcOrigine: encoderHlc(placement.hlcOrigine, indices),
});

const encoderCycleDeVie = (cycle: CycleDeVie): object => {
  switch (cycle.etat) {
    case 'A_FAIRE':
      return { etat: cycle.etat };
    case 'TERMINEE':
      return { ...cycle, instantFin: Instant.enIso(cycle.instantFin) };
    case 'ABANDONNEE':
      return { ...cycle, instantAbandon: Instant.enIso(cycle.instantAbandon) };
  }
};

/** `undefined` → null ; Instant → ISO ; Duree → minutes ; placement et cycle de vie champ à champ. */
const encoderValeur = ({ cle, ecriture }: RegistreQuelconque, indices: Indices): unknown => {
  const valeur: unknown = ecriture.valeur;
  switch (`${cle.type}/${cle.champ}`) {
    case 'OBJECTIF/creation':
    case 'TACHE/creation': {
      const creation = valeur as { creeLe: Instant; tacheParenteId?: string };
      return { ...creation, creeLe: Instant.enIso(creation.creeLe) };
    }
    case 'OBJECTIF/description':
    case 'OBJECTIF/delai':
      return valeur ?? null;
    case 'OBJECTIF/parent':
      return encoderPlacement(valeur as PlacementObjectif, indices);
    case 'TACHE/cycleDeVie':
      return encoderCycleDeVie(valeur as CycleDeVie);
    default:
      return valeur;
  }
};

const encoderRegistre = (registre: RegistreQuelconque, indices: Indices): object => {
  const { cle, ecriture } = registre;
  const avecContexte = Object.keys(ecriture.contexte).length > 0;
  return {
    type: cle.type,
    id: cle.id,
    champ: cle.champ,
    valeur: encoderValeur(registre, indices),
    hlc: encoderHlc(ecriture.hlc, indices),
    ...(avecContexte ? { contexte: encoderContexte(ecriture.contexte, indices) } : {}),
  };
};

const encoderEvenement = (evenement: EvenementJournal, indices: Indices): object => {
  const { hlc, instant, ...reste } = evenement;
  const placements =
    reste.type === 'CHANGEMENT_PARENT'
      ? {
          avant: encoderPlacement(reste.avant, indices),
          apres: encoderPlacement(reste.apres, indices),
        }
      : {};
  return {
    ...reste,
    ...placements,
    hlc: encoderHlc(hlc, indices),
    instant: Instant.enIso(instant),
  };
};

/** §5.2 : `{ id, motif, ecartee, gagnante?, generation?, intituleElement? }`, registres sous la forme de `registres`. */
const encoderValeurEcartee = (valeur: ValeurEcartee, indices: Indices): object => {
  const commun = {
    id: valeur.id,
    motif: valeur.motif,
    ecartee: encoderRegistre(valeur.ecartee, indices),
  };
  // Switch exhaustif sans `default` : un motif ajouté au domaine sans cas ici ne compile pas (TS2366).
  switch (valeur.motif) {
    case 'CONFLIT':
    case 'PLACEMENT_ANNULE':
      return { ...commun, gagnante: encoderRegistre(valeur.gagnante, indices) };
    case 'SUPPRESSION':
      return {
        ...commun,
        gagnante: encoderRegistre(valeur.gagnante, indices),
        ...(valeur.intituleElement === undefined
          ? {}
          : { intituleElement: valeur.intituleElement }),
      };
    case 'DONNEES_EFFACEES':
      return { ...commun, generation: encoderHlc(valeur.generation, indices) };
  }
};

const encoderLecture = (lecture: Lecture, indices: Indices): object => ({
  id: lecture.id,
  hlc: encoderHlc(lecture.hlc, indices),
});

const encoderGeneration = (generation: Generation, encoder: (h: Hlc) => object): object =>
  generation.type === 'INITIALE'
    ? { type: 'INITIALE' }
    : { type: 'NOUVELLE', hlc: encoder(generation.hlc) };

/** Ajoute l'empreinte : SHA-256 de la sérialisation canonique de l'objet sans elle (§5.2). */
const sceller = async (objet: Readonly<Record<string, unknown>>): Promise<string> =>
  serialiserCanonique({
    ...objet,
    [CLE_EMPREINTE]: await empreinteSha256(serialiserCanonique(objet)),
  });

/** Sérialisation canonique avec empreinte, puis gzip. */
export const encoderFichierAppareil = async (
  contenu: ContenuFichierAppareil,
): Promise<Uint8Array> => {
  const appareils = tableDesAppareils(contenu);
  const indices: Indices = new Map(appareils.map((a, i) => [a, i]));
  const texte = await sceller({
    appareil: { id: contenu.appareil, plateforme: PLATEFORME },
    appareils,
    generation: encoderGeneration(contenu.generation, (h) => encoderHlc(h, indices)),
    journal: contenu.journal.map((e) => encoderEvenement(e, indices)),
    // §5.2 (incrément 2) : les deux tableaux sont toujours écrits, vides compris, triés par identifiant.
    lectures: trierParIdentifiant(contenu.lectures ?? []).map((l) => encoderLecture(l, indices)),
    registres: contenu.registres.map((r) => encoderRegistre(r, indices)),
    schemaVersion: contenu.schemaVersion,
    valeursEcartees: trierParIdentifiant(contenu.valeursEcartees ?? []).map((v) =>
      encoderValeurEcartee(v, indices),
    ),
    versionApplication: contenu.versionApplication,
  });
  return compresser(new TextEncoder().encode(texte));
};

const encoderHlcManifeste = (h: Hlc): object => ({
  physique: Instant.enIso(h.physique),
  compteur: h.compteur,
  appareil: h.appareil,
});

/** JSON canonique avec empreinte (non compressé). */
export const encoderManifeste = async (contenu: ContenuManifeste): Promise<Uint8Array> =>
  new TextEncoder().encode(
    await sceller({
      generation: encoderGeneration(contenu.generation, encoderHlcManifeste),
      ...(contenu.restauration === undefined
        ? {}
        : { restauration: encoderHlcManifeste(contenu.restauration) }),
      schemaVersion: contenu.schemaVersion,
    }),
  );

// --- Décodage ------------------------------------------------------------------------------------

const lireJson = (octets: Uint8Array): Resultat<Record<string, unknown>, ErreurLecture> => {
  try {
    const objet: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(octets));
    if (typeof objet !== 'object' || objet === null || Array.isArray(objet)) {
      return illisible('SCHEMA');
    }
    return succes(objet as Record<string, unknown>);
  } catch {
    return illisible('JSON');
  }
};

/** Version, puis empreinte de l'objet brut (champs inconnus compris) ; la validation Zod est faite entre les deux. */
const verifierVersion = (objet: Record<string, unknown>): Resultat<undefined, ErreurLecture> => {
  const version = SchemaVersionLue.safeParse(objet);
  if (!version.success) return illisible('SCHEMA');
  if (version.data.schemaVersion > SCHEMA_VERSION) {
    return echec({ type: 'FormatPlusRecent', schemaVersion: version.data.schemaVersion });
  }
  return succes(undefined);
};

const verifierEmpreinte = async (objet: Record<string, unknown>): Promise<boolean> => {
  const { [CLE_EMPREINTE]: empreinte, ...sansEmpreinte } = objet;
  return empreinte === (await empreinteSha256(serialiserCanonique(sansEmpreinte)));
};

type RegistreBrut = z.output<SchemasFichierV1['fichier']>['registres'][number];
type ValeurEcarteeBrute = z.output<SchemasFichierV1['valeurEcartee']>;

/** Registre relu ; 'IGNORE' pour un type ou un champ inconnu (§5.3), undefined s'il est invalide. */
const lireRegistre = (
  schemas: SchemasFichierV1,
  brut: RegistreBrut,
): RegistreQuelconque | 'IGNORE' | undefined => {
  if (!TYPES_ELEMENT.has(brut.type)) return 'IGNORE';
  const type = brut.type as TypeElement;
  const schema = schemaDeValeurV1(schemas, type, brut.champ);
  if (schema === undefined) return 'IGNORE';
  const id = lireIdElementV1(type, brut.id);
  const valeur = schema.safeParse(brut.valeur);
  if (id === undefined || !valeur.success) return undefined;
  const cle = { type, id, champ: brut.champ } as CleInformation;
  return {
    cle,
    ecriture: { valeur: valeur.data, hlc: brut.hlc, contexte: brut.contexte ?? {} },
  } as RegistreQuelconque;
};

/** Lit chaque élément ; undefined dès qu'un élément est invalide, les éléments ignorés étant écartés. */
const lireTout = <B, T>(
  bruts: ReadonlyArray<B>,
  lire: (brut: B) => T | 'IGNORE' | undefined,
): ReadonlyArray<T> | undefined => {
  const lus: Array<T> = [];
  for (const brut of bruts) {
    const lu = lire(brut);
    if (lu === undefined) return undefined;
    if (lu !== 'IGNORE') lus.push(lu);
  }
  return lus;
};

/** Registre relu d'une valeur écartée (`IGNORE` : type ou champ inconnu, §5.3 ; undefined : invalide). */
type RegistreLu = RegistreQuelconque | 'IGNORE' | undefined;

/** Entrée `DONNEES_EFFACEES` : `generation` exigée. */
const assemblerDonneesEffacees = (
  brute: ValeurEcarteeBrute,
  ecartee: RegistreLu,
): ValeurEcartee | 'IGNORE' | undefined => {
  if (brute.generation === undefined || ecartee === undefined) return undefined;
  if (ecartee === 'IGNORE') return 'IGNORE';
  return { id: brute.id, motif: 'DONNEES_EFFACEES', ecartee, generation: brute.generation };
};

/** Entrées `CONFLIT`, `SUPPRESSION`, `PLACEMENT_ANNULE` : `gagnante` exigée. */
const assemblerAvecGagnante = (
  schemas: SchemasFichierV1,
  motif: Exclude<MotifValeurEcartee, 'DONNEES_EFFACEES'>,
  brute: ValeurEcarteeBrute,
  ecartee: RegistreLu,
): ValeurEcartee | 'IGNORE' | undefined => {
  const { id, intituleElement } = brute;
  const gagnante = brute.gagnante === undefined ? undefined : lireRegistre(schemas, brute.gagnante);
  if (ecartee === undefined || gagnante === undefined) return undefined;
  if (ecartee === 'IGNORE' || gagnante === 'IGNORE') return 'IGNORE';
  // Exhaustif sans `default` (TS2366), comme `encoderValeurEcartee`.
  switch (motif) {
    case 'CONFLIT':
    case 'PLACEMENT_ANNULE':
      return { id, motif, ecartee, gagnante };
    case 'SUPPRESSION':
      return {
        id,
        motif,
        ecartee,
        gagnante,
        ...(intituleElement === undefined ? {} : { intituleElement }),
      };
  }
};

/** Motif lu avant la forme (DAT v0.11.7 §4.2) : motif inconnu → 'IGNORE' ; entrée mal formée → undefined. */
const lireValeurEcartee = (
  schemas: SchemasFichierV1,
  brut: unknown,
): ValeurEcartee | 'IGNORE' | undefined => {
  const entete = SchemaMotifV1.safeParse(brut);
  if (!entete.success) return undefined;
  const { motif } = entete.data;
  if (!estMotifV1(motif)) return 'IGNORE';
  const brute = schemas.valeurEcartee.safeParse(brut);
  if (!brute.success) return undefined;
  const ecartee = lireRegistre(schemas, brute.data.ecartee);
  return motif === 'DONNEES_EFFACEES'
    ? assemblerDonneesEffacees(brute.data, ecartee)
    : assemblerAvecGagnante(schemas, motif, brute.data, ecartee);
};

const decompresserEnJson = async (
  octets: Uint8Array,
): Promise<Resultat<Record<string, unknown>, ErreurLecture>> => {
  try {
    return lireJson(await decompresser(octets));
  } catch {
    return illisible('DECOMPRESSION');
  }
};

/** Tableaux `valeursEcartees` et `lectures`, rendus si et seulement si non vides (§5.2, UT-US-017-12) ; undefined si invalides. */
const lireSignalements = (
  schemas: SchemasFichierV1,
  fichier: {
    readonly valeursEcartees?: ReadonlyArray<unknown> | undefined;
    readonly lectures?: ReadonlyArray<unknown> | undefined;
  },
): Pick<ContenuFichierAppareil, 'valeursEcartees' | 'lectures'> | undefined => {
  const valeursEcartees = lireTout(fichier.valeursEcartees ?? [], (brut) =>
    lireValeurEcartee(schemas, brut),
  );
  const lectures = lireTout(fichier.lectures ?? [], (brut) => schemas.lecture.safeParse(brut).data);
  if (valeursEcartees === undefined || lectures === undefined) return undefined;
  return {
    ...(valeursEcartees.length === 0 ? {} : { valeursEcartees }),
    ...(lectures.length === 0 ? {} : { lectures }),
  };
};

/** Validation Zod puis lecture des registres et du journal (types et champs inconnus ignorés). */
const lireContenu = (
  objet: Record<string, unknown>,
): Resultat<ContenuFichierAppareil, ErreurLecture> => {
  const table = SchemaTableAppareilsV1.safeParse(objet);
  if (!table.success) return illisible('SCHEMA');
  const schemas = schemasFichierV1(table.data.appareils);
  const lu = schemas.fichier.safeParse(objet);
  if (!lu.success) return illisible('SCHEMA');
  const registres = lireTout(lu.data.registres, (brut) => lireRegistre(schemas, brut));
  const journal = lireTout(lu.data.journal, (brut) =>
    TYPES_EVENEMENT.has(brut.type) ? lireEvenementV1(schemas, brut) : 'IGNORE',
  );
  const signalements = lireSignalements(schemas, lu.data);
  if (registres === undefined || journal === undefined || signalements === undefined) {
    return illisible('SCHEMA');
  }
  return succes({
    schemaVersion: lu.data.schemaVersion,
    versionApplication: lu.data.versionApplication,
    generation: lu.data.generation,
    appareil: lu.data.appareil.id,
    registres,
    journal,
    ...signalements,
  });
};

/** gunzip, JSON, schemaVersion (> SCHEMA_VERSION : FormatPlusRecent), Zod, empreinte. */
export const decoderFichierAppareil = async (
  octets: Uint8Array,
): Promise<Resultat<ContenuFichierAppareil, ErreurLecture>> => {
  const json = await decompresserEnJson(octets);
  if (!json.ok) return json;
  const version = verifierVersion(json.valeur);
  if (!version.ok) return version;
  const contenu = lireContenu(json.valeur);
  if (!contenu.ok) return contenu;
  if (!(await verifierEmpreinte(json.valeur))) return illisible('EMPREINTE');
  return contenu;
};

export const decoderManifeste = async (
  octets: Uint8Array,
): Promise<Resultat<ContenuManifeste, ErreurLecture>> => {
  const json = lireJson(octets);
  if (!json.ok) return json;
  const objet = json.valeur;
  const version = verifierVersion(objet);
  if (!version.ok) return version;
  const lu = SchemaManifesteV1.safeParse(objet);
  if (!lu.success) return illisible('SCHEMA');
  if (!(await verifierEmpreinte(objet))) return illisible('EMPREINTE');
  return succes({
    schemaVersion: lu.data.schemaVersion,
    generation: lu.data.generation,
    ...(lu.data.restauration === undefined ? {} : { restauration: lu.data.restauration }),
  });
};
