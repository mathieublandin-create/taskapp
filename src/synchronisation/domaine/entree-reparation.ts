import { nonImplemente } from '@non-implemente';
import type { IdObjectif } from '../../commun/domaine/identifiants';
import type { EvenementJournal } from './evenement-journal';
import type { Hlc } from './hlc';
import type { IdEvenement } from './identifiant-evenement';
import type { PlacementObjectif } from './information';

// ST-US-017 v0.6 §6.6 n° 9 b à 9 d ; RG-048, RG-050 ; US-023 CA-11 et S18d ; glossaire d'étapes v1.12 §11 ;
// DAT §6.1 « Entrées produites par la fusion » (identifiant déterministe, encodage base32hex sans « : »).

/**
 * Identifiant de l'entrée « changement parent » écrite pour l'annulation du déplacement de `objectif` de HLC
 * `hlcAnnule` : **le même texte** que l'identifiant du signalement `PLACEMENT_ANNULE` correspondant, soit
 * `idValeurEcartee({ type: 'OBJECTIF', id: objectif, champ: 'parent' }, hlcAnnule)` (52 caractères `[0-9a-v]`).
 * Identique sur tous les appareils ; ne contient jamais « : » (aucune collision avec `${operation}:${rang}`).
 */
export const idEvenementDeReparation = (objectif: IdObjectif, hlcAnnule: Hlc): IdEvenement =>
  nonImplemente(`idEvenementDeReparation (${objectif}, ${String(hlcAnnule.compteur)})`);

/**
 * Vrai si et seulement si `id` a la forme d'un identifiant d'entrée de réparation : `FORME_ID_EVENEMENT_REPARATION`
 * (`/^[0-9a-v]{52}$/`), constante exportée par `identifiant-evenement.ts` en tranche B1b (§3.4 I2-24).
 */
export const estIdEvenementDeReparation = (id: IdEvenement): boolean =>
  nonImplemente(`estIdEvenementDeReparation (${id})`);

/** Ce que la boucle de réparation sait d'une annulation (§6.6 n° 8). */
export type Annulation = {
  readonly objectif: IdObjectif;
  /** Placement courant annulé (origine `DEPLACEMENT`, `hlcOrigine` = HLC du déplacement annulé). */
  readonly annule: PlacementObjectif;
  /** Valeur rétablie par cette annulation (n° 8), avant toute annulation suivante. */
  readonly retabli: PlacementObjectif;
};

/**
 * Entrée de journal de l'annulation (§6.6 n° 9 b) : `CHANGEMENT_PARENT` de `objectif`, `avant` = `annule`,
 * `apres` = `retabli`, `hlc` = `annule.hlcOrigine`, `instant` et `jour` de l'entrée du déplacement annulé trouvée dans
 * `journal` (n° 8 : même élément, même HLC, identifiant de cas d'usage) ; à défaut, `instant` = physique de ce HLC et
 * `jour` = `jourDeReference(instant)`. Pas de `cause`. Fonction pure : même résultat sur tous les appareils.
 */
export const entreeDeReparation = (
  journal: ReadonlyMap<IdEvenement, EvenementJournal>,
  annulation: Annulation,
): EvenementJournal =>
  nonImplemente(`entreeDeReparation (${String(journal.size)}, ${annulation.objectif})`);
