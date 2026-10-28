import type { Duree } from '../../commun/domaine/duree';
import type { IdObjectif, IdTache } from '../../commun/domaine/identifiants';
import { echec, succes, type Resultat } from '../../commun/domaine/resultat';
import type { DateCalendaire } from '../../commun/domaine/temps/date-calendaire';
import type { Instant } from '../../commun/domaine/temps/instant';
import type {
  ContexteDecision,
  CycleDeVie,
  Decision,
  EtatMetier,
  TacheEnregistree,
} from '../../synchronisation';
import type { Evaluation } from './confirmation';
import type { RefusMetier } from './refus';

// Dérivations de lecture RG-046 et RG-047 (ST-US-001 §4.1, §6.1).
export type Objectif = {
  readonly id: IdObjectif;
  readonly intitule: string;
  readonly description?: string;
  readonly delai?: DateCalendaire;
  readonly parentId?: IdObjectif; // parent EFFECTIF
  readonly creeLe: Instant;
  readonly enAttente: boolean;
};

export type Tache = {
  readonly id: IdTache;
  readonly intitule: string;
  readonly delai: DateCalendaire;
  readonly estimationInitiale: Duree;
  readonly cycleDeVie: CycleDeVie;
  readonly tacheParenteId?: IdTache;
  readonly creeLe: Instant;
  readonly enAttente: boolean;
};

export type VueMetier = {
  readonly objectifs: ReadonlyMap<IdObjectif, Objectif>; // non supprimés
  readonly taches: ReadonlyMap<IdTache, Tache>; // non supprimées, ni elles ni leur tâche parente
  readonly sousObjectifsPar: ReadonlyMap<IdObjectif, ReadonlyArray<IdObjectif>>;
  readonly sousTachesPar: ReadonlyMap<IdTache, ReadonlyArray<IdTache>>;
  readonly tachesDirectesPar: ReadonlyMap<IdObjectif, ReadonlyArray<IdTache>>;
  readonly objectifsDirectsPar: ReadonlyMap<IdTache, ReadonlyArray<IdObjectif>>; // ordre de rattachement
  readonly intitulesConnus: ReadonlyMap<string, string>; // id → intitulé, supprimés compris
};

/** Décision pure liée à sa commande ; `avecVue` en fait une DecisionMetier du socle. */
export type DecisionSurVue<T> = (
  vue: VueMetier,
  contexte: ContexteDecision,
) => Resultat<Decision<T>, RefusMetier>;

/** Évaluation d'une commande avec confirmation (conventions.md §8.6) ; n'écrit rien. */
export type EvaluationSurVue = (vue: VueMetier) => Resultat<Evaluation, RefusMetier>;

type Regroupement<K, V> = Map<K, Array<V>>;

const ajouter = <K, V>(groupes: Regroupement<K, V>, cle: K, valeur: V): void => {
  const groupe = groupes.get(cle);
  if (groupe === undefined) groupes.set(cle, [valeur]);
  else groupe.push(valeur);
};

const objectifsNonSupprimes = (etat: EtatMetier): Map<IdObjectif, Objectif> => {
  const objectifs = new Map<IdObjectif, Objectif>();
  for (const enregistre of etat.objectifs.values()) {
    if (enregistre.supprime) continue;
    const { parentIdEnregistre, supprime: _supprime, ...champs } = enregistre;
    const parentEffectif =
      parentIdEnregistre !== undefined && etat.objectifs.get(parentIdEnregistre)?.supprime === false
        ? parentIdEnregistre
        : undefined;
    objectifs.set(enregistre.id, {
      ...champs,
      ...(parentEffectif === undefined ? {} : { parentId: parentEffectif }),
    });
  }
  return objectifs;
};

const tachesRetenues = (etat: EtatMetier): ReadonlyArray<TacheEnregistree> =>
  [...etat.taches.values()].filter(
    (tache) =>
      !tache.supprime &&
      (tache.tacheParenteId === undefined ||
        etat.taches.get(tache.tacheParenteId)?.supprime === false),
  );

const versTache = ({
  objectifIdsActifs: _liens,
  supprime: _supprime,
  ...champs
}: TacheEnregistree): Tache => champs;

const intitulesDe = (etat: EtatMetier): Map<string, string> =>
  new Map([
    ...[...etat.objectifs.values()].map((o): [string, string] => [o.id, o.intitule]),
    ...[...etat.taches.values()].map((t): [string, string] => [t.id, t.intitule]),
  ]);

/** Construit la vue de lecture : éléments supprimés exclus, parent effectif, liens actifs (ST-US-001 §6.1). */
export const construireVueMetier = (etat: EtatMetier): VueMetier => {
  const objectifs = objectifsNonSupprimes(etat);
  const taches = tachesRetenues(etat);
  const sousObjectifsPar: Regroupement<IdObjectif, IdObjectif> = new Map();
  const sousTachesPar: Regroupement<IdTache, IdTache> = new Map();
  const tachesDirectesPar: Regroupement<IdObjectif, IdTache> = new Map();
  const objectifsDirectsPar: Regroupement<IdTache, IdObjectif> = new Map();

  for (const { id, parentId } of objectifs.values()) {
    if (parentId !== undefined) ajouter(sousObjectifsPar, parentId, id);
  }
  for (const tache of taches) {
    if (tache.tacheParenteId !== undefined) {
      ajouter(sousTachesPar, tache.tacheParenteId, tache.id);
      continue;
    }
    for (const objectifId of tache.objectifIdsActifs.filter((id) => objectifs.has(id))) {
      ajouter(tachesDirectesPar, objectifId, tache.id);
      ajouter(objectifsDirectsPar, tache.id, objectifId);
    }
  }
  return {
    objectifs,
    taches: new Map(taches.map((tache) => [tache.id, versTache(tache)])),
    sousObjectifsPar,
    sousTachesPar,
    tachesDirectesPar,
    objectifsDirectsPar,
    intitulesConnus: intitulesDe(etat),
  };
};

/** ElementIntrouvable si l'objectif est absent ou supprimé. */
export const objectifActif = (vue: VueMetier, id: IdObjectif): Resultat<Objectif, RefusMetier> => {
  const objectif = vue.objectifs.get(id);
  return objectif === undefined
    ? echec({ type: 'ElementIntrouvable', element: { type: 'OBJECTIF', id } })
    : succes(objectif);
};

const retrouver = <K, V>(
  ids: ReadonlyArray<K> | undefined,
  source: ReadonlyMap<K, V>,
): ReadonlyArray<V> =>
  (ids ?? []).flatMap((id) => {
    const element = source.get(id);
    return element === undefined ? [] : [element];
  });

export const sousObjectifsDe = (vue: VueMetier, id: IdObjectif): ReadonlyArray<Objectif> =>
  retrouver(vue.sousObjectifsPar.get(id), vue.objectifs);

export const tachesDirectesDe = (vue: VueMetier, id: IdObjectif): ReadonlyArray<Tache> =>
  retrouver(vue.tachesDirectesPar.get(id), vue.taches);

export const sousTachesDe = (vue: VueMetier, id: IdTache): ReadonlyArray<Tache> =>
  retrouver(vue.sousTachesPar.get(id), vue.taches);
