import type { IdTache } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import {
  deciderModificationDelaiTache,
  deciderModificationEstimation,
  deciderRenommageTache,
} from '../../domaine/decisions/modifier-tache';
import type { RefusMetier } from '../../domaine/refus';
import { avecVue } from '../requetes/lecture-courante';

// ST-US-002 §4.2.
export class RenommerTache {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(entree: {
    readonly tacheId: IdTache;
    readonly intitule: string;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return this.service.modifier(avecVue(deciderRenommageTache(entree)));
  }
}

export class ModifierDelaiTache {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(entree: {
    readonly tacheId: IdTache;
    readonly delai: DateCalendaire;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return this.service.modifier(avecVue(deciderModificationDelaiTache(entree)));
  }
}

export class ModifierEstimationTache {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(entree: {
    readonly tacheId: IdTache;
    readonly estimationMinutes: number;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return this.service.modifier(avecVue(deciderModificationEstimation(entree)));
  }
}
