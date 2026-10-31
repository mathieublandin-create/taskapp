/**
 * Outils des étapes de tâches (ST-US-002 §12) : cas d'usage de l'appareil, résolution des intitulés
 * (conventions.md §11.7), détail et liste construits comme l'interface.
 */
import assert from 'node:assert/strict';
import type { IdTache } from '@src/commun/domaine/identifiants';
import { jourDeReference } from '@src/commun/domaine/temps/jour-de-reference';
import {
  construireDetailTache,
  construireLigneTache,
  construireListeTaches,
  type LigneTache,
  type FiltreEtat,
  type FiltreObjectif,
  type ModeleVueDetailTache,
  type ModeleVueListeTaches,
  type ResumeTache,
} from '@src/objectifs-taches';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { convertirDuree, convertirIntitules } from './conversions';
import type { AppareilSimule } from './banc/appareil-simule';
import { valeurDe } from './environnement';
import type { MondeDoneJuan } from './monde';
import { objectifsDe } from './objectifs';

const NATURE = 'tâche';

/** Intitulés des tâches non supprimées de l'appareil, sous-tâches comprises. */
const tachesDeLAppareil = async (
  appareil: AppareilSimule,
): Promise<ReadonlyArray<{ readonly id: IdTache; readonly intitule: string }>> => {
  await appareil.assurerOuverte();
  return [...construireVueMetier(valeurDe(await appareil.service.lire())).taches.values()];
};

/** Identifiant de la tâche désignée par son intitulé (conventions.md §11.7). */
export const resoudreTache = async (
  monde: MondeDoneJuan,
  appareil: AppareilSimule,
  intitule: string,
): Promise<IdTache> =>
  monde.references.resoudre<IdTache>(
    NATURE,
    intitule,
    (await tachesDeLAppareil(appareil)).map((t) => ({ ...t, supprime: false })),
  );

export const memoriserTache = (monde: MondeDoneJuan, intitule: string, id: IdTache): void => {
  monde.references.memoriser(NATURE, intitule, id);
};

export const nombreDeTaches = async (appareil: AppareilSimule): Promise<number> =>
  (await tachesDeLAppareil(appareil)).length;

export const tacheExiste = async (appareil: AppareilSimule, id: IdTache): Promise<boolean> =>
  (await tachesDeLAppareil(appareil)).some((t) => t.id === id);

export const existeUneTacheIntitulee = async (
  appareil: AppareilSimule,
  intitule: string,
): Promise<boolean> => (await tachesDeLAppareil(appareil)).some((t) => t.intitule === intitule);

export const resumeTacheDe = async (
  monde: MondeDoneJuan,
  appareil: AppareilSimule,
  intitule: string,
): Promise<ResumeTache> => {
  const id = await resoudreTache(monde, appareil, intitule);
  const detail = valeurDe(await (await objectifsDe(appareil)).consulterDetailTache.executer(id));
  return detail.tache;
};

/** Ligne de la tâche, construite comme la liste de l'interface. */
export const ligneTacheDe = async (
  monde: MondeDoneJuan,
  appareil: AppareilSimule,
  intitule: string,
): Promise<LigneTache> =>
  construireLigneTache(
    await resumeTacheDe(monde, appareil, intitule),
    jourDeReference(appareil.horloge.maintenant()),
  );

/** Vrai si au moins un objectif ou une tâche de l'appareil porte `MEN-ATTENTE` (lecture de la vue métier). */
export const unElementEstEnAttente = async (appareil: AppareilSimule): Promise<boolean> => {
  const vue = construireVueMetier(valeurDe(await appareil.service.lire()));
  return [...vue.objectifs.values(), ...vue.taches.values()].some((element) => element.enAttente);
};

export const detailTacheDe = async (
  monde: MondeDoneJuan,
  appareil: AppareilSimule,
  intitule: string,
): Promise<ModeleVueDetailTache> => {
  const id = await resoudreTache(monde, appareil, intitule);
  const detail = valeurDe(await (await objectifsDe(appareil)).consulterDetailTache.executer(id));
  return construireDetailTache(detail, { horloge: appareil.horloge });
};

export const listeTachesDe = async (
  appareil: AppareilSimule,
  filtres: { readonly etat: FiltreEtat; readonly objectif: FiltreObjectif },
): Promise<ModeleVueListeTaches> => {
  const donnees = valeurDe(await (await objectifsDe(appareil)).consulterTaches.executer());
  return construireListeTaches(donnees, filtres, { horloge: appareil.horloge });
};

export const FILTRES_ETAT: Readonly<Record<string, FiltreEtat>> = {
  'à faire': 'A_FAIRE',
  terminée: 'TERMINEE',
  abandonnée: 'ABANDONNEE',
};

export const NOMS_ETAT: Readonly<Record<string, string>> = {
  'ETA-TACHE-A-FAIRE': 'à faire',
  'ETA-TACHE-TERMINEE': 'terminée',
  'ETA-TACHE-ABANDONNEE': 'abandonnée',
};

/** Le modèle de la dernière consultation de la liste, ou un échec qui nomme l'étape manquante. */
export const derniereListe = (
  monde: MondeDoneJuan,
  appareil: AppareilSimule,
): ModeleVueListeTaches => {
  const liste = monde.derniereListeTaches.get(appareil.nom);
  assert.ok(liste, "Aucune liste consultée : « l'utilisateur consulte la liste des tâches »");
  return liste;
};

/**
 * Les groupes `(…)` qui ont le motif d'un type de paramètre (`{intitules}`, `{duree}`) arrivent déjà convertis par
 * cucumber-js ; le texte brut reste accepté.
 */
export const listeIntitules = (valeur: unknown): ReadonlyArray<string> =>
  Array.isArray(valeur) ? (valeur as ReadonlyArray<string>) : convertirIntitules(String(valeur));

export const minutes = (valeur: unknown): number =>
  typeof valeur === 'number' ? valeur : convertirDuree(String(valeur));
