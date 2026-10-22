import { nonImplemente } from '@non-implemente';
import type { Instant } from '../../commun/domaine/temps/instant';
import type { Hlc } from './hlc';
import type { CleInformation, CleTexte, RefElementMetier } from './information';

// DAT §4.1.5 bis v0.10.1, H-4 (ST-socle-ecriture.md §6.5).
export type EntreeEnAttente = {
  readonly premiereEcriture: Instant; // instant corrigé de la première écriture locale non déposée
  readonly derniereHlc: Hlc; // HLC de la dernière écriture de cette information
};

export type IndexEnAttente = ReadonlyMap<
  CleTexte,
  { readonly cle: CleInformation; readonly entree: EntreeEnAttente }
>;

export const enregistrerEnAttente = (
  _index: IndexEnAttente,
  _cle: CleInformation,
  _hlc: Hlc,
  _instantCorrige: Instant,
): IndexEnAttente => nonImplemente('enregistrerEnAttente');

/** Entrée (type, id, 'creation') présente. */
export const aCreationNonDeposee = (_index: IndexEnAttente, _element: RefElementMetier): boolean =>
  nonImplemente('aCreationNonDeposee');

/** Champs de l'élément et, pour une tâche, ses liens. */
export const retirerEntreesDeElement = (
  _index: IndexEnAttente,
  _element: RefElementMetier,
): IndexEnAttente => nonImplemente('retirerEntreesDeElement');

/** Paramètres de purgerPourSuppression (objet nommé : RCD-02). */
export type PurgeSuppression = {
  readonly element: RefElementMetier;
  readonly descendantsSupprimes: ReadonlyArray<RefElementMetier>;
  readonly hlc: Hlc;
  readonly instantCorrige: Instant;
};

export const purgerPourSuppression = (
  _index: IndexEnAttente,
  _purge: PurgeSuppression,
): IndexEnAttente => nonImplemente('purgerPourSuppression');

/** Nombre d'éléments distincts (objectif, tâche, sous-tâche) qui ont une entrée. */
export const decompterModificationsEnAttente = (_index: IndexEnAttente): number =>
  nonImplemente('decompterModificationsEnAttente');

export const plusAncienneModificationEnAttente = (_index: IndexEnAttente): Instant | undefined =>
  nonImplemente('plusAncienneModificationEnAttente');

/** Identifiants d'objectifs et de tâches qui ont au moins une entrée. */
export const elementsEnAttente = (_index: IndexEnAttente): ReadonlySet<string> =>
  nonImplemente('elementsEnAttente');
