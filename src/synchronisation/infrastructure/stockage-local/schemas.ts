import { z } from 'zod';
import { Duree } from '../../../commun/domaine/duree';
import { IdAppareil, IdObjectif, IdTache } from '../../../commun/domaine/identifiants';
import { EcartTemps } from '../../../commun/domaine/temps/ecart-temps';
import { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import { Instant } from '../../../commun/domaine/temps/instant';
import type { ContexteCausal } from '../../domaine/contexte-causal';
import type { RegistreQuelconque } from '../../domaine/ecriture';
import type { EtatLocal } from '../../domaine/etat-local';
import type { EvenementJournal } from '../../domaine/evenement-journal';
import { creerHlc, type Hlc } from '../../domaine/hlc';
import { lireIdEvenement } from '../../domaine/identifiant-evenement';
import type { EntreeEnAttente } from '../../domaine/index-en-attente';
import {
  cleEnTexte,
  idLien,
  type ChampDe,
  type CleInformation,
  type CycleDeVie,
  type PlacementObjectif,
  type TypeElement,
  type ValeursParChamp,
} from '../../domaine/information';

// Lignes IndexedDB de DepotLocalDexie (ST-socle-ecriture.md §5.1) : encodage du domaine vers des valeurs
// structurées, et relecture validée par Zod (conventions.md §6.2, « unknown aux frontières »).
// La relecture reconstruit chaque valeur par les constructeurs du domaine (identifiants UUID v7, HLC, durée) :
// une ligne altérée est rejetée, jamais convertie de force.

// --- Schémas de relecture -----------------------------------------------------------------------

const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const uuidV7 = z.string().regex(UUID_V7);
const idAppareil = uuidV7.transform(IdAppareil.depuisUuid);
const idObjectif = uuidV7.transform(IdObjectif.depuisUuid);
const idTache = uuidV7.transform(IdTache.depuisUuid);

/** Texte au format `IdEvenement` (`${operation}:${rang}`). */
const idEvenement = z.string().transform((texte, ctx) => {
  const id = lireIdEvenement(texte);
  if (id === undefined)
    ctx.issues.push({ code: 'custom', message: 'Événement invalide', input: texte });
  return id ?? z.NEVER;
});
const instantIso = z.string().transform((texte, ctx) => {
  const instant = Instant.depuisIso(texte);
  if (!instant.ok) ctx.issues.push({ code: 'custom', message: 'Instant invalide', input: texte });
  return instant.ok ? instant.valeur : z.NEVER;
});
const dateCalendaire = z.string().transform((texte, ctx) => {
  const date = DateCalendaire.depuisTexte(texte);
  if (!date.ok) ctx.issues.push({ code: 'custom', message: 'Date invalide', input: texte });
  return date.ok ? date.valeur : z.NEVER;
});
/** Durée multiple de 30 minutes, zéro admis (RG-028). */
const duree = z.number().transform((minutes, ctx) => {
  const lue = Duree.calculee(minutes);
  if (!lue.ok) ctx.issues.push({ code: 'custom', message: 'Durée invalide', input: minutes });
  return lue.ok ? lue.valeur : z.NEVER;
});
const dateOuNull = dateCalendaire.nullable().transform((valeur) => valeur ?? undefined);
const texteOuNull = z
  .string()
  .nullable()
  .transform((valeur) => valeur ?? undefined);

/** Retire les propriétés `undefined` : le domaine n'admet pas `propriete: undefined` (exactOptionalPropertyTypes). */
type SansIndefini<T> = { [K in keyof T]: Exclude<T[K], undefined> };
const sansIndefini = <T extends object>(objet: T): SansIndefini<T> =>
  Object.fromEntries(
    Object.entries(objet).filter(([, valeur]) => valeur !== undefined),
  ) as SansIndefini<T>;

const hlcStocke = z
  .object({ physique: instantIso, compteur: z.number(), appareil: idAppareil })
  .transform((brut, ctx): Hlc => {
    const hlc = creerHlc(brut.physique, brut.compteur, brut.appareil);
    if (!hlc.ok) ctx.issues.push({ code: 'custom', message: 'Compteur HLC invalide', input: brut });
    return hlc.ok ? hlc.valeur : z.NEVER;
  });
const contexteStocke = z.record(uuidV7, hlcStocke);

const placementStocke = z
  .object({
    parentId: idObjectif.optional(),
    origine: z.enum(['CREATION', 'DEPLACEMENT']),
    hlcOrigine: hlcStocke,
  })
  .transform((placement): PlacementObjectif => sansIndefini(placement));

const cycleDeVieStocke = z.discriminatedUnion('etat', [
  z.object({ etat: z.literal('A_FAIRE') }),
  z.object({ etat: z.literal('TERMINEE'), dateFin: dateCalendaire, instantFin: instantIso }),
  z
    .object({
      etat: z.literal('ABANDONNEE'),
      dateAbandon: dateCalendaire,
      instantAbandon: instantIso,
      evenementAbandon: idEvenement,
      abandonParCascade: idEvenement.optional(),
    })
    .transform((cycle) => sansIndefini(cycle)),
]);

type SchemasDesValeurs = {
  [T in TypeElement]: { [C in ChampDe<T>]: z.ZodType<ValeursParChamp[T][C]> };
};

/** Valeur stockée de chaque champ d'information, par type puis champ ; le compilateur vérifie la correspondance. */
const VALEURS_STOCKEES = {
  OBJECTIF: {
    creation: z.object({ creeLe: instantIso }),
    intitule: z.string(),
    description: texteOuNull,
    delai: dateOuNull,
    parent: placementStocke,
    suppression: z.literal(true),
  },
  TACHE: {
    creation: z
      .object({ creeLe: instantIso, tacheParenteId: idTache.optional() })
      .transform((creation) => sansIndefini(creation)),
    intitule: z.string(),
    delai: dateCalendaire,
    estimationInitiale: duree,
    cycleDeVie: cycleDeVieStocke.transform((cycle): CycleDeVie => cycle),
    suppression: z.literal(true),
  },
  LIEN_TACHE_OBJECTIF: { actif: z.boolean() },
} satisfies SchemasDesValeurs;

const schemaDeValeur = (type: TypeElement, champ: string): z.ZodType | undefined => {
  const schemas: ReadonlyArray<readonly [string, z.ZodType]> = Object.entries(
    VALEURS_STOCKEES[type],
  );
  return schemas.find(([nom]) => nom === champ)?.[1];
};

const typeElement = z.enum(['OBJECTIF', 'TACHE', 'LIEN_TACHE_OBJECTIF']);

const ligneRegistre = z.object({
  cle: z.string(),
  type: typeElement,
  id: z.string(),
  champ: z.string(),
  valeur: z.unknown(),
  hlc: hlcStocke,
  contexte: contexteStocke,
});

const ligneEnAttente = z.object({
  cle: z.string(),
  type: typeElement,
  id: z.string(),
  champ: z.string(),
  premiereEcriture: instantIso,
  derniereHlc: hlcStocke,
});

const refObjectif = z.object({ type: z.literal('OBJECTIF'), id: idObjectif });
const refTache = z.object({ type: z.literal('TACHE'), id: idTache });
const refElement = z.discriminatedUnion('type', [refObjectif, refTache]);
const vide = z.object({});
const etatJournal = z
  .object({
    etat: z.enum(['A_FAIRE', 'TERMINEE', 'ABANDONNEE']),
    dateFin: dateCalendaire.optional(),
    dateAbandon: dateCalendaire.optional(),
  })
  .transform((etat) => sansIndefini(etat));
const delaiJournal = z
  .object({ delai: dateCalendaire.optional() })
  .transform((delai) => sansIndefini(delai));

const contenuEvenement = z.union([
  z.object({
    type: z.literal('CREATION'),
    element: refObjectif,
    avant: vide,
    apres: z
      .object({ parentId: idObjectif.optional(), delai: dateCalendaire.optional() })
      .transform((apres) => sansIndefini(apres)),
  }),
  z.object({
    type: z.literal('CREATION'),
    element: refTache,
    avant: vide,
    apres: z
      .object({
        tacheParenteId: idTache.optional(),
        delai: dateCalendaire,
        estimation: duree,
        objectifIds: z.array(idObjectif),
      })
      .transform((apres) => sansIndefini(apres)),
  }),
  z.object({
    type: z.literal('MODIFICATION_DELAI'),
    element: refElement,
    avant: delaiJournal,
    apres: delaiJournal,
  }),
  z.object({
    type: z.literal('MODIFICATION_ESTIMATION'),
    element: refTache,
    avant: z.object({ estimation: duree }),
    apres: z.object({ estimation: duree }),
  }),
  z.object({
    type: z.literal('RATTACHEMENT'),
    element: refTache,
    avant: vide,
    apres: z.object({ objectifId: idObjectif }),
  }),
  z.object({
    type: z.literal('DETACHEMENT'),
    element: refTache,
    avant: z.object({ objectifId: idObjectif }),
    apres: vide,
  }),
  z.object({
    type: z.literal('CHANGEMENT_PARENT'),
    element: refObjectif,
    avant: placementStocke,
    apres: placementStocke,
  }),
  z.object({
    type: z.enum(['FIN', 'REOUVERTURE', 'ABANDON', 'REPRISE']),
    element: refTache,
    avant: etatJournal,
    apres: etatJournal,
  }),
  z.object({ type: z.literal('SUPPRESSION'), element: refElement, avant: vide, apres: vide }),
]);

const ligneJournal = z.object({
  id: idEvenement,
  hlc: hlcStocke,
  instant: instantIso,
  jour: dateCalendaire,
  cause: idEvenement.optional(),
  contenu: contenuEvenement,
});

// --- Encodage -----------------------------------------------------------------------------------

type HlcStocke = { physique: string; compteur: number; appareil: string };

export const encoderHlc = (hlc: Hlc): HlcStocke => ({
  physique: Instant.enIso(hlc.physique),
  compteur: hlc.compteur,
  appareil: hlc.appareil,
});

const encoderContexte = (contexte: ContexteCausal): Record<string, HlcStocke> =>
  Object.fromEntries(
    Object.entries(contexte).map(([appareil, hlc]) => [appareil, encoderHlc(hlc)]),
  );

const encoderPlacement = (placement: PlacementObjectif): object => ({
  ...placement,
  hlcOrigine: encoderHlc(placement.hlcOrigine),
});

const encoderCycleDeVie = (cycle: CycleDeVie): object => {
  switch (cycle.etat) {
    case 'A_FAIRE':
      return cycle;
    case 'TERMINEE':
      return { ...cycle, instantFin: Instant.enIso(cycle.instantFin) };
    case 'ABANDONNEE':
      return { ...cycle, instantAbandon: Instant.enIso(cycle.instantAbandon) };
  }
};

/** Valeur d'un registre sous sa forme stockée (`undefined` devient `null`, instants en ISO). */
const encoderValeur = (registre: RegistreQuelconque): unknown => {
  const { cle, ecriture } = registre;
  const valeur: unknown = ecriture.valeur;
  switch (`${cle.type}/${cle.champ}`) {
    case 'OBJECTIF/creation':
    case 'TACHE/creation': {
      const creation = valeur as { creeLe: Instant };
      return { ...creation, creeLe: Instant.enIso(creation.creeLe) };
    }
    case 'OBJECTIF/description':
    case 'OBJECTIF/delai':
      return valeur ?? null;
    case 'OBJECTIF/parent':
      return encoderPlacement(valeur as PlacementObjectif);
    case 'TACHE/cycleDeVie':
      return encoderCycleDeVie(valeur as CycleDeVie);
    default:
      return valeur;
  }
};

export const encoderRegistre = (registre: RegistreQuelconque): object => ({
  cle: cleEnTexte(registre.cle),
  type: registre.cle.type,
  id: registre.cle.id,
  champ: registre.cle.champ,
  valeur: encoderValeur(registre),
  hlc: encoderHlc(registre.ecriture.hlc),
  contexte: encoderContexte(registre.ecriture.contexte),
});

export const encoderEnAttente = (entree: {
  readonly cle: CleInformation;
  readonly entree: EntreeEnAttente;
}): object => ({
  cle: cleEnTexte(entree.cle),
  type: entree.cle.type,
  id: entree.cle.id,
  champ: entree.cle.champ,
  premiereEcriture: Instant.enIso(entree.entree.premiereEcriture),
  derniereHlc: encoderHlc(entree.entree.derniereHlc),
});

/** Texte triable `ISO|compteur sur 5 chiffres|appareil` (§5.1). */
const hlcTri = (hlc: Hlc): string =>
  `${Instant.enIso(hlc.physique)}|${String(hlc.compteur).padStart(5, '0')}|${hlc.appareil}`;

export const encoderEvenement = (evenement: EvenementJournal): object => {
  const { id, hlc, instant, jour, cause, ...contenu } = evenement;
  const contenuStocke =
    contenu.type === 'CHANGEMENT_PARENT'
      ? {
          ...contenu,
          avant: encoderPlacement(contenu.avant),
          apres: encoderPlacement(contenu.apres),
        }
      : contenu;
  return {
    id,
    hlc: encoderHlc(hlc),
    instant: Instant.enIso(instant),
    jour,
    ...(cause === undefined ? {} : { cause }),
    contenu: contenuStocke,
    elementType: evenement.element.type,
    elementId: evenement.element.id,
    hlcTri: hlcTri(hlc),
  };
};

// --- Décodage -----------------------------------------------------------------------------------

/** Identifiant d'un élément relu, construit selon son type ; undefined s'il n'a pas la forme attendue. */
const lireIdElement = (type: TypeElement, id: string): CleInformation['id'] | undefined => {
  if (type === 'OBJECTIF') return idObjectif.safeParse(id).data;
  if (type === 'TACHE') return idTache.safeParse(id).data;
  const [tache, objectif, reste] = id.split('|');
  const tacheId = idTache.safeParse(tache).data;
  const objectifId = idObjectif.safeParse(objectif).data;
  return reste === undefined && tacheId !== undefined && objectifId !== undefined
    ? idLien(tacheId, objectifId)
    : undefined;
};

/**
 * Seul rétablissement de type de la relecture : la clé, la valeur et l'écriture sont déjà construites,
 * et la valeur a été validée par le schéma du couple type/champ (VALEURS_STOCKEES).
 */
const assemblerRegistre = (
  cle: CleInformation,
  valeur: unknown,
  hlc: Hlc,
  contexte: ContexteCausal,
): RegistreQuelconque => ({ cle, ecriture: { valeur, hlc, contexte } }) as RegistreQuelconque;

/** Clé relue, cohérente avec ses colonnes (`type/id/champ`) et désignant un champ connu ; undefined sinon. */
const lireCle = (ligne: {
  cle: string;
  type: TypeElement;
  id: string;
  champ: string;
}): CleInformation | undefined => {
  const id = lireIdElement(ligne.type, ligne.id);
  if (id === undefined || schemaDeValeur(ligne.type, ligne.champ) === undefined) return undefined;
  if (ligne.cle !== `${ligne.type}/${ligne.id}/${ligne.champ}`) return undefined;
  return { type: ligne.type, id, champ: ligne.champ } as CleInformation;
};

/** Relit une ligne de la table `registres` ; undefined si elle est invalide. */
export const decoderRegistre = (ligne: unknown): RegistreQuelconque | undefined => {
  const lue = ligneRegistre.safeParse(ligne);
  if (!lue.success) return undefined;
  const cle = lireCle(lue.data);
  const valeur = schemaDeValeur(lue.data.type, lue.data.champ)?.safeParse(lue.data.valeur);
  if (cle === undefined || valeur?.success !== true) return undefined;
  return assemblerRegistre(cle, valeur.data, lue.data.hlc, lue.data.contexte);
};

/** Relit une ligne de la table `journal` ; undefined si elle est invalide. */
export const decoderEvenement = (ligne: unknown): EvenementJournal | undefined => {
  const lue = ligneJournal.safeParse(ligne);
  if (!lue.success) return undefined;
  const { contenu, ...commun } = lue.data;
  return sansIndefini({ ...contenu, ...commun });
};

/** Relit une ligne de la table `enAttente` ; undefined si elle est invalide. */
export const decoderEnAttente = (
  ligne: unknown,
): { readonly cle: CleInformation; readonly entree: EntreeEnAttente } | undefined => {
  const lue = ligneEnAttente.safeParse(ligne);
  if (!lue.success) return undefined;
  const cle = lireCle(lue.data);
  if (cle === undefined) return undefined;
  const { premiereEcriture, derniereHlc } = lue.data;
  return { cle, entree: { premiereEcriture, derniereHlc } };
};

// --- Table meta ---------------------------------------------------------------------------------

export type LigneMeta = { readonly nom: string; readonly valeur: unknown };

const schemasMeta = {
  appareilId: idAppareil,
  version: z.number().int().nonnegative(),
  dernierHlc: hlcStocke.nullable(),
  correctionHorloge: z.number().int(),
};

export type ValeursMeta = {
  readonly appareilId: IdAppareil;
  readonly version: number;
  readonly dernierHlc: Hlc | undefined;
  readonly correctionHorloge: EcartTemps;
};

/** Lignes `meta` d'un état : appareil, version, dernier HLC (null si aucun) et correction d'horloge. */
export const encoderMeta = (etat: EtatLocal): ReadonlyArray<LigneMeta> => [
  { nom: 'appareilId', valeur: etat.appareilId },
  { nom: 'version', valeur: etat.version },
  { nom: 'dernierHlc', valeur: etat.dernierHlc === undefined ? null : encoderHlc(etat.dernierHlc) },
  { nom: 'correctionHorloge', valeur: etat.correctionHorloge },
];

/** Relit la table `meta` ; undefined si une ligne est invalide. Les lignes absentes prennent leur valeur initiale. */
export const decoderMeta = (lignes: ReadonlyArray<unknown>): ValeursMeta | undefined => {
  const parNom = new Map(
    lignes.flatMap((ligne) => {
      const lue = z.object({ nom: z.string(), valeur: z.unknown() }).safeParse(ligne);
      return lue.success ? [[lue.data.nom, lue.data.valeur] as const] : [];
    }),
  );
  const appareilId = schemasMeta.appareilId.safeParse(parNom.get('appareilId'));
  const version = schemasMeta.version.safeParse(parNom.get('version') ?? 0);
  const dernierHlc = schemasMeta.dernierHlc.safeParse(parNom.get('dernierHlc') ?? null);
  const correction = schemasMeta.correctionHorloge.safeParse(parNom.get('correctionHorloge') ?? 0);
  if (!appareilId.success || !version.success || !dernierHlc.success || !correction.success) {
    return undefined;
  }
  return {
    appareilId: appareilId.data,
    version: version.data,
    dernierHlc: dernierHlc.data ?? undefined,
    correctionHorloge: EcartTemps.depuisMillisecondes(correction.data),
  };
};
