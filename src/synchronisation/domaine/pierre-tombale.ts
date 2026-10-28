import type { IdAppareil } from '../../commun/domaine/identifiants';
import {
  CONTEXTE_VIDE,
  ajouterAuContexte,
  fusionnerContextes,
  retirerAppareil,
  type ContexteCausal,
} from './contexte-causal';
import { estRegistre, type RegistreQuelconque } from './ecriture';
import { registreDe, type EtatLocal } from './etat-local';
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

/** Registres qui pointent vers l'élément : liens et placements d'un objectif, création des sous-tâches d'une tâche. */
const estRattacheA = (registre: RegistreQuelconque, element: RefElementMetier): boolean => {
  if (element.type === 'OBJECTIF') {
    if (registre.cle.type === 'LIEN_TACHE_OBJECTIF') {
      return partiesDuLien(registre.cle.id).objectifId === element.id;
    }
    return (
      estRegistre(registre, 'OBJECTIF', 'parent') &&
      registre.ecriture.valeur.parentId === element.id
    );
  }
  return (
    estRegistre(registre, 'TACHE', 'creation') &&
    registre.ecriture.valeur.tacheParenteId === element.id
  );
};

const registresRattachesA = (
  etat: EtatLocal,
  element: RefElementMetier,
): ReadonlyArray<RegistreQuelconque> =>
  [...etat.registres.values()].filter((registre) => estRattacheA(registre, element));

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
