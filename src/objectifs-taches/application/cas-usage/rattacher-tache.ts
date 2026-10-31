import type { IdObjectif, IdTache } from '../../../commun/domaine/identifiants';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import { deciderDetachement, deciderRattachement } from '../../domaine/decisions/rattacher-tache';
import type { RefusMetier } from '../../domaine/refus';
import { avecVue } from '../requetes/lecture-courante';

// ST-US-002 §4.2 (RG-001).
type Entree = { readonly tacheId: IdTache; readonly objectifId: IdObjectif };

export class RattacherTache {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(entree: Entree): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return this.service.modifier(avecVue(deciderRattachement(entree)));
  }
}

export class DetacherTache {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(entree: Entree): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return this.service.modifier(avecVue(deciderDetachement(entree)));
  }
}
