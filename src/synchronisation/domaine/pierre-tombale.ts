import type { IdAppareil } from '../../commun/domaine/identifiants';
import {
  CONTEXTE_VIDE,
  ajouterAuContexte,
  contextesEgaux,
  fusionnerContextes,
  retirerAppareil,
  type ContexteCausal,
} from './contexte-causal';
import { estRegistre, type RegistreQuelconque } from './ecriture';
import { registreDe, type EtatLocal } from './etat-local';
import { comparerHlc } from './hlc';
import { partiesDuLien, type RefElementMetier } from './information';

// DAT §4.2.1 v0.10.1, H-1 (ST-socle-ecriture.md §6.4).

const CHAMPS_ELEMENT: Readonly<Record<RefElementMetier['type'], ReadonlyArray<string>>> = {
  OBJECTIF: ['creation', 'intitule', 'description', 'delai', 'parent', 'suppression'],
  TACHE: ['creation', 'intitule', 'delai', 'estimationInitiale', 'cycleDeVie', 'suppression'],
};

const registresDeElement = (
  etat: EtatLocal,
  element: RefElementMetier,
): ReadonlyArray<RegistreQuelconque> =>
  CHAMPS_ELEMENT[element.type].flatMap((champ) => registreDe(etat, element, champ) ?? []);

/**
 * Élément vers lequel pointe le registre (H-1) : objectif d'un lien (quel que soit `actif`), parent d'un placement,
 * tâche parente d'une création de sous-tâche ; undefined sinon. Seule définition de « pointer vers » (ST-US-017 §6.6 n° 3).
 */
export const cibleDe = (registre: RegistreQuelconque): RefElementMetier | undefined => {
  if (registre.cle.type === 'LIEN_TACHE_OBJECTIF') {
    return { type: 'OBJECTIF', id: partiesDuLien(registre.cle.id).objectifId };
  }
  if (estRegistre(registre, 'OBJECTIF', 'parent')) {
    const { parentId } = registre.ecriture.valeur;
    return parentId === undefined ? undefined : { type: 'OBJECTIF', id: parentId };
  }
  if (estRegistre(registre, 'TACHE', 'creation')) {
    const { tacheParenteId } = registre.ecriture.valeur;
    return tacheParenteId === undefined ? undefined : { type: 'TACHE', id: tacheParenteId };
  }
  return undefined;
};

/** Registres qui pointent vers l'élément : liens et placements d'un objectif, création des sous-tâches d'une tâche. */
export const pointeVers = (registre: RegistreQuelconque, element: RefElementMetier): boolean => {
  const cible = cibleDe(registre);
  return cible?.type === element.type && cible.id === element.id;
};

const registresRattachesA = (
  etat: EtatLocal,
  element: RefElementMetier,
): ReadonlyArray<RegistreQuelconque> =>
  [...etat.registres.values()].filter((registre) => pointeVers(registre, element));

export const contexteDePierreTombale = (
  etat: EtatLocal,
  element: RefElementMetier,
  auteur: IdAppareil,
): ContexteCausal => {
  const couverts = [...registresDeElement(etat, element), ...registresRattachesA(etat, element)];
  const fusion = couverts.reduce(
    (contexte, { ecriture }) =>
      fusionnerContextes(contexte, ajouterAuContexte(ecriture.contexte, ecriture.hlc)),
    CONTEXTE_VIDE,
  );
  return retirerAppareil(fusion, auteur);
};

/**
 * Jointure de deux pierres tombales de même clé (ST-US-017 v0.8 §6.6 n° 3 b ; DAT v0.11.9 §4.2.1) : valeur et HLC de
 * la plus récente g, contexte J = max(Ĉ(a), Ĉ(b)) privé de l'auteur de g. Rend `a`, sinon `b`, s'il a déjà ce HLC et ce
 * contexte (référence conservée : rien à écrire), sinon un nouveau registre. Précondition des appelants : même clé de
 * champ `suppression`. Commutative (à l'égalité structurelle près), associative, idempotente ; ne crée aucun HLC.
 */
export const joindrePierresTombales = (
  a: RegistreQuelconque,
  b: RegistreQuelconque,
): RegistreQuelconque => {
  const g = comparerHlc(a.ecriture.hlc, b.ecriture.hlc) >= 0 ? a : b;
  const joint = retirerAppareil(
    fusionnerContextes(
      ajouterAuContexte(a.ecriture.contexte, a.ecriture.hlc),
      ajouterAuContexte(b.ecriture.contexte, b.ecriture.hlc),
    ),
    g.ecriture.hlc.appareil,
  );
  const conservee = [a, b].find(
    (r) =>
      comparerHlc(r.ecriture.hlc, g.ecriture.hlc) === 0 &&
      contextesEgaux(r.ecriture.contexte, joint),
  );
  // Même clé et même valeur que g, seul le contexte change (même conversion que planifier-ecritures.ts).
  return (
    conservee ??
    ({ cle: g.cle, ecriture: { ...g.ecriture, contexte: joint } } as RegistreQuelconque)
  );
};

/** Objectif : aucun ; tâche : ses sous-tâches non supprimées (§6.5). */
export const descendantsSupprimesParDerivation = (
  etat: EtatLocal,
  element: RefElementMetier,
): ReadonlyArray<RefElementMetier> => {
  if (element.type === 'OBJECTIF') return [];
  return registresRattachesA(etat, element).flatMap((registre) => {
    if (registre.cle.type !== 'TACHE') return [];
    const sousTache: RefElementMetier = { type: 'TACHE', id: registre.cle.id };
    return registreDe(etat, sousTache, 'suppression') === undefined ? [sousTache] : [];
  });
};
