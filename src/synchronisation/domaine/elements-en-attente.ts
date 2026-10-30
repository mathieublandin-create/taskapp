import { nonImplemente } from '@non-implemente';
import type { Instant } from '../../commun/domaine/temps/instant';
import type { EtatLocal } from './etat-local';

// ST-US-017 v0.4.1 §3.1 n° 17 e, §4.5 bis (Q-BEN-R3R-1) : éléments en attente détaillés pour la feuille ECR-011.
// Même forme que `LigneFeuilleOrdonnable` (présentation) : le domaine n'en dépend pas, le compilateur vérifie à l'appel.
export type ElementEnAttente = {
  readonly id: string;
  readonly intitule: string;
  /** Physique du plus grand `derniereHlc` des entrées de l'élément (dernière écriture en attente). */
  readonly instant: Instant;
};

/**
 * Une entrée par élément (objectif ou tâche) qui a au moins une entrée dans `etat.enAttente` ; une entrée de lien
 * tâche-objectif compte pour sa tâche (`elementDeCle`). Le nombre d'entrées est égal à
 * `decompterModificationsEnAttente(etat.enAttente)`. Intitulé : valeur du registre `intitule` de l'élément, même
 * supprimé ; chaîne vide si ce registre est absent. Ordre non garanti (la présentation trie par `comparerLignesFeuille`).
 */
export const elementsEnAttenteDetailles = (_etat: EtatLocal): ReadonlyArray<ElementEnAttente> =>
  nonImplemente('elementsEnAttenteDetailles');
