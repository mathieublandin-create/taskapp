import { nonImplemente } from '@non-implemente';
import type { Horloge } from '../../../commun/application/ports/horloge';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { IdValeurEcartee } from '../../domaine/valeurs-ecartees';
import type { DepotLocal, ErreurDepotLocal } from '../ports/depot-local';

// ST-US-017 v0.5 §4.6, §6.6 n° 6 ; RG-056 b : « Compris ». Une seule transaction (`appliquerSynchronisation`).

export type DependancesMarquerCommeLue = {
  readonly depot: DepotLocal;
  readonly horloge: Horloge;
};

export class MarquerCommeLue {
  constructor(private readonly dependances: DependancesMarquerCommeLue) {}

  /**
   * Écrit une `Lecture` (même HLC, `hlcSuivant`) pour chaque identifiant connu et non lu ; ignore les autres. Rien à
   * écrire : aucune écriture, version inchangée. Le dépôt suit au cycle déclenché par l'observateur du dépôt.
   */
  executer(ids: ReadonlyArray<IdValeurEcartee>): Promise<Resultat<undefined, ErreurDepotLocal>> {
    return nonImplemente(
      `MarquerCommeLue.executer (${String(ids.length)}, ${typeof this.dependances.depot})`,
    );
  }
}
