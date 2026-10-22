import { nonImplemente } from '@non-implemente';
import type { IdTache } from '../../../commun/domaine/identifiants';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { Evaluation } from '../../domaine/confirmation';
import type { RefusMetier } from '../../domaine/refus';

// ST-US-003 §4.2 : commande avec confirmation (CNF-ROUVRIR-SOUS-TACHE).
export class RouvrirTache {
  constructor(private readonly service: ServiceEtatLocal) {}

  /** N'écrit rien (conventions.md §8.6). */
  evaluer(_entree: {
    readonly tacheId: IdTache;
  }): Promise<Resultat<Evaluation, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('RouvrirTache.evaluer');
  }

  executer(_entree: {
    readonly tacheId: IdTache;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('RouvrirTache.executer');
  }
}
