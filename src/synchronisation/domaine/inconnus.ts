import type { ContexteCausal } from './contexte-causal';
import { comparerHlc, maxHlc, type Hlc } from './hlc';

// ST-US-017 v0.11 §6.8 n° 12 à 15 (rang 11) ; RG-058 ; ANT-19 ; DAT §4.2 (« Champs inconnus ») ; conventions §10.3 :
// éléments de même `schemaVersion` écrits par une version plus récente de l'application, que celle-ci ne sait pas
// interpréter. Ils sont conservés tels quels avec leur HLC, fusionnés comme les autres, et réécrits dans le fichier
// de l'appareil. Ils ne sont jamais projetés (aucun effet métier) ni signalés (aucune valeur écartée).

/**
 * Registre dont le type d'élément, ou le champ pour un type connu, est inconnu de cette version. `valeur` est le JSON
 * lu, gardé tel quel (aucune conversion ; un indice d'appareil qu'il contiendrait n'est pas traduit, hypothèse H-11).
 * `contexte` : contexte causal traduit en `appareilId` (absent s'il est vide).
 */
export type RegistreInconnu = {
  readonly type: string;
  readonly id: string;
  readonly champ: string;
  readonly valeur: unknown;
  readonly hlc: Hlc;
  readonly contexte?: ContexteCausal;
};

/**
 * Entrée de journal d'un type inconnu, porteuse d'un `id` (texte non vide) et d'un `hlc` valides. `brut` : l'entrée lue
 * sans ses clés `id` et `hlc`, gardée telle quelle (aucune traduction d'indice, hypothèse H-11).
 */
export type EvenementInconnu = {
  readonly id: string;
  readonly hlc: Hlc;
  readonly brut: Readonly<Record<string, unknown>>;
};

export type Inconnus = {
  /** Triés par `cleInconnue` (ordre des unités de code), une entrée par clé. */
  readonly registres: ReadonlyArray<RegistreInconnu>;
  /** Triés par `id`, une entrée par identifiant. */
  readonly evenements: ReadonlyArray<EvenementInconnu>;
};

export const INCONNUS_VIDES: Inconnus = { registres: [], evenements: [] };

/** « type:id:champ » : clé d'un registre inconnu (table Dexie `registresInconnus`). */
export const cleInconnue = (r: Pick<RegistreInconnu, 'type' | 'id' | 'champ'>): string =>
  `${r.type}:${r.id}:${r.champ}`;

export const sontVides = (i: Inconnus): boolean =>
  i.registres.length === 0 && i.evenements.length === 0;

/** Ordre des unités de code (n° 12), comme `trierParIdentifiant` du dépôt. */
const comparerTextes = (a: string, b: string): number => Number(a > b) - Number(a < b);

const trier = (
  registres: Iterable<RegistreInconnu>,
  evenements: Iterable<EvenementInconnu>,
): Inconnus => ({
  registres: [...registres].sort((a, b) => comparerTextes(cleInconnue(a), cleInconnue(b))),
  evenements: [...evenements].sort((a, b) => comparerTextes(a.id, b.id)),
});

/**
 * n° 13 : par clé, le registre de plus grand HLC (`comparerHlc` ; à égalité, celui de `a`) ; événements : union par
 * identifiant (à identifiant égal, celui de `a`). Résultat trié (n° 12). Commutative et associative au sens des
 * ensembles de clés et des HLC retenus, idempotente.
 */
export const fusionnerInconnus = (a: Inconnus, b: Inconnus): Inconnus => {
  const registres = new Map(a.registres.map((r) => [cleInconnue(r), r]));
  for (const r of b.registres) {
    const cle = cleInconnue(r);
    const actuel = registres.get(cle);
    if (actuel === undefined || comparerHlc(r.hlc, actuel.hlc) > 0) registres.set(cle, r);
  }
  const evenements = new Map(a.evenements.map((e) => [e.id, e]));
  for (const e of b.evenements) if (!evenements.has(e.id)) evenements.set(e.id, e);
  return trier(registres.values(), evenements.values());
};

/**
 * n° 14 : ce qu'une fusion de `recus` dans `locaux` doit écrire : registres reçus dont la clé est absente localement
 * ou dont le HLC est strictement plus grand ; événements reçus d'identifiant absent localement. Triés (n° 12).
 */
export const inconnusAEcrire = (locaux: Inconnus, recus: Inconnus): Inconnus => {
  const registresLocaux = new Map(locaux.registres.map((r) => [cleInconnue(r), r]));
  const evenementsLocaux = new Set(locaux.evenements.map((e) => e.id));
  // Fusion préalable des reçus : une clé (ou un identifiant) répétée dans `recus` n'est écrite qu'une fois.
  const fusionRecus = fusionnerInconnus(INCONNUS_VIDES, recus);
  return trier(
    fusionRecus.registres.filter((r) => {
      const local = registresLocaux.get(cleInconnue(r));
      return local === undefined || comparerHlc(r.hlc, local.hlc) > 0;
    }),
    fusionRecus.evenements.filter((e) => !evenementsLocaux.has(e.id)),
  );
};

/** n° 15 : plus grand HLC des registres et des événements (réception, DAT §6.4) ; undefined si vides. */
export const hlcMaxInconnus = (i: Inconnus): Hlc | undefined =>
  [...i.registres, ...i.evenements].reduce<Hlc | undefined>(
    (max, { hlc }) => (max === undefined ? hlc : maxHlc(max, hlc)),
    undefined,
  );
