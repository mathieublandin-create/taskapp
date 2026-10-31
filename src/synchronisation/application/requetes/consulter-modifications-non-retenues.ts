import { nonImplemente } from '@non-implemente';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ValeurEcarteeDetaillee } from '../../domaine/detail-valeurs-ecartees';
import type { DepotLocal, ErreurDepotLocal } from '../ports/depot-local';

// ST-US-017 v0.5 §4.6 : lecture de la liste ECR-011 « Modifications non retenues » (lues comprises).

export type ModificationsNonRetenuesLues = {
  readonly valeurs: ReadonlyArray<ValeurEcarteeDetaillee>;
  /** `compterALire` (H-6). */
  readonly aLire: number;
};

/** `depot.lire()` et `depot.lireSignalements()`, puis `detaillerValeursEcartees` et `compterALire`. */
export const consulterModificationsNonRetenues = (
  depot: Pick<DepotLocal, 'lire' | 'lireSignalements'>,
): Promise<Resultat<ModificationsNonRetenuesLues, ErreurDepotLocal>> =>
  nonImplemente(`consulterModificationsNonRetenues (${typeof depot})`);
