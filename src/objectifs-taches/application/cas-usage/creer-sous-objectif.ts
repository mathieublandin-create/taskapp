import type { GenerateurIdentifiants } from '../../../commun/application/ports/generateur-identifiants';
import { IdObjectif } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import { deciderCreationObjectif } from '../../domaine/decisions/creer-objectif';
import type { RefusMetier } from '../../domaine/refus';
import { avecVue } from '../requetes/lecture-courante';

// ST-US-023 §4.2 : CREER_OBJECTIF avec parentId + CREATION.
export class CreerSousObjectif {
  constructor(
    private readonly service: ServiceEtatLocal,
    private readonly generateur: GenerateurIdentifiants,
  ) {}

  executer(entree: {
    readonly parentId: IdObjectif;
    readonly intitule: string;
    readonly description?: string;
    readonly delai?: DateCalendaire;
  }): Promise<Resultat<IdObjectif, RefusMetier | ErreurDepotLocal>> {
    const id = IdObjectif.depuisUuid(this.generateur.genererUuidV7());
    return this.service.modifier(avecVue(deciderCreationObjectif({ ...entree, id })));
  }
}
