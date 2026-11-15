import type { IdObjectif, IdTache } from '../../commun/domaine/identifiants';
import { estRegistre, type RegistreQuelconque } from './ecriture';
import type { EtatLocal } from './etat-local';
import type { EtatMetier, ObjectifEnregistre, TacheEnregistree } from './etat-metier';
import { comparerHlc } from './hlc';
import { elementsEnAttente } from './index-en-attente';
import { partiesDuLien, type ChampDe, type ValeursParChamp } from './information';

// ST-socle-ecriture.md §6.6. Une seule passe sur les registres : ils sont regroupés par élément, puis lus par champ.

type ChampsDeLElement = ReadonlyMap<string, RegistreQuelconque>;
type ChampsParElement = ReadonlyMap<string, ChampsDeLElement>;

type Lecture = {
  readonly enAttente: ReadonlySet<string>;
  readonly liens: ReadonlyMap<string, ReadonlyArray<IdObjectif>>;
};

/** Registres d'un type d'élément, regroupés par identifiant puis par champ. */
const grouperParElement = (etat: EtatLocal, type: 'OBJECTIF' | 'TACHE'): ChampsParElement => {
  const groupes = new Map<string, Map<string, RegistreQuelconque>>();
  for (const registre of etat.registres.values()) {
    if (registre.cle.type !== type) continue;
    const groupe = groupes.get(registre.cle.id) ?? new Map<string, RegistreQuelconque>();
    groupes.set(registre.cle.id, groupe.set(registre.cle.champ, registre));
  }
  return groupes;
};

const valeurDe = <T extends 'OBJECTIF' | 'TACHE', C extends ChampDe<T>>(
  champs: ChampsDeLElement,
  type: T,
  champ: C,
): ValeursParChamp[T][C] | undefined => {
  const registre = champs.get(champ);
  return registre !== undefined && estRegistre(registre, type, champ)
    ? registre.ecriture.valeur
    : undefined;
};

const projeterObjectif = (
  { enAttente }: Lecture,
  id: IdObjectif,
  champs: ChampsDeLElement,
): ObjectifEnregistre | undefined => {
  const creation = valeurDe(champs, 'OBJECTIF', 'creation');
  const intitule = valeurDe(champs, 'OBJECTIF', 'intitule');
  if (creation === undefined || intitule === undefined) return undefined;
  const description = valeurDe(champs, 'OBJECTIF', 'description');
  const delai = valeurDe(champs, 'OBJECTIF', 'delai');
  const parentId = valeurDe(champs, 'OBJECTIF', 'parent')?.parentId;
  return {
    id,
    intitule,
    ...(description === undefined ? {} : { description }),
    ...(delai === undefined ? {} : { delai }),
    ...(parentId === undefined ? {} : { parentIdEnregistre: parentId }),
    creeLe: creation.creeLe,
    supprime: champs.has('suppression'),
    enAttente: enAttente.has(id),
  };
};

/** Valeurs des champs obligatoires d'une tâche ; undefined si l'un d'eux manque (incohérence ignorée). */
const champsObligatoires = (champs: ChampsDeLElement) => {
  const creation = valeurDe(champs, 'TACHE', 'creation');
  const intitule = valeurDe(champs, 'TACHE', 'intitule');
  const delai = valeurDe(champs, 'TACHE', 'delai');
  const estimationInitiale = valeurDe(champs, 'TACHE', 'estimationInitiale');
  const cycleDeVie = valeurDe(champs, 'TACHE', 'cycleDeVie');
  if (
    creation === undefined ||
    intitule === undefined ||
    delai === undefined ||
    estimationInitiale === undefined ||
    cycleDeVie === undefined
  ) {
    return undefined;
  }
  return { creation, intitule, delai, estimationInitiale, cycleDeVie };
};

const projeterTache = (
  { enAttente, liens }: Lecture,
  id: IdTache,
  champs: ChampsDeLElement,
): TacheEnregistree | undefined => {
  const obligatoires = champsObligatoires(champs);
  if (obligatoires === undefined) return undefined;
  const { creation, intitule, delai, estimationInitiale, cycleDeVie } = obligatoires;
  return {
    id,
    intitule,
    delai,
    estimationInitiale,
    cycleDeVie,
    ...(creation.tacheParenteId === undefined ? {} : { tacheParenteId: creation.tacheParenteId }),
    objectifIdsActifs: liens.get(id) ?? [],
    creeLe: creation.creeLe,
    supprime: champs.has('suppression'),
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
  const parTache = new Map<string, Array<IdObjectif>>();
  for (const registre of actifs) {
    const { tacheId, objectifId } = partiesDuLien(registre.cle.id);
    parTache.set(tacheId, [...(parTache.get(tacheId) ?? []), objectifId]);
  }
  return parTache;
};

const projeterTous = <I extends string, E>(
  groupes: ChampsParElement,
  projeter: (id: I, champs: ChampsDeLElement) => E | undefined,
): ReadonlyMap<I, E> => {
  const projetes = new Map<I, E>();
  for (const [id, champs] of groupes as ReadonlyMap<I, ChampsDeLElement>) {
    const element = projeter(id, champs);
    if (element !== undefined) projetes.set(id, element);
  }
  return projetes;
};

export const projeterEtatMetier = (etat: EtatLocal): EtatMetier => {
  const lecture: Lecture = {
    enAttente: elementsEnAttente(etat.enAttente),
    liens: liensActifsParTache(etat),
  };
  return {
    objectifs: projeterTous<IdObjectif, ObjectifEnregistre>(
      grouperParElement(etat, 'OBJECTIF'),
      (id, champs) => projeterObjectif(lecture, id, champs),
    ),
    taches: projeterTous<IdTache, TacheEnregistree>(
      grouperParElement(etat, 'TACHE'),
      (id, champs) => projeterTache(lecture, id, champs),
    ),
  };
};
