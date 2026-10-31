import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { Evaluation } from '../../domaine/confirmation';
import {
  deciderSuppressionObjectif,
  evaluerSuppressionObjectif,
} from '../../domaine/decisions/supprimer-objectif';
import type { RefusMetier } from '../../domaine/refus';
import { avecVue, evaluerSurEtat } from '../requetes/lecture-courante';

// ST-US-001 §4.2 : commande avec confirmation (CNF-SUPPR-OBJECTIF).
export class SupprimerObjectif {
  constructor(private readonly service: ServiceEtatLocal) {}

  /** N'écrit rien (conventions.md §8.6). */
  evaluer(entree: {
    readonly objectifId: IdObjectif;
  }): Promise<Resultat<Evaluation, RefusMetier | ErreurDepotLocal>> {
    return evaluerSurEtat(this.service, evaluerSuppressionObjectif(entree));
  }

  executer(entree: {
    readonly objectifId: IdObjectif;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return this.service.modifier(avecVue(deciderSuppressionObjectif(entree)));
  }
}
