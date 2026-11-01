import { nonImplemente } from '@non-implemente';
import type { Instant } from '../../commun/domaine/temps/instant';
import type { RegistreQuelconque } from './ecriture';
import type { EtatLocal } from './etat-local';
import type { EvenementJournal } from './evenement-journal';
import type { Hlc } from './hlc';
import type { ValeurEcartee } from './valeurs-ecartees';

// ST-US-017 v0.6 §6.6 n° 7 à 10 (n° 9 b à 9 d : entrée de journal, v0.6) ; RG-048 ; DAT §4.2 « hiérarchies »
// (réparation écrite et itérative, DEC-025).

export type ReparationHierarchie = {
  /** Un registre `parent` par objectif dont le déplacement a été annulé (valeur finale de la passe). */
  readonly registresEcrits: ReadonlyArray<RegistreQuelconque>;
  /** Une entrée `PLACEMENT_ANNULE` par annulation, dans l'ordre des annulations. */
  readonly valeursEcartees: ReadonlyArray<Extract<ValeurEcartee, { motif: 'PLACEMENT_ANNULE' }>>;
  /**
   * v0.6 (§6.6 n° 9 b, Q-ST017-PEP-2 b) : une entrée « changement parent » par annulation (`entreeDeReparation`),
   * dans l'ordre des annulations, sauf celles dont l'identifiant figure déjà dans `etat.journal` (idempotence).
   * Tranche B1 : toujours vide ; tranche B1b : rempli (§15.1).
   */
  readonly evenementsAjoutes: ReadonlyArray<EvenementJournal>;
  /** HLC de la dernière écriture de réparation ; absent si rien n'est écrit. */
  readonly dernierHlc?: Hlc;
};

/**
 * Annule un par un, du plus ancien au plus récent, les déplacements qui participent à une violation (cycle ou
 * deuxième niveau), jusqu'à obtenir une hiérarchie valide ; rien si elle l'est déjà. Fonction pure de l'état fusionné.
 */
export const reparerHierarchie = (
  etat: EtatLocal,
  physiqueCorrigee: Instant,
): ReparationHierarchie =>
  nonImplemente(`reparerHierarchie (${String(etat.registres.size)}, ${String(physiqueCorrigee)})`);
