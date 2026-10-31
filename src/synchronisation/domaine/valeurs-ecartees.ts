import { nonImplemente } from '@non-implemente';
import type { Marque } from '../../commun/domaine/marque';
import type { RegistreQuelconque } from './ecriture';
import type { Hlc } from './hlc';
import type { CleInformation, CleTexte } from './information';

// ST-US-017 v0.5 §4.6, §6.6 ; DAT §4.2.1 (critère du contexte causal, pierre tombale étendue H-1, signalement unique).

/** base32hex(SHA-256(UTF-8 de `${type}|${id}|${champ}|${appareil}|${physique}|${compteur}`)), 52 caractères. */
export type IdValeurEcartee = Marque<string, 'IdValeurEcartee'>;

/**
 * Identifiant déterministe d'une valeur écartée : information écartée et HLC de l'écriture écartée (DAT §4.2.1) ; pour
 * un placement annulé, HLC du déplacement annulé (`hlcOrigine`, DAT §4.2). `physique` en millisecondes entières.
 */
export const idValeurEcartee = (cle: CleInformation, hlcEcarte: Hlc): IdValeurEcartee =>
  nonImplemente(`idValeurEcartee ${cle.type}/${cle.champ} ${String(hlcEcarte.compteur)}`);

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

/**
 * Valeurs écartées constatées en fusionnant `recu` dans `local` (états avant fusion), triées par identifiant
 * (§6.6, n° 1 à 4) : conflits (contexte causal) et écritures écartées par une pierre tombale (H-1).
 */
export const detecterValeursEcartees = (
  local: RegistresDeLEtat,
  recu: RegistresDeLEtat,
): ReadonlyArray<ValeurEcartee> =>
  nonImplemente(`detecterValeursEcartees (${String(local.registres.size + recu.registres.size)})`);

/**
 * Union par identifiant ; pour un même identifiant, l'entrée dont `hlcDuGagnant` est le plus petit ; à égalité,
 * celle qui porte `intituleElement`, puis le plus petit `intituleElement` (§6.6, n° 5). Commutative, associative,
 * idempotente.
 */
export const fusionnerValeursEcartees = (
  connues: ReadonlyMap<IdValeurEcartee, ValeurEcartee>,
  nouvelles: Iterable<ValeurEcartee>,
): ReadonlyMap<IdValeurEcartee, ValeurEcartee> =>
  nonImplemente(`fusionnerValeursEcartees (${String(connues.size)}, ${typeof nouvelles})`);
