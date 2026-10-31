import type { Marque } from '../../commun/domaine/marque';
import { condensatSha256, encoderBase32Hex } from './condensat-sha256';
import { estConnue } from './contexte-causal';
import { estRegistre, type Registre, type RegistreQuelconque } from './ecriture';
import { comparerHlc, type Hlc } from './hlc';
import {
  cleDeChamp,
  cleEnTexte,
  elementDeCle,
  type CleInformation,
  type CleTexte,
  type RefElementMetier,
} from './information';
import { cibleDe } from './pierre-tombale';

// ST-US-017 v0.5 §4.6, §6.6 ; DAT §4.2.1 (critère du contexte causal, pierre tombale étendue H-1, signalement unique).

/** base32hex(SHA-256(UTF-8 de `${type}|${id}|${champ}|${appareil}|${physique}|${compteur}`)), 52 caractères. */
export type IdValeurEcartee = Marque<string, 'IdValeurEcartee'>;

/**
 * Identifiant déterministe d'une valeur écartée : information écartée et HLC de l'écriture écartée (DAT §4.2.1) ; pour
 * un placement annulé, HLC du déplacement annulé (`hlcOrigine`, DAT §4.2). `physique` en millisecondes entières.
 */
export const idValeurEcartee = (cle: CleInformation, hlcEcarte: Hlc): IdValeurEcartee => {
  const { appareil, physique, compteur } = hlcEcarte;
  const texte = [cle.type, cle.id, cle.champ, appareil, String(physique), String(compteur)].join(
    '|',
  );
  return encoderBase32Hex(condensatSha256(new TextEncoder().encode(texte))) as IdValeurEcartee;
};

type Commune = {
  readonly id: IdValeurEcartee;
  /** Écriture écartée (L), telle qu'elle était au moment du constat. */
  readonly ecartee: RegistreQuelconque;
};

export type ValeurEcartee =
  /** RG-036 : W gagnante écrite sans connaissance de L (`ALR-009`). */
  | (Commune & { readonly motif: 'CONFLIT'; readonly gagnante: RegistreQuelconque })
  /**
   * RG-047 : L écartée par la pierre tombale `gagnante` (registre `suppression`), H-1 compris (`ALR-010`).
   * `intituleElement` : intitulé de l'élément de L connu de la suppression, s'il existe (§6.6, n° 4).
   */
  | (Commune & {
      readonly motif: 'SUPPRESSION';
      readonly gagnante: RegistreQuelconque;
      readonly intituleElement?: string;
    })
  /** RG-048 : déplacement annulé ; `gagnante` = registre `parent` écrit par la réparation (`ALR-011`). */
  | (Commune & { readonly motif: 'PLACEMENT_ANNULE'; readonly gagnante: RegistreQuelconque })
  /** RG-044 b (incrément 3) : modification perdue par « repartir de zéro » (`ALR-014`, groupée sous `ALR-008`). */
  | (Commune & { readonly motif: 'DONNEES_EFFACEES'; readonly generation: Hlc });

export type MotifValeurEcartee = ValeurEcartee['motif'];

/** H-6 : seules ces entrées comptent dans `aLire` (`ALR-009` à `ALR-011`). */
export const MOTIFS_A_LIRE: ReadonlySet<MotifValeurEcartee> = new Set([
  'CONFLIT',
  'SUPPRESSION',
  'PLACEMENT_ANNULE',
]);

/** HLC qui départage deux entrées de même identifiant (le plus petit l'emporte, DAT §4.2.1). */
export const hlcDuGagnant = (v: ValeurEcartee): Hlc =>
  v.motif === 'DONNEES_EFFACEES' ? v.generation : v.gagnante.ecriture.hlc;

/** Registres d'un état (forme commune à `EtatLocal` et `EtatFusionnable`, sans dépendre de `fusion.ts`). */
export type RegistresDeLEtat = {
  readonly registres: ReadonlyMap<CleTexte, RegistreQuelconque>;
};

// ---- Égalité structurelle et ordre total (DAT v0.11.7 §4.2.1, Q-ST017-STA-4 c)

const comparerTextes = (a: string, b: string): -1 | 0 | 1 => {
  if (a === b) return 0;
  return a < b ? -1 : 1; // unités de code, jamais localeCompare
};

/** Sérialisation canonique : clés triées, propriété `undefined` ≡ absente. Sert à l'égalité et à l'ordre total. */
const canonique = (valeur: unknown): string => {
  if (valeur === undefined) return 'undefined'; // description ou délai absents (JSON.stringify rendrait undefined)
  if (typeof valeur !== 'object' || valeur === null) return JSON.stringify(valeur);
  const entrees = Object.entries(valeur)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => comparerTextes(a, b));
  return `{${entrees.map(([cle, v]) => `${JSON.stringify(cle)}:${canonique(v)}`).join(',')}}`;
};

/** Égalité récursive des objets et des primitives, une propriété `undefined` valant absence (§6.6 n° 2). */
const egalesStructurellement = (a: unknown, b: unknown): boolean => canonique(a) === canonique(b);

const intituleDe = (v: ValeurEcartee): string | undefined =>
  v.motif === 'SUPPRESSION' ? v.intituleElement : undefined;

/** L'entrée qui porte l'intitulé passe avant celle qui n'en porte pas, puis le plus petit intitulé. */
const comparerIntitules = (a: string | undefined, b: string | undefined): number => {
  if (a === undefined || b === undefined) return Number(a === undefined) - Number(b === undefined);
  return comparerTextes(a, b);
};

/** Ordre total (négatif : `a` l'emporte) : gagnant de plus petit HLC, intitulé, sérialisation canonique. */
const comparerEntrees = (a: ValeurEcartee, b: ValeurEcartee): number =>
  comparerHlc(hlcDuGagnant(a), hlcDuGagnant(b)) ||
  comparerIntitules(intituleDe(a), intituleDe(b)) ||
  comparerTextes(canonique(a), canonique(b));

/**
 * Union par identifiant ; pour un même identifiant, l'entrée dont `hlcDuGagnant` est le plus petit ; à égalité,
 * celle qui porte `intituleElement`, puis le plus petit `intituleElement` ; à égalité restante, l'entrée déjà connue
 * si elle est structurellement égale (même référence conservée), sinon la plus petite sérialisation canonique
 * (§6.6, n° 5 ; DAT v0.11.7 §4.2.1, ordre total). Commutative, associative, idempotente.
 */
export const fusionnerValeursEcartees = (
  connues: ReadonlyMap<IdValeurEcartee, ValeurEcartee>,
  nouvelles: Iterable<ValeurEcartee>,
): ReadonlyMap<IdValeurEcartee, ValeurEcartee> => {
  const union = new Map(connues);
  for (const nouvelle of nouvelles) {
    const connue = union.get(nouvelle.id);
    if (connue === undefined || comparerEntrees(nouvelle, connue) < 0)
      union.set(nouvelle.id, nouvelle);
  }
  return union;
};

// ---- Détection (§6.6 n° 2 à 4)

/** Une écriture vue à la fusion ; `deRecu` : présente dans le fichier reçu (même clé, même HLC). */
type Version = { readonly registre: RegistreQuelconque; readonly deRecu: boolean };

const memeEcriture = (a: RegistreQuelconque | undefined, b: RegistreQuelconque): boolean =>
  a !== undefined && comparerHlc(a.ecriture.hlc, b.ecriture.hlc) === 0;

/** Les écritures de `recu`, puis celles de `local` qui en diffèrent (les deux versions d'une clé). */
const versionsDe = (local: RegistresDeLEtat, recu: RegistresDeLEtat): ReadonlyArray<Version> => [
  ...[...recu.registres.values()].map((registre) => ({ registre, deRecu: true })),
  ...[...local.registres]
    .filter(([cle, registre]) => !memeEcriture(recu.registres.get(cle), registre))
    .map(([, registre]) => ({ registre, deRecu: false })),
];

/** n° 2 (RG-036) : W la plus grande, L l'autre ; entrée si W ne connaît pas L et que les valeurs diffèrent. */
const conflitEntre = (
  a: RegistreQuelconque,
  b: RegistreQuelconque,
): ReadonlyArray<ValeurEcartee> => {
  const ordre = comparerHlc(a.ecriture.hlc, b.ecriture.hlc);
  if (ordre === 0 || a.cle.champ === 'suppression') return [];
  const [gagnante, ecartee] = ordre > 0 ? [a, b] : [b, a];
  if (
    estConnue(gagnante.ecriture, ecartee.ecriture) ||
    egalesStructurellement(gagnante.ecriture.valeur, ecartee.ecriture.valeur)
  ) {
    return [];
  }
  const id = idValeurEcartee(ecartee.cle, ecartee.ecriture.hlc);
  return [{ id, motif: 'CONFLIT', ecartee, gagnante }];
};

const conflits = (local: RegistresDeLEtat, recu: RegistresDeLEtat): ReadonlyArray<ValeurEcartee> =>
  [...recu.registres].flatMap(([cle, registre]) => {
    const autre = local.registres.get(cle);
    return autre === undefined ? [] : conflitEntre(autre, registre);
  });

const texteElement = (element: RefElementMetier): string => `${element.type}/${element.id}`;

/** Pierres tombales D₁…Dₙ de chaque élément supprimé, indexées une fois (détection linéaire, DAT §4.2.1). */
const pierresTombales = (
  versions: ReadonlyArray<Version>,
): ReadonlyMap<string, ReadonlyArray<Version>> => {
  const index = new Map<string, ReadonlyArray<Version>>();
  for (const version of versions) {
    if (version.registre.cle.champ !== 'suppression') continue;
    const cle = texteElement(elementDeCle(version.registre.cle));
    index.set(cle, [...(index.get(cle) ?? []), version]);
  }
  return index;
};

/** Éléments dont une suppression peut écarter R : le sien (champ d'objectif ou de tâche) et celui qu'il pointe. */
const elementsConcernes = (registre: RegistreQuelconque): ReadonlyArray<RefElementMetier> => {
  const cible = cibleDe(registre);
  const propre = registre.cle.type === 'LIEN_TACHE_OBJECTIF' ? [] : [elementDeCle(registre.cle)];
  return cible === undefined ? propre : [...propre, cible];
};

const plusGrande = <R extends RegistreQuelconque>(registres: ReadonlyArray<R>): R | undefined =>
  registres.reduce<R | undefined>(
    (max, r) => (max === undefined || comparerHlc(r.ecriture.hlc, max.ecriture.hlc) > 0 ? r : max),
    undefined,
  );

type RegistreIntitule = (Registre<'OBJECTIF', 'intitule'> | Registre<'TACHE', 'intitule'>) &
  RegistreQuelconque;
const estIntitule = (registre: RegistreQuelconque): registre is RegistreIntitule =>
  estRegistre(registre, 'OBJECTIF', 'intitule') || estRegistre(registre, 'TACHE', 'intitule');

/** n° 4 : intitulé de l'élément de R, le plus grand de ceux (local, reçu) que la suppression connaît. */
const intituleConnu = (
  etats: readonly [RegistresDeLEtat, RegistresDeLEtat],
  ecartee: RegistreQuelconque,
  gagnante: RegistreQuelconque,
): string | undefined => {
  const cle = cleEnTexte(cleDeChamp(elementDeCle(ecartee.cle), 'intitule'));
  const connus = etats.flatMap((etat) => {
    const registre = etat.registres.get(cle);
    return registre !== undefined &&
      estIntitule(registre) &&
      estConnue(gagnante.ecriture, registre.ecriture)
      ? [registre]
      : [];
  });
  return plusGrande(connus)?.ecriture.valeur;
};

/** n° 3 : R écartée si aucune pierre tombale ne la connaît, paire examinée si D ou R vient du fichier reçu. */
const ecarteePar = (
  version: Version,
  tombes: ReadonlyArray<Version>,
): RegistreQuelconque | undefined => {
  const examinee = version.deRecu || tombes.some((d) => d.deRecu);
  const connue = tombes.some((d) => estConnue(d.registre.ecriture, version.registre.ecriture));
  return examinee && !connue ? plusGrande(tombes.map((d) => d.registre)) : undefined;
};

const suppressions = (
  local: RegistresDeLEtat,
  recu: RegistresDeLEtat,
): ReadonlyArray<ValeurEcartee> => {
  const versions = versionsDe(local, recu);
  const tombes = pierresTombales(versions);
  return versions.flatMap((version) => {
    const ecartee = version.registre;
    if (ecartee.cle.champ === 'suppression') return [];
    return elementsConcernes(ecartee).flatMap((element): ReadonlyArray<ValeurEcartee> => {
      const gagnante = ecarteePar(version, tombes.get(texteElement(element)) ?? []);
      if (gagnante === undefined) return [];
      const intitule = intituleConnu([local, recu], ecartee, gagnante);
      const id = idValeurEcartee(ecartee.cle, ecartee.ecriture.hlc);
      return [
        {
          id,
          motif: 'SUPPRESSION',
          ecartee,
          gagnante,
          ...(intitule === undefined ? {} : { intituleElement: intitule }),
        },
      ];
    });
  });
};

/**
 * Valeurs écartées constatées en fusionnant `recu` dans `local` (états avant fusion), triées par identifiant
 * (§6.6, n° 1 à 4) : conflits (contexte causal) et écritures écartées par une pierre tombale (H-1). Deux constats de
 * même identifiant (même écriture écartée) sont départagés par l'union (n° 5).
 */
export const detecterValeursEcartees = (
  local: RegistresDeLEtat,
  recu: RegistresDeLEtat,
): ReadonlyArray<ValeurEcartee> => {
  const constats = fusionnerValeursEcartees(new Map(), [
    ...conflits(local, recu),
    ...suppressions(local, recu),
  ]);
  return [...constats.values()].sort((a, b) => comparerTextes(a.id, b.id));
};
