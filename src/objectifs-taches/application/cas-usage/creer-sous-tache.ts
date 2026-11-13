import type { GenerateurIdentifiants } from '../../../commun/application/ports/generateur-identifiants';
import { IdTache } from '../../../commun/domaine/identifiants';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { Evaluation } from '../../domaine/confirmation';
import {
  deciderCreationSousTache,
  evaluerCreationSousTache,
} from '../../domaine/decisions/creer-sous-tache';
import type { RefusMetier } from '../../domaine/refus';
import { avecVue, evaluerSurEtat } from '../requetes/lecture-courante';

export type EntreeCreerSousTache = {
  readonly tacheParenteId: IdTache;
  readonly intitule: string;
  readonly delai?: DateCalendaire;
  readonly estimationMinutes?: number;
};

// ST-US-024 §4.2 : commande avec confirmation ; l'IdTache est tiré une seule fois, dans executer.
export class CreerSousTache {
  constructor(
    private readonly service: ServiceEtatLocal,
    private readonly generateur: GenerateurIdentifiants,
  ) {}

  /** N'écrit rien (conventions.md §8.6). */
  evaluer(
    entree: EntreeCreerSousTache,
  ): Promise<Resultat<Evaluation, RefusMetier | ErreurDepotLocal>> {
    const { tacheParenteId, ...saisie } = entree;
    return evaluerSurEtat(this.service, evaluerCreationSousTache({ tacheParenteId, saisie }));
  }

  executer(
    entree: EntreeCreerSousTache,
  ): Promise<Resultat<IdTache, RefusMetier | ErreurDepotLocal>> {
    const { tacheParenteId, ...saisie } = entree;
    const id = IdTache.depuisUuid(this.generateur.genererUuidV7());
    return this.service.modifier(avecVue(deciderCreationSousTache({ id, tacheParenteId, saisie })));
  }
}
