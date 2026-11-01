import { succes, type Resultat } from '../../../commun/domaine/resultat';
import {
  detaillerValeursEcartees,
  type ValeurEcarteeDetaillee,
} from '../../domaine/detail-valeurs-ecartees';
import { compterALire } from '../../domaine/lectures';
import type { DepotLocal, ErreurDepotLocal } from '../ports/depot-local';

// ST-US-017 v0.5 §4.6 : lecture de la liste ECR-011 « Modifications non retenues » (lues comprises).

export type ModificationsNonRetenuesLues = {
  readonly valeurs: ReadonlyArray<ValeurEcarteeDetaillee>;
  /** `compterALire` (H-6). */
  readonly aLire: number;
};

/**
 * `depot.lire()` puis `depot.lireSignalements()` (signalements lus après l'état, §6.2), puis
 * `detaillerValeursEcartees` et `compterALire`. La première erreur du dépôt est rendue telle quelle.
 */
export const consulterModificationsNonRetenues = async (
  depot: Pick<DepotLocal, 'lire' | 'lireSignalements'>,
): Promise<Resultat<ModificationsNonRetenuesLues, ErreurDepotLocal>> => {
  const etat = await depot.lire();
  if (!etat.ok) return etat;
  const signalements = await depot.lireSignalements();
  if (!signalements.ok) return signalements;
  const s = signalements.valeur;
  return succes({
    valeurs: detaillerValeursEcartees(etat.valeur, s),
    aLire: compterALire(s.valeursEcartees, s.lectures),
  });
};
