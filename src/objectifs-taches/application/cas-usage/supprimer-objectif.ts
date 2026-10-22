import { nonImplemente } from '@non-implemente';
import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { Evaluation } from '../../domaine/confirmation';
import type { RefusMetier } from '../../domaine/refus';

// ST-US-001 §4.2 : commande avec confirmation (CNF-SUPPR-OBJECTIF).
export class SupprimerObjectif {
  constructor(private readonly service: ServiceEtatLocal) {}

  /** N'écrit rien (conventions.md §8.6). */
  evaluer(_entree: {
    readonly objectifId: IdObjectif;
  }): Promise<Resultat<Evaluation, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('SupprimerObjectif.evaluer');
  }

  executer(_entree: {
    readonly objectifId: IdObjectif;
  }): Promise<Resultat<void, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('SupprimerObjectif.executer');
  }
}
