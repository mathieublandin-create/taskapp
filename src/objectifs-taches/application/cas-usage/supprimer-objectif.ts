import type { IdObjectif } from '../../../commun/domaine/identifiants';
import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { Evaluation } from '../../domaine/confirmation';
import {
  deciderSuppressionObjectif,
  evaluerSuppressionObjectif,
} from '../../domaine/decisions/supprimer-objectif';
import type { RefusMetier } from '../../domaine/refus';
import { construireVueMetier } from '../../domaine/vue-metier';
import { avecVue } from '../requetes/lecture-courante';

// ST-US-001 §4.2 : commande avec confirmation (CNF-SUPPR-OBJECTIF).
export class SupprimerObjectif {
  constructor(private readonly service: ServiceEtatLocal) {}

  /** N'écrit rien (conventions.md §8.6). */
  async evaluer(entree: {
    readonly objectifId: IdObjectif;
  }): Promise<Resultat<Evaluation, RefusMetier | ErreurDepotLocal>> {
    const etat = await this.service.lire();
    if (!etat.ok) return etat;
    const evaluation = evaluerSuppressionObjectif(entree)(construireVueMetier(etat.valeur));
    return evaluation.ok ? succes(evaluation.valeur) : echec(evaluation.erreur);
  }

  executer(entree: {
    readonly objectifId: IdObjectif;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return this.service.modifier(avecVue(deciderSuppressionObjectif(entree)));
  }
}
