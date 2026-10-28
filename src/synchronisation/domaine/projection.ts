import type { IdObjectif, IdTache } from '../../commun/domaine/identifiants';
import { estRegistre, type RegistreQuelconque } from './ecriture';
import { registreDe, type EtatLocal } from './etat-local';
import type { EtatMetier, ObjectifEnregistre, TacheEnregistree } from './etat-metier';
import { comparerHlc } from './hlc';
import { elementsEnAttente } from './index-en-attente';
import { partiesDuLien, type ChampDe, type ValeursParChamp } from './information';

// ST-socle-ecriture.md §6.6.

type Lecture = {
  readonly etat: EtatLocal;
  readonly enAttente: ReadonlySet<string>;
  readonly liens: ReadonlyMap<string, ReadonlyArray<IdObjectif>>;
};

const lireObjectif = <C extends ChampDe<'OBJECTIF'>>(
  etat: EtatLocal,
  id: IdObjectif,
  champ: C,
): ValeursParChamp['OBJECTIF'][C] | undefined => {
  const registre = registreDe(etat, { type: 'OBJECTIF', id }, champ);
  return registre !== undefined && estRegistre(registre, 'OBJECTIF', champ)
    ? registre.ecriture.valeur
    : undefined;
};

const lireTache = <C extends ChampDe<'TACHE'>>(
  etat: EtatLocal,
  id: IdTache,
  champ: C,
): ValeursParChamp['TACHE'][C] | undefined => {
  const registre = registreDe(etat, { type: 'TACHE', id }, champ);
  return registre !== undefined && estRegistre(registre, 'TACHE', champ)
    ? registre.ecriture.valeur
    : undefined;
};

const projeterObjectif = (
  { etat, enAttente }: Lecture,
  id: IdObjectif,
): ObjectifEnregistre | undefined => {
  const creation = lireObjectif(etat, id, 'creation');
  const intitule = lireObjectif(etat, id, 'intitule');
  if (creation === undefined || intitule === undefined) return undefined;
  const description = lireObjectif(etat, id, 'description');
  const delai = lireObjectif(etat, id, 'delai');
  const parentId = lireObjectif(etat, id, 'parent')?.parentId;
  return {
    id,
    intitule,
    ...(description === undefined ? {} : { description }),
    ...(delai === undefined ? {} : { delai }),
    ...(parentId === undefined ? {} : { parentIdEnregistre: parentId }),
    creeLe: creation.creeLe,
    supprime: lireObjectif(etat, id, 'suppression') !== undefined,
    enAttente: enAttente.has(id),
  };
};

const projeterTache = (
  { etat, enAttente, liens }: Lecture,
  id: IdTache,
): TacheEnregistree | undefined => {
  const creation = lireTache(etat, id, 'creation');
  const intitule = lireTache(etat, id, 'intitule');
  const delai = lireTache(etat, id, 'delai');
  const estimationInitiale = lireTache(etat, id, 'estimationInitiale');
  const cycleDeVie = lireTache(etat, id, 'cycleDeVie');
  if (
    creation === undefined ||
    intitule === undefined ||
    delai === undefined ||
    estimationInitiale === undefined ||
    cycleDeVie === undefined
  ) {
    return undefined;
  }
  return {
    id,
    intitule,
    delai,
    estimationInitiale,
    cycleDeVie,
    ...(creation.tacheParenteId === undefined ? {} : { tacheParenteId: creation.tacheParenteId }),
    objectifIdsActifs: liens.get(id) ?? [],
    creeLe: creation.creeLe,
    supprime: lireTache(etat, id, 'suppression') !== undefined,
    enAttente: enAttente.has(id),
  };
};

/** Objectifs liés activement à chaque tâche, par HLC croissant de l'écriture du lien (ordre de rattachement). */
const liensActifsParTache = (etat: EtatLocal): ReadonlyMap<string, ReadonlyArray<IdObjectif>> => {
  const actifs = [...etat.registres.values()]
    .flatMap((r) =>
      estRegistre(r, 'LIEN_TACHE_OBJECTIF', 'actif') && r.ecriture.valeur ? [r] : [],
    )
    .sort((a, b) => comparerHlc(a.ecriture.hlc, b.ecriture.hlc));
  return actifs.reduce((parTache, registre) => {
    const { tacheId, objectifId } = partiesDuLien(registre.cle.id);
    return new Map(parTache).set(tacheId, [...(parTache.get(tacheId) ?? []), objectifId]);
  }, new Map<string, ReadonlyArray<IdObjectif>>());
};

const idsDes = (etat: EtatLocal, type: 'OBJECTIF' | 'TACHE'): ReadonlyArray<string> =>
  [...etat.registres.values()]
    .filter((r) => r.cle.type === type && r.cle.champ === 'creation')
    .map((r) => r.cle.id);

const projeterTous = <I extends string, E>(
  ids: ReadonlyArray<string>,
  projeter: (id: I) => E | undefined,
): ReadonlyMap<I, E> =>
  new Map(
    ids.flatMap((id) => {
      const element = projeter(id as I);
      return element === undefined ? [] : [[id as I, element] as const];
    }),
  );

export const projeterEtatMetier = (etat: EtatLocal): EtatMetier => {
  const lecture: Lecture = {
    etat,
    enAttente: elementsEnAttente(etat.enAttente),
    liens: liensActifsParTache(etat),
  };
  return {
    objectifs: projeterTous<IdObjectif, ObjectifEnregistre>(idsDes(etat, 'OBJECTIF'), (id) =>
      projeterObjectif(lecture, id),
    ),
    taches: projeterTous<IdTache, TacheEnregistree>(idsDes(etat, 'TACHE'), (id) =>
      projeterTache(lecture, id),
    ),
  };
};
