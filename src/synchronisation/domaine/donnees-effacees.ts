import { nonImplemente } from '@non-implemente';
import type { EtatLocal } from './etat-local';
import type { Hlc } from './hlc';
import type { MetaSynchronisation, PlanSynchronisation } from './meta-synchronisation';
import type { ValeurEcartee } from './valeurs-ecartees';

// ST-US-017 v0.10 §6.7 n° 10, n° 11 ; RG-044 b, RG-056 ; DAT §4.2 (« Génération des données ») ; guide §6.6.9
// (ALR-008, ALR-014).

export type ValeurDonneesEffacees = Extract<ValeurEcartee, { readonly motif: 'DONNEES_EFFACEES' }>;

/**
 * Modifications perdues par un changement de génération (n° 10) : pour chaque entrée de `etat.enAttente`, triées par
 * clé de texte, l'entrée `DONNEES_EFFACEES` du registre de cette clé **si** ce registre existe, porte le HLC
 * `derniereHlc` de l'entrée (sinon une fusion l'a déjà remplacé : rien), n'est pas de champ `suppression`, et que son
 * élément n'a pas de registre `suppression`. `id` = `idValeurEcartee(cle, hlc du registre)` ; `ecartee` = ce registre ;
 * `generation` = `generation` ; `intituleElement` = valeur du registre `intitule` de l'élément de la clé (élément
 * d'un lien : la tâche), omis s'il n'existe pas.
 * v0.10.1, condition C9 de Starck : si `posterieuresA` est défini (achèvement par son auteur d'un « Repartir de zéro »
 * interrompu, `posterieuresA` = HLC de la génération), seules les entrées dont `derniereHlc` lui est **strictement**
 * postérieur (`comparerHlc > 0`) sont retenues : les écritures antérieures ont été perdues en connaissance de cause
 * (`CNF-REPARTIR-ZERO`).
 */
export const valeursDonneesEffacees = (
  etat: EtatLocal,
  generation: Hlc,
  posterieuresA?: Hlc,
): ReadonlyArray<ValeurDonneesEffacees> =>
  nonImplemente(
    `valeursDonneesEffacees (${String(etat.enAttente.size)}, ${String(generation.compteur)}, ${String(posterieuresA?.compteur)})`,
  );

/**
 * Plan de réinitialisation de l'espace (n° 11) : `reinitialiser: true` ; `plan.etatApres` = état vide du même
 * `appareilId`, `version` et `correctionHorloge` de `etat`, `dernierHlc` = maximum de `etat.dernierHlc` et de
 * `p.dernierHlc` ; tableaux du plan vides ; `meta` = `p.meta` (remplace la méta, §4.7) ; `signalements` =
 * `{ valeursEcartees: p.valeurs, lectures: [] }`.
 */
export const planReinitialisation = (
  etat: EtatLocal,
  p: {
    readonly meta: Partial<MetaSynchronisation>;
    readonly valeurs: ReadonlyArray<ValeurEcartee>;
    readonly dernierHlc?: Hlc;
  },
): PlanSynchronisation =>
  nonImplemente(`planReinitialisation (${etat.appareilId}, ${String(p.valeurs.length)})`);
