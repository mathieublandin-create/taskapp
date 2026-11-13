import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import { deciderPlacementObjectif } from '../../domaine/decisions/placer-objectif';
import type { RefusMetier } from '../../domaine/refus';
import { avecVue } from '../requetes/lecture-courante';

// ST-US-023 §4.2 : ECRIRE_OBJECTIF parent + CHANGEMENT_PARENT, ou rien si le placement est sans effet.
export class PlacerObjectif {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(entree: {
    readonly objectifId: IdObjectif;
    readonly parentId: IdObjectif;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return this.service.modifier(avecVue(deciderPlacementObjectif(entree)));
  }
}

export class RendreObjectifPrincipal {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(entree: {
    readonly objectifId: IdObjectif;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return this.service.modifier(avecVue(deciderPlacementObjectif(entree)));
  }
}
