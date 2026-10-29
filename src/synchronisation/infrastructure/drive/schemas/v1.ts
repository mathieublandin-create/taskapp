import { z } from 'zod';
import { Duree } from '../../../../commun/domaine/duree';
import { IdAppareil, IdObjectif, IdTache } from '../../../../commun/domaine/identifiants';
import { DateCalendaire } from '../../../../commun/domaine/temps/date-calendaire';
import { Instant } from '../../../../commun/domaine/temps/instant';
import type { ContexteCausal } from '../../../domaine/contexte-causal';
import type { Generation } from '../../../domaine/contenu-fichier';
import type { EvenementJournal, TypeEvenementJournal } from '../../../domaine/evenement-journal';
import { creerHlc, type Hlc } from '../../../domaine/hlc';
import { lireIdEvenement } from '../../../domaine/identifiant-evenement';
import {
  idLien,
  type ChampDe,
  type CycleDeVie,
  type PlacementObjectif,
  type TypeElement,
  type ValeursParChamp,
} from '../../../domaine/information';

// ST-US-017 §5.2, §5.3 : schéma 1 du format Drive. Objets **lâches** (`z.looseObject`) : un champ inconnu d'une
// version plus récente de même schemaVersion est toléré (RG-058, ANT-19) ; `.strict()` est interdit.
// Dans un fichier d'appareil, l'appareil d'un HLC est un indice dans la table `appareils` du fichier :
// les schémas qui en dépendent sont construits pour une table donnée (`schemasFichierV1`).

// --- Types connus du schéma 1 (RC-R3-1) ----------------------------------------------------------
// Dérivés d'objets exhaustifs : un type ajouté au domaine sans être ajouté ici ne compile pas, ce qui évite qu'un
// appareil de même version ignore en silence une entrée qu'un autre a écrite (§5.3 ne vaut que pour l'inconnu).

export const TYPES_ELEMENT_V1 = {
  OBJECTIF: true,
  TACHE: true,
  LIEN_TACHE_OBJECTIF: true,
} as const satisfies Record<TypeElement, true>;

export const TYPES_EVENEMENT_V1 = {
  CREATION: true,
  MODIFICATION_DELAI: true,
  MODIFICATION_ESTIMATION: true,
  RATTACHEMENT: true,
  DETACHEMENT: true,
  CHANGEMENT_PARENT: true,
  FIN: true,
  REOUVERTURE: true,
  ABANDON: true,
  REPRISE: true,
  SUPPRESSION: true,
} as const satisfies Record<TypeEvenementJournal, true>;

/** Vrai seulement si A et B sont le même ensemble de types (comparaison dans les deux sens). Ne jamais combiner
 * deux résultats par `&` : `false & true` vaut `never`, qui satisfait `true`. */
type Egaux<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
/** Ne compile que pour `true` : sert d'assertion de type à la compilation. */
type Verifie<T extends true> = T;

// --- Valeurs élémentaires --------------------------------------------------------------------------

const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const uuidV7 = z.string().regex(UUID_V7);
const idAppareil = uuidV7.transform(IdAppareil.depuisUuid);
const idObjectif = uuidV7.transform(IdObjectif.depuisUuid);
const idTache = uuidV7.transform(IdTache.depuisUuid);

const idEvenement = z.string().transform((texte, ctx) => {
  const id = lireIdEvenement(texte);
  if (id === undefined) {
    ctx.issues.push({ code: 'custom', message: 'Événement invalide', input: texte });
  }
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
/** Entier de minutes, multiple de 30, zéro admis (RG-028). */
const duree = z.number().transform((minutes, ctx) => {
  const lue = Duree.calculee(minutes);
  if (!lue.ok) ctx.issues.push({ code: 'custom', message: 'Durée invalide', input: minutes });
  return lue.ok ? lue.valeur : z.NEVER;
});

type SansIndefini<T> = { [K in keyof T]: Exclude<T[K], undefined> };
/** Retire les propriétés `undefined` (exactOptionalPropertyTypes). */
const sansIndefini = <T extends object>(objet: T): SansIndefini<T> =>
  Object.fromEntries(
    Object.entries(objet).filter(([, valeur]) => valeur !== undefined),
  ) as SansIndefini<T>;

const empreinte = z.string().regex(/^[0-9a-f]{64}$/);

/** HLC dont l'appareil est lu par `appareil` (indice dans la table, ou identifiant dans le manifeste). */
const schemaHlc = (appareil: z.ZodType<IdAppareil>): z.ZodType<Hlc> =>
  z
    .looseObject({ physique: instantIso, compteur: z.number(), appareil })
    .transform((brut, ctx): Hlc => {
      const lu = creerHlc(brut.physique, brut.compteur, brut.appareil);
      if (!lu.ok) ctx.issues.push({ code: 'custom', message: 'Compteur invalide', input: brut });
      return lu.ok ? lu.valeur : z.NEVER;
    });

const schemaGeneration = (hlc: z.ZodType<Hlc>): z.ZodType<Generation> =>
  z.discriminatedUnion('type', [
    z
      .looseObject({ type: z.literal('INITIALE') })
      .transform((): Generation => ({ type: 'INITIALE' })),
    z
      .looseObject({ type: z.literal('NOUVELLE'), hlc })
      .transform(({ hlc: h }): Generation => ({ type: 'NOUVELLE', hlc: h })),
  ]);

// --- Enveloppes, lues avant la table des appareils ---------------------------------------------------

/** Lue en premier : `schemaVersion` décide de FormatPlusRecent avant toute autre validation. */
export const SchemaVersionLue = z.looseObject({ schemaVersion: z.number().int().positive() });

export const SchemaTableAppareilsV1 = z.looseObject({ appareils: z.array(idAppareil) });

// --- Valeurs des registres -------------------------------------------------------------------------

const cycleDeVie = z.discriminatedUnion('etat', [
  z.looseObject({ etat: z.literal('A_FAIRE') }).transform((): CycleDeVie => ({ etat: 'A_FAIRE' })),
  z
    .looseObject({ etat: z.literal('TERMINEE'), dateFin: dateCalendaire, instantFin: instantIso })
    .transform(({ dateFin, instantFin }): CycleDeVie => ({
      etat: 'TERMINEE',
      dateFin,
      instantFin,
    })),
  z
    .looseObject({
      etat: z.literal('ABANDONNEE'),
      dateAbandon: dateCalendaire,
      instantAbandon: instantIso,
      evenementAbandon: idEvenement,
      abandonParCascade: idEvenement.optional(),
    })
    .transform((c): CycleDeVie =>
      sansIndefini({
        etat: 'ABANDONNEE' as const,
        dateAbandon: c.dateAbandon,
        instantAbandon: c.instantAbandon,
        evenementAbandon: c.evenementAbandon,
        abandonParCascade: c.abandonParCascade,
      }),
    ),
]);

const schemaPlacement = (hlc: z.ZodType<Hlc>): z.ZodType<PlacementObjectif> =>
  z
    .looseObject({
      parentId: idObjectif.optional(),
      origine: z.enum(['CREATION', 'DEPLACEMENT']),
      hlcOrigine: hlc,
    })
    .transform(({ parentId, origine, hlcOrigine }) =>
      sansIndefini({ parentId, origine, hlcOrigine }),
    );

type SchemasDesValeurs = {
  [T in TypeElement]: { [C in ChampDe<T>]: z.ZodType<ValeursParChamp[T][C]> };
};

const schemasDesValeurs = (placement: z.ZodType<PlacementObjectif>): SchemasDesValeurs => ({
  OBJECTIF: {
    creation: z.looseObject({ creeLe: instantIso }).transform(({ creeLe }) => ({ creeLe })),
    intitule: z.string(),
    description: z
      .string()
      .nullable()
      .transform((v) => v ?? undefined),
    delai: dateCalendaire.nullable().transform((v) => v ?? undefined),
    parent: placement,
    suppression: z.literal(true),
  },
  TACHE: {
    creation: z
      .looseObject({ creeLe: instantIso, tacheParenteId: idTache.optional() })
      .transform(({ creeLe, tacheParenteId }) => sansIndefini({ creeLe, tacheParenteId })),
    intitule: z.string(),
    delai: dateCalendaire,
    estimationInitiale: duree,
    cycleDeVie,
    suppression: z.literal(true),
  },
  LIEN_TACHE_OBJECTIF: { actif: z.boolean() },
});

// --- Journal -----------------------------------------------------------------------------------------

const refObjectif = z
  .looseObject({ type: z.literal('OBJECTIF'), id: idObjectif })
  .transform(({ id }) => ({ type: 'OBJECTIF' as const, id }));
const refTache = z
  .looseObject({ type: z.literal('TACHE'), id: idTache })
  .transform(({ id }) => ({ type: 'TACHE' as const, id }));
const refElement = z.union([refObjectif, refTache]);
const vide = z.looseObject({}).transform((): Record<string, never> => ({}));
const etatJournal = z
  .looseObject({
    etat: z.enum(['A_FAIRE', 'TERMINEE', 'ABANDONNEE']),
    dateFin: dateCalendaire.optional(),
    dateAbandon: dateCalendaire.optional(),
  })
  .transform(({ etat, dateFin, dateAbandon }) => sansIndefini({ etat, dateFin, dateAbandon }));
const delaiJournal = z
  .looseObject({ delai: dateCalendaire.optional() })
  .transform(({ delai }) => sansIndefini({ delai }));
const objectifJournal = z
  .looseObject({ objectifId: idObjectif })
  .transform(({ objectifId }) => ({ objectifId }));
const estimationJournal = z
  .looseObject({ estimation: duree })
  .transform(({ estimation }) => ({ estimation }));

const creationObjectif = z.looseObject({
  type: z.literal('CREATION'),
  element: refObjectif,
  avant: vide,
  apres: z
    .looseObject({ parentId: idObjectif.optional(), delai: dateCalendaire.optional() })
    .transform(({ parentId, delai }) => sansIndefini({ parentId, delai })),
});
const creationTache = z.looseObject({
  type: z.literal('CREATION'),
  element: refTache,
  avant: vide,
  apres: z
    .looseObject({
      tacheParenteId: idTache.optional(),
      delai: dateCalendaire,
      estimation: duree,
      objectifIds: z.array(idObjectif),
    })
    .transform((a) =>
      sansIndefini({
        tacheParenteId: a.tacheParenteId,
        delai: a.delai,
        estimation: a.estimation,
        objectifIds: a.objectifIds,
      }),
    ),
});

/** Contenus d'événement qui ne dépendent pas de la table des appareils. */
const contenusSansHlc = [
  creationObjectif,
  creationTache,
  z.looseObject({
    type: z.literal('MODIFICATION_DELAI'),
    element: refElement,
    avant: delaiJournal,
    apres: delaiJournal,
  }),
  z.looseObject({
    type: z.literal('MODIFICATION_ESTIMATION'),
    element: refTache,
    avant: estimationJournal,
    apres: estimationJournal,
  }),
  z.looseObject({
    type: z.literal('RATTACHEMENT'),
    element: refTache,
    avant: vide,
    apres: objectifJournal,
  }),
  z.looseObject({
    type: z.literal('DETACHEMENT'),
    element: refTache,
    avant: objectifJournal,
    apres: vide,
  }),
  z.looseObject({
    type: z.enum(['FIN', 'REOUVERTURE', 'ABANDON', 'REPRISE']),
    element: refTache,
    avant: etatJournal,
    apres: etatJournal,
  }),
  z.looseObject({ type: z.literal('SUPPRESSION'), element: refElement, avant: vide, apres: vide }),
] as const;

const schemaContenuEvenement = (placement: z.ZodType<PlacementObjectif>) =>
  z.union([
    ...contenusSansHlc,
    z.looseObject({
      type: z.literal('CHANGEMENT_PARENT'),
      element: refObjectif,
      avant: placement,
      apres: placement,
    }),
  ]);

/** Assertion de compilation : le schéma lit exactement les types d'événement du domaine, ni plus ni moins. */
type TypeContenuEvenementV1 = z.output<ReturnType<typeof schemaContenuEvenement>>['type'];
export type ControleTypesEvenementV1 = [
  Verifie<Egaux<TypeContenuEvenementV1, TypeEvenementJournal>>,
  Verifie<Egaux<keyof typeof TYPES_EVENEMENT_V1, TypeEvenementJournal>>,
];

const schemaCommunEvenement = (hlc: z.ZodType<Hlc>) =>
  z.looseObject({
    id: idEvenement,
    hlc,
    instant: instantIso,
    jour: dateCalendaire,
    cause: idEvenement.optional(),
  });

// --- Fichier d'appareil ------------------------------------------------------------------------------

const schemaAppareilParIndice = (appareils: ReadonlyArray<IdAppareil>) =>
  z
    .number()
    .int()
    .nonnegative()
    .transform((indice, ctx) => {
      const appareil = appareils[indice];
      if (appareil === undefined) {
        ctx.issues.push({ code: 'custom', message: 'Appareil inconnu', input: indice });
      }
      return appareil ?? z.NEVER;
    });

/** Clés : indices d'appareil en texte, cohérents avec l'appareil du HLC ; le contexte relu est indexé par appareilId. */
const schemaContexte = (appareils: ReadonlyArray<IdAppareil>, hlc: z.ZodType<Hlc>) =>
  z.record(z.string().regex(/^(0|[1-9][0-9]*)$/), hlc).transform((brut, ctx): ContexteCausal =>
    Object.fromEntries(
      Object.entries(brut).map(([indice, h]) => {
        if (appareils[Number(indice)] !== h.appareil) {
          ctx.issues.push({ code: 'custom', message: 'Contexte incohérent', input: indice });
        }
        return [h.appareil, h];
      }),
    ),
  );

const construireSchemas = (appareils: ReadonlyArray<IdAppareil>) => {
  const hlc = schemaHlc(schemaAppareilParIndice(appareils));
  const placement = schemaPlacement(hlc);
  const registre = z.looseObject({
    type: z.string(),
    id: z.string(),
    champ: z.string(),
    valeur: z.unknown(),
    hlc,
    contexte: schemaContexte(appareils, hlc).optional(),
  });
  const fichier = z.looseObject({
    schemaVersion: z.number().int().positive(),
    versionApplication: z.string(),
    generation: schemaGeneration(hlc),
    appareil: z.looseObject({ id: idAppareil, plateforme: z.string() }),
    appareils: z.array(idAppareil),
    empreinte,
    registres: z.array(registre),
    journal: z.array(z.looseObject({ type: z.string() })),
    lectures: z.array(z.unknown()).optional(),
    valeursEcartees: z.array(z.unknown()).optional(),
  });
  return {
    fichier,
    valeurs: schemasDesValeurs(placement),
    contenuEvenement: schemaContenuEvenement(placement),
    communEvenement: schemaCommunEvenement(hlc),
  };
};

export type SchemasFichierV1 = ReturnType<typeof construireSchemas>;

/** Construire les schémas coûte plus que lire un fichier : ils sont gardés pour les dernières tables vues. */
const SCHEMAS_EN_CACHE = 8;
const cache = new Map<string, SchemasFichierV1>();

/** Schémas d'un fichier d'appareil dont la table des appareils est `appareils`. */
export const schemasFichierV1 = (appareils: ReadonlyArray<IdAppareil>): SchemasFichierV1 => {
  const cle = appareils.join(',');
  const connus = cache.get(cle);
  if (connus !== undefined) return connus;
  const construits = construireSchemas(appareils);
  if (cache.size >= SCHEMAS_EN_CACHE) cache.delete(cache.keys().next().value ?? '');
  cache.set(cle, construits);
  return construits;
};

/** Schéma de la valeur d'un champ connu du schéma 1 ; undefined pour un type ou un champ inconnu (§5.3). */
export const schemaDeValeurV1 = (
  schemas: SchemasFichierV1,
  type: string,
  champ: string,
): z.ZodType | undefined => {
  const parType: ReadonlyArray<readonly [string, Readonly<Record<string, z.ZodType>>]> =
    Object.entries(schemas.valeurs);
  const champs = parType.find(([nom]) => nom === type)?.[1];
  if (champs === undefined) return undefined;
  return Object.entries(champs).find(([nom]) => nom === champ)?.[1];
};

/** Identifiant d'un élément selon son type ; undefined s'il n'a pas la forme attendue. */
export const lireIdElementV1 = (type: TypeElement, id: string): string | undefined => {
  if (type === 'OBJECTIF') return idObjectif.safeParse(id).data;
  if (type === 'TACHE') return idTache.safeParse(id).data;
  const [tache, objectif, reste] = id.split('|');
  const tacheId = idTache.safeParse(tache).data;
  const objectifId = idObjectif.safeParse(objectif).data;
  return reste === undefined && tacheId !== undefined && objectifId !== undefined
    ? idLien(tacheId, objectifId)
    : undefined;
};

/** Entrée de journal relue (contenu et partie commune) ; undefined si elle est invalide. */
export const lireEvenementV1 = (
  schemas: SchemasFichierV1,
  brut: unknown,
): EvenementJournal | undefined => {
  const commun = schemas.communEvenement.safeParse(brut);
  const contenu = schemas.contenuEvenement.safeParse(brut);
  if (!commun.success || !contenu.success) return undefined;
  const { type, element, avant, apres } = contenu.data;
  const { id, hlc, instant, jour, cause } = commun.data;
  return sansIndefini({
    type,
    element,
    avant,
    apres,
    id,
    hlc,
    instant,
    jour,
    cause,
  }) as EvenementJournal;
};

// --- Manifeste ---------------------------------------------------------------------------------------

/** Dans le manifeste, sans table d'appareils, l'appareil d'un HLC est son identifiant (incrément 3). */
const hlcManifeste = schemaHlc(idAppareil);

export const SchemaManifesteV1 = z.looseObject({
  schemaVersion: z.number().int().positive(),
  empreinte,
  generation: schemaGeneration(hlcManifeste),
  restauration: hlcManifeste.optional(),
});
