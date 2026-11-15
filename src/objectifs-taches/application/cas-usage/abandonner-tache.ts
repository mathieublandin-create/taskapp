import type { IdTache } from '../../../commun/domaine/identifiants';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { Evaluation } from '../../domaine/confirmation';
import { deciderAbandon, evaluerAbandon } from '../../domaine/decisions/abandonner-tache';
import type { RefusMetier } from '../../domaine/refus';
import { avecVue, evaluerSurEtat } from '../requetes/lecture-courante';

// ST-US-025 §4.2 : toujours confirmé (Q-ERG-13).
export class AbandonnerTache {
  constructor(private readonly service: ServiceEtatLocal) {}

  /** N'écrit rien (conventions.md §8.6). */
  evaluer(entree: {
    readonly tacheId: IdTache;
  }): Promise<Resultat<Evaluation, RefusMetier | ErreurDepotLocal>> {
    return evaluerSurEtat(this.service, evaluerAbandon(entree));
  }

  executer(entree: {
    readonly tacheId: IdTache;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return this.service.modifier(avecVue(deciderAbandon(entree)));
  }
}
