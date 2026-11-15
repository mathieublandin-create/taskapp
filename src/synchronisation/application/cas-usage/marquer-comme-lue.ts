import type { Horloge } from '../../../commun/application/ports/horloge';
import type { Resultat } from '../../../commun/domaine/resultat';
import { Instant } from '../../../commun/domaine/temps/instant';
import { hlcSuivant } from '../../domaine/hlc';
import { PLAN_VIDE } from '../../domaine/planifier-ecritures';
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
   * écrire : aucune écriture, version inchangée. Le dépôt suit au cycle déclenché par l'observateur du dépôt
   * (`dernierHlc ≠ deposeJusquA`). La lecture n'entre pas dans l'index des écritures en attente.
   */
  executer(ids: ReadonlyArray<IdValeurEcartee>): Promise<Resultat<undefined, ErreurDepotLocal>> {
    const { depot, horloge } = this.dependances;
    return depot.appliquerSynchronisation((etat, _meta, signalements) => {
      const retenus = [...new Set(ids)].filter(
        (id) => signalements.valeursEcartees.has(id) && !signalements.lectures.has(id),
      );
      if (retenus.length === 0) return { plan: PLAN_VIDE(etat), meta: {} };
      const physique = Instant.decaler(horloge.maintenant(), etat.correctionHorloge);
      const hlc = hlcSuivant(etat.dernierHlc, physique, etat.appareilId);
      return {
        plan: { ...PLAN_VIDE(etat), etatApres: { ...etat, dernierHlc: hlc } },
        meta: {},
        signalements: { valeursEcartees: [], lectures: retenus.map((id) => ({ id, hlc })) },
      };
    });
  }
}
