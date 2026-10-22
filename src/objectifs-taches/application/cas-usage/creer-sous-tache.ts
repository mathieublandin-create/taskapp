import { nonImplemente } from '@non-implemente';
import type { GenerateurIdentifiants } from '../../../commun/application/ports/generateur-identifiants';
import type { IdTache } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { Evaluation } from '../../domaine/confirmation';
import type { RefusMetier } from '../../domaine/refus';

// ST-US-024 §4.2 : l'IdTache est tiré une seule fois, dans executer.
export class CreerSousTache {
  constructor(
    private readonly service: ServiceEtatLocal,
    private readonly generateur: GenerateurIdentifiants,
  ) {}

  /** N'écrit rien (conventions.md §8.6). */
  evaluer(_entree: {
    readonly tacheParenteId: IdTache;
    readonly intitule: string;
    readonly delai?: DateCalendaire;
    readonly estimationMinutes?: number;
  }): Promise<Resultat<Evaluation, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('CreerSousTache.evaluer');
  }

  executer(_entree: {
    readonly tacheParenteId: IdTache;
    readonly intitule: string;
    readonly delai?: DateCalendaire;
    readonly estimationMinutes?: number;
  }): Promise<Resultat<IdTache, RefusMetier | ErreurDepotLocal>> {
    return nonImplemente('CreerSousTache.executer');
  }
}
