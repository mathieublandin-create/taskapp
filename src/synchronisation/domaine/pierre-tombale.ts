import { nonImplemente } from '@non-implemente';
import type { IdAppareil } from '../../commun/domaine/identifiants';
import type { ContexteCausal } from './contexte-causal';
import type { EtatLocal } from './etat-local';
import type { RefElementMetier } from './information';

// DAT §4.2.1 v0.10.1, H-1 (ST-socle-ecriture.md §6.4).
export const contexteDePierreTombale = (
  _etat: EtatLocal,
  _element: RefElementMetier,
  _auteur: IdAppareil,
): ContexteCausal => nonImplemente('contexteDePierreTombale');

/** Objectif : aucun ; tâche : ses sous-tâches non supprimées (§6.5). */
export const descendantsSupprimesParDerivation = (
  _etat: EtatLocal,
  _element: RefElementMetier,
): ReadonlyArray<RefElementMetier> => nonImplemente('descendantsSupprimesParDerivation');
