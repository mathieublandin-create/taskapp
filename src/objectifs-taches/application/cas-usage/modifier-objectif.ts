import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import {
  deciderModificationDelaiObjectif,
  deciderModificationDescription,
  deciderRenommageObjectif,
  deciderRetraitDelaiObjectif,
} from '../../domaine/decisions/modifier-objectif';
import type { RefusMetier } from '../../domaine/refus';
import { avecVue } from '../requetes/lecture-courante';

// ST-US-001 §4.2.
export class RenommerObjectif {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(entree: {
    readonly objectifId: IdObjectif;
    readonly intitule: string;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return this.service.modifier(avecVue(deciderRenommageObjectif(entree)));
  }
}

export class ModifierDescriptionObjectif {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(entree: {
    readonly objectifId: IdObjectif;
    readonly description?: string;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return this.service.modifier(avecVue(deciderModificationDescription(entree)));
  }
}

export class ModifierDelaiObjectif {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(entree: {
    readonly objectifId: IdObjectif;
    readonly delai: DateCalendaire;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return this.service.modifier(avecVue(deciderModificationDelaiObjectif(entree)));
  }
}

export class RetirerDelaiObjectif {
  constructor(private readonly service: ServiceEtatLocal) {}

  executer(entree: {
    readonly objectifId: IdObjectif;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return this.service.modifier(avecVue(deciderRetraitDelaiObjectif(entree)));
  }
}
