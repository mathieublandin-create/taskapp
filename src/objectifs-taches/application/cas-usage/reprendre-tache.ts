import type { IdTache } from '../../../commun/domaine/identifiants';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { Evaluation } from '../../domaine/confirmation';
import { deciderReprise, evaluerReprise } from '../../domaine/decisions/reprendre-tache';
import type { RefusMetier } from '../../domaine/refus';
import { avecVue, evaluerSurEtat } from '../requetes/lecture-courante';

// ST-US-025 §4.2 : confirmation seulement pour une sous-tâche sous une tâche parente terminée (DEC-032).
export class ReprendreTache {
  constructor(private readonly service: ServiceEtatLocal) {}

  /** N'écrit rien (conventions.md §8.6). */
  evaluer(entree: {
    readonly tacheId: IdTache;
  }): Promise<Resultat<Evaluation, RefusMetier | ErreurDepotLocal>> {
    return evaluerSurEtat(this.service, evaluerReprise(entree));
  }

  executer(entree: {
    readonly tacheId: IdTache;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return this.service.modifier(avecVue(deciderReprise(entree)));
  }
}
