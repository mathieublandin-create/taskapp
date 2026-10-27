import { nonImplemente } from '@non-implemente';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import type { Resultat } from '@src/commun/domaine/resultat';
import type {
  DepotLocal,
  ErreurDepotLocal,
  IssueTransaction,
} from '@src/synchronisation/application/ports/depot-local';
import type { EtatLocal } from '@src/synchronisation/domaine/etat-local';
import type {
  MetaSynchronisation,
  PlanSynchronisation,
} from '@src/synchronisation/domaine/meta-synchronisation';

/**
 * Doublure en mémoire du port DepotLocal (ST-US-017 §12.3 ; condition de Starck sur Q-ST017-STA-1).
 * Squelette E10 : réalisée par Benjamin ; elle passe la suite `tests/contrats/depot-local.contrat.ts`
 * (CT-DEPOT-01 à 11). Plusieurs instances partagent un même `StockageDepotEnMemoire` (deux onglets,
 * ou un redémarrage). Chaque `appliquer` et chaque `appliquerSynchronisation` est atomique : le calcul
 * reçoit l'état (et la méta) du stockage, puis le plan et la méta sont recopiés ensemble, ou rien
 * si le calcul échoue ou lève. Les observateurs de toutes les instances sont appelés après chaque plan non vide.
 */
export class StockageDepotEnMemoire {
  constructor(readonly appareilId: IdAppareil) {}
}

export class DepotLocalEnMemoire implements DepotLocal {
  constructor(private readonly stockage: StockageDepotEnMemoire) {}

  lire(): Promise<Resultat<EtatLocal, ErreurDepotLocal>> {
    return nonImplemente('DepotLocalEnMemoire.lire');
  }

  appliquer<T, E extends { readonly type: string }>(
    _calcul: (etat: EtatLocal) => Resultat<IssueTransaction<T>, E>,
  ): Promise<Resultat<T, E | ErreurDepotLocal>> {
    return nonImplemente('DepotLocalEnMemoire.appliquer');
  }

  observer(_rappel: () => void): () => void {
    return nonImplemente('DepotLocalEnMemoire.observer');
  }

  lireMeta(): Promise<Resultat<MetaSynchronisation, ErreurDepotLocal>> {
    return nonImplemente('DepotLocalEnMemoire.lireMeta');
  }

  appliquerSynchronisation(
    _calcul: (etat: EtatLocal, meta: MetaSynchronisation) => PlanSynchronisation,
  ): Promise<Resultat<undefined, ErreurDepotLocal>> {
    return nonImplemente('DepotLocalEnMemoire.appliquerSynchronisation');
  }
}
