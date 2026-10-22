import { nonImplemente } from '@non-implemente';
import type { GenerateurIdentifiants } from '../../commun/application/ports/generateur-identifiants';
import type { Horloge } from '../../commun/application/ports/horloge';
import type { Resultat } from '../../commun/domaine/resultat';
import type { Instant } from '../../commun/domaine/temps/instant';
import type { EtatMetier } from '../domaine/etat-metier';
import type { EvenementJournal } from '../domaine/evenement-journal';
import type { RefElementMetier } from '../domaine/information';
import type { DepotLocal, ErreurDepotLocal } from './ports/depot-local';
import type { DecisionMetier, ServiceEtatLocal } from './service-etat-local';

/** Dépendances injectées (DS-13 ; objet nommé, RCD-02). */
export type DependancesServiceEtatLocal = {
  readonly depot: DepotLocal;
  readonly horloge: Horloge;
  readonly generateur: GenerateurIdentifiants;
};

// ST-socle-ecriture.md §6.8.
export class ServiceEtatLocalTransactionnel implements ServiceEtatLocal {
  constructor(private readonly dependances: DependancesServiceEtatLocal) {}

  lire(): Promise<Resultat<EtatMetier, ErreurDepotLocal>> {
    return nonImplemente('ServiceEtatLocalTransactionnel.lire');
  }

  lireJournal(
    _element: RefElementMetier,
  ): Promise<Resultat<ReadonlyArray<EvenementJournal>, ErreurDepotLocal>> {
    return nonImplemente('ServiceEtatLocalTransactionnel.lireJournal');
  }

  lireDecompteEnAttente(): Promise<
    Resultat<{ readonly nombre: number; readonly plusAncienne?: Instant }, ErreurDepotLocal>
  > {
    return nonImplemente('ServiceEtatLocalTransactionnel.lireDecompteEnAttente');
  }

  modifier<T, E extends { readonly type: string }>(
    _decision: DecisionMetier<T, E>,
  ): Promise<Resultat<T, E | ErreurDepotLocal>> {
    return nonImplemente('ServiceEtatLocalTransactionnel.modifier');
  }
}
