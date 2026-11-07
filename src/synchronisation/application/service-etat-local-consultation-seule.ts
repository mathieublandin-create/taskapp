import { nonImplemente } from '@non-implemente';
import type { Resultat } from '../../commun/domaine/resultat';
import type { ErreurDepotLocal } from './ports/depot-local';
import type { DecisionMetier, ServiceEtatLocal } from './service-etat-local';

// ST-US-017 v0.11 §6.8 n° 9 (rang 11, RG-058) : saisie bloquée en consultation seule. Décorateur unique, posé par la
// composition autour du service de chaque espace ; le socle (ServiceEtatLocalTransactionnel) ne change pas.

export type DependancesConsultationSeule = {
  readonly service: ServiceEtatLocal;
  /** Vrai si et seulement si `cycle.etatMoteur().actionRequise === 'FORMAT_PLUS_RECENT'` (lu à chaque appel). */
  readonly estConsultationSeule: () => boolean;
};

export class ServiceEtatLocalConsultationSeule implements ServiceEtatLocal {
  constructor(private readonly dependances: DependancesConsultationSeule) {}

  /** Délégué tel quel (la consultation reste complète). */
  lire(): ReturnType<ServiceEtatLocal['lire']> {
    return nonImplemente(`ServiceEtatLocalConsultationSeule.lire (${typeof this.dependances})`);
  }

  /** Délégué tel quel. */
  lireJournal(
    element: Parameters<ServiceEtatLocal['lireJournal']>[0],
  ): ReturnType<ServiceEtatLocal['lireJournal']> {
    return nonImplemente(`ServiceEtatLocalConsultationSeule.lireJournal (${element.id})`);
  }

  /** Délégué tel quel. */
  lireDecompteEnAttente(): ReturnType<ServiceEtatLocal['lireDecompteEnAttente']> {
    return nonImplemente('ServiceEtatLocalConsultationSeule.lireDecompteEnAttente');
  }

  /**
   * Consultation seule : `Echec({ type: 'ConsultationSeule' })` sans appeler la décision ni le service (aucune
   * écriture, aucun identifiant consommé) ; sinon délégué tel quel.
   */
  modifier<T, E extends { readonly type: string }>(
    decision: DecisionMetier<T, E>,
  ): Promise<Resultat<T, E | ErreurDepotLocal>> {
    return nonImplemente(`ServiceEtatLocalConsultationSeule.modifier (${typeof decision})`);
  }
}
