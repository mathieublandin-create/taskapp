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
import type { RegistreQuelconque } from '../../domaine/ecriture';
import type { EvenementJournal } from '../../domaine/evenement-journal';
import type { Hlc } from '../../domaine/hlc';
import type {
  CleInformation,
  CycleDeVie,
  PlacementObjectif,
  TypeElement,
} from '../../domaine/information';
import { SCHEMA_VERSION } from '../../domaine/version-schema';
import { compresser, decompresser } from './compression';
import {
  lireEvenementV1,
  lireIdElementV1,
  schemaDeValeurV1,
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

const illisible = (cause: CauseIllisible): Resultat<never, ErreurLecture> =>
  echec({ type: 'FichierIllisible', cause });

// --- Encodage ------------------------------------------------------------------------------------

/** Table des appareils cités par les HLC (écritures, contextes, placements, journal, génération), triée. */
const tableDesAppareils = (contenu: ContenuFichierAppareil): ReadonlyArray<IdAppareil> => {
  const cites = new Set<IdAppareil>();
  const citer = (h: Hlc): void => {
    cites.add(h.appareil);
  };
  const citerPlacement = (valeur: unknown): void => {
    const placement = valeur as Partial<PlacementObjectif>;
    if (placement.hlcOrigine !== undefined) citer(placement.hlcOrigine);
  };
  contenu.registres.forEach(({ cle, ecriture }) => {
    citer(ecriture.hlc);
    Object.values(ecriture.contexte).forEach(citer);
    if (cle.type === 'OBJECTIF' && cle.champ === 'parent') citerPlacement(ecriture.valeur);
  });
  contenu.journal.forEach((e) => {
    citer(e.hlc);
    if (e.type === 'CHANGEMENT_PARENT') {
      citerPlacement(e.avant);
      citerPlacement(e.apres);
    }
  });
  if (contenu.generation.type === 'NOUVELLE') citer(contenu.generation.hlc);
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
    lectures: [],
    registres: contenu.registres.map((r) => encoderRegistre(r, indices)),
    schemaVersion: contenu.schemaVersion,
    valeursEcartees: [],
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

const decompresserEnJson = async (
  octets: Uint8Array,
): Promise<Resultat<Record<string, unknown>, ErreurLecture>> => {
  try {
    return lireJson(await decompresser(octets));
  } catch {
    return illisible('DECOMPRESSION');
  }
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
  if (registres === undefined || journal === undefined) return illisible('SCHEMA');
  return succes({
    schemaVersion: lu.data.schemaVersion,
    versionApplication: lu.data.versionApplication,
    generation: lu.data.generation,
    appareil: lu.data.appareil.id,
    registres,
    journal,
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
