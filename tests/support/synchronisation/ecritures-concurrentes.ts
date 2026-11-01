/**
 * Écritures construites à la main pour les tests de l'incrément 2 d'US-017 (ST-US-017 v0.5 §13.4) : valeurs
 * écartées, pierres tombales étendues (H-1), réparations RG-048. Les contextes causaux sont donnés explicitement.
 */
import type { IdAppareil, IdObjectif, IdTache } from '@src/commun/domaine/identifiants';
import type { ContexteCausal } from '@src/synchronisation/domaine/contexte-causal';
import type { RegistreQuelconque } from '@src/synchronisation/domaine/ecriture';
import type { EvenementJournal } from '@src/synchronisation/domaine/evenement-journal';
import type { EtatFusionnable } from '@src/synchronisation/domaine/fusion';
import type { Hlc } from '@src/synchronisation/domaine/hlc';
import type { IdEvenement } from '@src/synchronisation/domaine/identifiant-evenement';
import {
  idLien,
  type CleTexte,
  type PlacementObjectif,
} from '@src/synchronisation/domaine/information';
import type { Lecture } from '@src/synchronisation/domaine/lectures';
import type { Signalements } from '@src/synchronisation/domaine/signalements';
import type { IdValeurEcartee, ValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import { registre, texteDeCle } from '../fabriques/etat-local';
import { date, hlc, idEvenementTest, idOperation } from '../valeurs';

/** Instants de la journée du 2026-10-21 (UTC) : `t(0)` = 08:00, `t(n)` = 08:00 + n × 10 min. */
export const t = (n: number): string =>
  new Date(Date.UTC(2026, 9, 21, 8, 0, 0) + n * 10 * 60_000).toISOString();
export const h = (n: number, appareil: IdAppareil, compteur = 0): Hlc =>
  hlc(t(n), compteur, appareil);

// ---- Tâches
export const intituleTache = (
  id: IdTache,
  valeur: string,
  ecriture: Hlc,
  contexte: ContexteCausal = {},
): RegistreQuelconque =>
  registre({ type: 'TACHE', id, champ: 'intitule' }, valeur, ecriture, contexte);
export const delaiTache = (
  id: IdTache,
  valeur: string,
  ecriture: Hlc,
  contexte: ContexteCausal = {},
): RegistreQuelconque =>
  registre({ type: 'TACHE', id, champ: 'delai' }, date(valeur), ecriture, contexte);
export const creationTacheRegistre = (
  id: IdTache,
  ecriture: Hlc,
  tacheParenteId?: IdTache,
  contexte: ContexteCausal = {},
): RegistreQuelconque =>
  registre(
    { type: 'TACHE', id, champ: 'creation' },
    {
      creeLe: ecriture.physique,
      ...(tacheParenteId === undefined ? {} : { tacheParenteId }),
    },
    ecriture,
    contexte,
  );
export const suppressionTache = (
  id: IdTache,
  ecriture: Hlc,
  contexte: ContexteCausal = {},
): RegistreQuelconque =>
  registre({ type: 'TACHE', id, champ: 'suppression' }, true, ecriture, contexte);

// ---- Objectifs
export const creationObjectifRegistre = (id: IdObjectif, ecriture: Hlc): RegistreQuelconque =>
  registre({ type: 'OBJECTIF', id, champ: 'creation' }, { creeLe: ecriture.physique }, ecriture);
export const intituleObjectif = (
  id: IdObjectif,
  valeur: string,
  ecriture: Hlc,
  contexte: ContexteCausal = {},
): RegistreQuelconque =>
  registre({ type: 'OBJECTIF', id, champ: 'intitule' }, valeur, ecriture, contexte);
export const suppressionObjectif = (
  id: IdObjectif,
  ecriture: Hlc,
  contexte: ContexteCausal = {},
): RegistreQuelconque =>
  registre({ type: 'OBJECTIF', id, champ: 'suppression' }, true, ecriture, contexte);
export const parentObjectif = (
  id: IdObjectif,
  valeur: PlacementObjectif,
  ecriture: Hlc,
  contexte: ContexteCausal = {},
): RegistreQuelconque =>
  registre({ type: 'OBJECTIF', id, champ: 'parent' }, valeur, ecriture, contexte);
/** Placement d'origine CREATION, objectif principal si `parentId` est absent. */
export const creePrincipal = (hlcOrigine: Hlc): PlacementObjectif => ({
  origine: 'CREATION',
  hlcOrigine,
});
export const deplaceSous = (parentId: IdObjectif, hlcOrigine: Hlc): PlacementObjectif => ({
  parentId,
  origine: 'DEPLACEMENT',
  hlcOrigine,
});
export const creeSous = (parentId: IdObjectif, hlcOrigine: Hlc): PlacementObjectif => ({
  parentId,
  origine: 'CREATION',
  hlcOrigine,
});

/** Les trois registres d'un objectif créé (création, intitulé, placement) par une même écriture. */
export const objectifCree = (
  id: IdObjectif,
  intitule: string,
  ecriture: Hlc,
  placement: PlacementObjectif = creePrincipal(ecriture),
): ReadonlyArray<RegistreQuelconque> => [
  creationObjectifRegistre(id, ecriture),
  intituleObjectif(id, intitule, ecriture),
  parentObjectif(id, placement, ecriture),
];

let numeroOperation = 900;
/** Entrée CHANGEMENT_PARENT du journal, de HLC `ecriture` (celui du déplacement, RG-050). */
export const changementParent = (
  id: IdObjectif,
  avant: PlacementObjectif,
  apres: PlacementObjectif,
  ecriture: Hlc,
): EvenementJournal => {
  numeroOperation += 1;
  return {
    type: 'CHANGEMENT_PARENT',
    element: { type: 'OBJECTIF', id },
    avant,
    apres,
    id: idEvenementTest(idOperation(numeroOperation), 0),
    hlc: ecriture,
    instant: ecriture.physique,
    jour: date('2026-10-21'),
  };
};

// ---- Liens (H-1)
export const lien = (
  tacheId: IdTache,
  objectifId: IdObjectif,
  actif: boolean,
  ecriture: Hlc,
  contexte: ContexteCausal = {},
): RegistreQuelconque =>
  registre(
    { type: 'LIEN_TACHE_OBJECTIF', id: idLien(tacheId, objectifId), champ: 'actif' },
    actif,
    ecriture,
    contexte,
  );

// ---- États
export const etatFusionnable = (
  registres: ReadonlyArray<RegistreQuelconque>,
  journal: ReadonlyArray<EvenementJournal> = [],
): EtatFusionnable => ({
  registres: new Map<CleTexte, RegistreQuelconque>(registres.map((r) => [texteDeCle(r.cle), r])),
  journal: new Map<IdEvenement, EvenementJournal>(journal.map((e) => [e.id, e])),
});

export const signalements = (
  valeurs: ReadonlyArray<ValeurEcartee> = [],
  lectures: ReadonlyArray<Lecture> = [],
): Signalements => ({
  valeursEcartees: new Map(valeurs.map((v) => [v.id, v])),
  lectures: new Map(lectures.map((l) => [l.id, l])),
});

/** Identifiant arbitraire (entrées construites à la main, sans calcul de condensat). */
export const idArbitraire = (n: number): IdValeurEcartee =>
  `v${String(n).padStart(51, '0')}` as IdValeurEcartee;

/** Tri par identifiant (ordre rendu par detecterValeursEcartees). */
export const parIdentifiant = (
  valeurs: ReadonlyArray<ValeurEcartee>,
): ReadonlyArray<ValeurEcartee> =>
  [...valeurs].sort((a, b) => {
    if (a.id === b.id) return 0;
    return a.id < b.id ? -1 : 1;
  });
