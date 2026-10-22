import type { IdOperation } from '../../commun/domaine/identifiants';
import type { Resultat } from '../../commun/domaine/resultat';
import type { DateCalendaire } from '../../commun/domaine/temps/date-calendaire';
import type { Instant } from '../../commun/domaine/temps/instant';
import type { EtatMetier } from '../domaine/etat-metier';
import type { EvenementJournal } from '../domaine/evenement-journal';
import type { RefElementMetier } from '../domaine/information';
import type { Modification } from '../domaine/modification';
import type { ErreurDepotLocal } from './ports/depot-local';

// ST-socle-ecriture.md §4.2.
export type ContexteDecision = {
  readonly instant: Instant; // Horloge.maintenant(), lu une fois avant la transaction
  readonly jour: DateCalendaire; // jourDeReference(instant)
  readonly operation: IdOperation; // idEvenement(operation, rang) désigne l'événement de rang donné
};

export type Decision<T> = {
  readonly modifications: ReadonlyArray<Modification>;
  readonly valeur: T;
};

export type DecisionMetier<T, E> = (
  etat: EtatMetier,
  contexte: ContexteDecision,
) => Resultat<Decision<T>, E>;

export interface ServiceEtatLocal {
  lire(): Promise<Resultat<EtatMetier, ErreurDepotLocal>>;
  /** Entrées de l'élément, par HLC croissant, puis id. */
  lireJournal(
    element: RefElementMetier,
  ): Promise<Resultat<ReadonlyArray<EvenementJournal>, ErreurDepotLocal>>;
  lireDecompteEnAttente(): Promise<
    Resultat<{ readonly nombre: number; readonly plusAncienne?: Instant }, ErreurDepotLocal>
  >;
  modifier<T, E extends { readonly type: string }>(
    decision: DecisionMetier<T, E>,
  ): Promise<Resultat<T, E | ErreurDepotLocal>>;
}
