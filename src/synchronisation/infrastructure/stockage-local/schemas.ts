import { z } from 'zod';
import type { IdAppareil } from '../../../commun/domaine/identifiants';
import { EcartTemps } from '../../../commun/domaine/temps/ecart-temps';
import { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import { Instant } from '../../../commun/domaine/temps/instant';
import type { RegistreQuelconque } from '../../domaine/ecriture';
import type { EtatLocal } from '../../domaine/etat-local';
import type { EvenementJournal } from '../../domaine/evenement-journal';
import type { Hlc } from '../../domaine/hlc';
import type { EntreeEnAttente } from '../../domaine/index-en-attente';
import {
  cleEnTexte,
  type CleInformation,
  type CycleDeVie,
  type PlacementObjectif,
} from '../../domaine/information';
import type { ContexteCausal } from '../../domaine/contexte-causal';

// Lignes IndexedDB de DepotLocalDexie (ST-socle-ecriture.md §5.1) : encodage du domaine vers des valeurs
// structurées, et relecture validée par Zod (conventions.md §6.2, « unknown aux frontières »).
// Les `as` de ce fichier suivent une validation Zod ; ils rétablissent les types marqués du domaine.

// --- Schémas de relecture -----------------------------------------------------------------------

const guid = z.guid();
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
const dateOuNull = dateCalendaire.nullable().transform((valeur) => valeur ?? undefined);
const texteOuNull = z
  .string()
  .nullable()
  .transform((valeur) => valeur ?? undefined);

const hlcStocke = z.object({
  physique: instantIso,
  compteur: z.number().int().nonnegative(),
  appareil: guid,
});
const contexteStocke = z.record(guid, hlcStocke);

const placementStocke = z.object({
  parentId: guid.optional(),
  origine: z.enum(['CREATION', 'DEPLACEMENT']),
  hlcOrigine: hlcStocke,
});

const cycleDeVieStocke = z.discriminatedUnion('etat', [
  z.object({ etat: z.literal('A_FAIRE') }),
  z.object({ etat: z.literal('TERMINEE'), dateFin: dateCalendaire, instantFin: instantIso }),
  z.object({
    etat: z.literal('ABANDONNEE'),
    dateAbandon: dateCalendaire,
    instantAbandon: instantIso,
    evenementAbandon: z.string(),
    abandonParCascade: z.string().optional(),
  }),
]);

/** Valeur stockée de chaque champ d'information, par `type/champ`. */
const VALEURS_STOCKEES: Readonly<Record<string, z.ZodType>> = {
  'OBJECTIF/creation': z.object({ creeLe: instantIso }),
  'OBJECTIF/intitule': z.string(),
  'OBJECTIF/description': texteOuNull,
  'OBJECTIF/delai': dateOuNull,
  'OBJECTIF/parent': placementStocke,
  'OBJECTIF/suppression': z.literal(true),
  'TACHE/creation': z.object({ creeLe: instantIso, tacheParenteId: guid.optional() }),
  'TACHE/intitule': z.string(),
  'TACHE/delai': dateCalendaire,
  'TACHE/estimationInitiale': z.number().int().nonnegative(),
  'TACHE/cycleDeVie': cycleDeVieStocke,
  'TACHE/suppression': z.literal(true),
  'LIEN_TACHE_OBJECTIF/actif': z.boolean(),
};

const ligneRegistre = z.object({
  cle: z.string(),
  type: z.enum(['OBJECTIF', 'TACHE', 'LIEN_TACHE_OBJECTIF']),
  id: z.string(),
  champ: z.string(),
  valeur: z.unknown(),
  hlc: hlcStocke,
  contexte: contexteStocke,
});

const ligneEnAttente = z.object({
  cle: z.string(),
  type: z.enum(['OBJECTIF', 'TACHE', 'LIEN_TACHE_OBJECTIF']),
  id: z.string(),
  champ: z.string(),
  premiereEcriture: instantIso,
  derniereHlc: hlcStocke,
});

const refElement = z.object({ type: z.enum(['OBJECTIF', 'TACHE']), id: guid });
const vide = z.object({});
const etatJournal = z.object({
  etat: z.enum(['A_FAIRE', 'TERMINEE', 'ABANDONNEE']),
  dateFin: dateCalendaire.optional(),
  dateAbandon: dateCalendaire.optional(),
});
const placementJournal = placementStocke;

const contenuEvenement = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('CREATION'),
    element: refElement,
    avant: vide,
    apres: z.object({
      parentId: guid.optional(),
      tacheParenteId: guid.optional(),
      delai: dateCalendaire.optional(),
      estimation: z.number().int().nonnegative().optional(),
      objectifIds: z.array(guid).optional(),
    }),
  }),
  z.object({
    type: z.literal('MODIFICATION_DELAI'),
    element: refElement,
    avant: z.object({ delai: dateCalendaire.optional() }),
    apres: z.object({ delai: dateCalendaire.optional() }),
  }),
  z.object({
    type: z.literal('MODIFICATION_ESTIMATION'),
    element: refElement,
    avant: z.object({ estimation: z.number().int().nonnegative() }),
    apres: z.object({ estimation: z.number().int().nonnegative() }),
  }),
  z.object({
    type: z.literal('RATTACHEMENT'),
    element: refElement,
    avant: vide,
    apres: z.object({ objectifId: guid }),
  }),
  z.object({
    type: z.literal('DETACHEMENT'),
    element: refElement,
    avant: z.object({ objectifId: guid }),
    apres: vide,
  }),
  z.object({
    type: z.literal('CHANGEMENT_PARENT'),
    element: refElement,
    avant: placementJournal,
    apres: placementJournal,
  }),
  z.object({
    type: z.enum(['FIN', 'REOUVERTURE', 'ABANDON', 'REPRISE']),
    element: refElement,
    avant: etatJournal,
    apres: etatJournal,
  }),
  z.object({ type: z.literal('SUPPRESSION'), element: refElement, avant: vide, apres: vide }),
]);

const ligneJournal = z.object({
  id: z.string(),
  hlc: hlcStocke,
  instant: instantIso,
  jour: dateCalendaire,
  cause: z.string().optional(),
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

const versHlc = (stocke: z.output<typeof hlcStocke>): Hlc => stocke as unknown as Hlc;

const versContexte = (stocke: Record<string, z.output<typeof hlcStocke>>): ContexteCausal =>
  stocke as unknown as ContexteCausal;

/** Relit une ligne de la table `registres` ; undefined si elle est invalide. */
export const decoderRegistre = (ligne: unknown): RegistreQuelconque | undefined => {
  const lue = ligneRegistre.safeParse(ligne);
  if (!lue.success) return undefined;
  const { type, id, champ, hlc, contexte } = lue.data;
  const schemaValeur = VALEURS_STOCKEES[`${type}/${champ}`];
  const valeur = schemaValeur?.safeParse(lue.data.valeur);
  if (valeur?.success !== true || lue.data.cle !== `${type}/${id}/${champ}`) return undefined;
  return {
    cle: { type, id, champ },
    ecriture: { valeur: valeur.data, hlc: versHlc(hlc), contexte: versContexte(contexte) },
  } as unknown as RegistreQuelconque;
};

/** Relit une ligne de la table `journal` ; undefined si elle est invalide. */
export const decoderEvenement = (ligne: unknown): EvenementJournal | undefined => {
  const lue = ligneJournal.safeParse(ligne);
  if (!lue.success) return undefined;
  const { contenu, hlc, ...commun } = lue.data;
  return { ...contenu, ...commun, hlc: versHlc(hlc) } as unknown as EvenementJournal;
};

/** Relit une ligne de la table `enAttente` ; undefined si elle est invalide. */
export const decoderEnAttente = (
  ligne: unknown,
): { readonly cle: CleInformation; readonly entree: EntreeEnAttente } | undefined => {
  const lue = ligneEnAttente.safeParse(ligne);
  if (!lue.success) return undefined;
  const { type, id, champ, premiereEcriture, derniereHlc } = lue.data;
  return {
    cle: { type, id, champ } as unknown as CleInformation,
    entree: { premiereEcriture, derniereHlc: versHlc(derniereHlc) },
  };
};

// --- Table meta ---------------------------------------------------------------------------------

export type LigneMeta = { readonly nom: string; readonly valeur: unknown };

const schemasMeta = {
  appareilId: guid,
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
    appareilId: appareilId.data as IdAppareil,
    version: version.data,
    dernierHlc: dernierHlc.data === null ? undefined : versHlc(dernierHlc.data),
    correctionHorloge: EcartTemps.depuisMillisecondes(correction.data),
  };
};
