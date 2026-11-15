import type { GenerateurIdentifiants } from '../../../commun/application/ports/generateur-identifiants';
import { IdTache, type IdObjectif } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import { deciderCreationTache } from '../../domaine/decisions/creer-tache';
import type { RefusMetier } from '../../domaine/refus';
import { avecVue } from '../requetes/lecture-courante';

// ST-US-002 §4.2 : CREER_TACHE + CREATION.
export class CreerTache {
  constructor(
    private readonly service: ServiceEtatLocal,
    private readonly generateur: GenerateurIdentifiants,
  ) {}

  executer(entree: {
    readonly intitule: string;
    readonly delai?: DateCalendaire;
    readonly estimationMinutes?: number;
    readonly objectifIds: ReadonlyArray<IdObjectif>;
  }): Promise<Resultat<IdTache, RefusMetier | ErreurDepotLocal>> {
    const { objectifIds, ...saisie } = entree;
    const id = IdTache.depuisUuid(this.generateur.genererUuidV7());
    return this.service.modifier(avecVue(deciderCreationTache({ id, saisie, objectifIds })));
  }
}
