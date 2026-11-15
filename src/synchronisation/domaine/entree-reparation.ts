import type { IdObjectif } from '../../commun/domaine/identifiants';
import { jourDeReference } from '../../commun/domaine/temps/jour-de-reference';
import type { EvenementJournal } from './evenement-journal';
import { comparerHlc, type Hlc } from './hlc';
import { FORME_ID_EVENEMENT_REPARATION, type IdEvenement } from './identifiant-evenement';
import type { PlacementObjectif } from './information';
import { idValeurEcartee } from './valeurs-ecartees';

// ST-US-017 v0.6 §6.6 n° 9 b à 9 d ; RG-048, RG-050 ; US-023 CA-11 et S18d ; glossaire d'étapes v1.12 §11 ;
// DAT §6.1 « Entrées produites par la fusion » (identifiant déterministe, encodage base32hex sans « : »).

/**
 * Identifiant de l'entrée « changement parent » écrite pour l'annulation du déplacement de `objectif` de HLC
 * `hlcAnnule` : **le même texte** que l'identifiant du signalement `PLACEMENT_ANNULE` correspondant, soit
 * `idValeurEcartee({ type: 'OBJECTIF', id: objectif, champ: 'parent' }, hlcAnnule)` (52 caractères `[0-9a-v]`).
 * Identique sur tous les appareils ; ne contient jamais « : » (aucune collision avec `${operation}:${rang}`).
 */
export const idEvenementDeReparation = (objectif: IdObjectif, hlcAnnule: Hlc): IdEvenement =>
  String(
    idValeurEcartee({ type: 'OBJECTIF', id: objectif, champ: 'parent' }, hlcAnnule),
  ) as IdEvenement;

/**
 * Vrai si et seulement si `id` a la forme d'un identifiant d'entrée de réparation : `FORME_ID_EVENEMENT_REPARATION`
 * (`/^[0-9a-v]{52}$/`), constante exportée par `identifiant-evenement.ts` en tranche B1b (§3.4 I2-24).
 */
export const estIdEvenementDeReparation = (id: IdEvenement): boolean =>
  FORME_ID_EVENEMENT_REPARATION.test(id);

/** Entrée « changement parent » d'un cas d'usage (identifiant `${operation}:${rang}`), seule source d'une valeur rétablie. */
export type EntreeDeDeplacement = Extract<EvenementJournal, { type: 'CHANGEMENT_PARENT' }>;

/**
 * Vrai pour une entrée `CHANGEMENT_PARENT` écrite par un cas d'usage ; faux pour une entrée de réparation, qui porte
 * le même élément et le même HLC que le déplacement qu'elle annule (§6.6 n° 8 ; condition C1 de Starck : le journal
 * ne sert qu'à retrouver l'entrée du déplacement, jamais à déduire un placement).
 */
export const estEntreeDeDeplacement = (e: EvenementJournal): e is EntreeDeDeplacement =>
  e.type === 'CHANGEMENT_PARENT' && !estIdEvenementDeReparation(e.id);

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
  composerEntreeDeReparation(
    annulation,
    [...journal.values()].find(
      (e) =>
        estEntreeDeDeplacement(e) &&
        e.element.id === annulation.objectif &&
        comparerHlc(e.hlc, annulation.annule.hlcOrigine) === 0,
    ),
  );

/** Placement réduit aux champs du journal (`parentId` omis pour un principal) ; aussi la valeur rétablie (n° 8). */
export const placementJournal = ({
  parentId,
  origine,
  hlcOrigine,
}: PlacementObjectif): PlacementObjectif => ({
  ...(parentId === undefined ? {} : { parentId }),
  origine,
  hlcOrigine,
});

/**
 * Entrée de l'annulation, `deplacement` étant l'entrée du déplacement annulé déjà trouvée (`undefined` si elle est
 * absente : `instant` = physique du HLC annulé, `jour` = journée de Paris de cet instant). Utilisée par la boucle de
 * réparation, qui dispose d'un index du journal ; `entreeDeReparation` en est la forme exposée.
 */
export const composerEntreeDeReparation = (
  { objectif, annule, retabli }: Annulation,
  deplacement: EvenementJournal | undefined,
): EvenementJournal => {
  const instant = deplacement?.instant ?? annule.hlcOrigine.physique;
  return {
    id: idEvenementDeReparation(objectif, annule.hlcOrigine),
    type: 'CHANGEMENT_PARENT',
    element: { type: 'OBJECTIF', id: objectif },
    avant: placementJournal(annule),
    apres: placementJournal(retabli),
    hlc: annule.hlcOrigine,
    instant,
    jour: deplacement?.jour ?? jourDeReference(instant),
  };
};
