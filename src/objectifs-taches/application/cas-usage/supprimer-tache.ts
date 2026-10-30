import type { IdTache } from '../../../commun/domaine/identifiants';
import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { Evaluation } from '../../domaine/confirmation';
import {
  deciderSuppressionTache,
  evaluerSuppressionTache,
} from '../../domaine/decisions/supprimer-tache';
import type { RefusMetier } from '../../domaine/refus';
import { construireVueMetier } from '../../domaine/vue-metier';
import { avecVue } from '../requetes/lecture-courante';

// ST-US-002 §4.2 : commande avec confirmation (CNF-SUPPR-TACHE).
export class SupprimerTache {
  constructor(private readonly service: ServiceEtatLocal) {}

  /** N'écrit rien (conventions.md §8.6). */
  async evaluer(entree: {
    readonly tacheId: IdTache;
  }): Promise<Resultat<Evaluation, RefusMetier | ErreurDepotLocal>> {
    const etat = await this.service.lire();
    if (!etat.ok) return etat;
    const evaluation = evaluerSuppressionTache(entree)(construireVueMetier(etat.valeur));
    return evaluation.ok ? succes(evaluation.valeur) : echec(evaluation.erreur);
  }

  executer(entree: {
    readonly tacheId: IdTache;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return this.service.modifier(avecVue(deciderSuppressionTache(entree)));
  }
}
