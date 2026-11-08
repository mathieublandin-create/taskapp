import type { EtatReseau } from '../../commun/application/ports/etat-reseau';
import { decompterModificationsEnAttente } from '../domaine/index-en-attente';
import type { CycleSynchronisation } from './cycle-synchronisation';
import type { AccesGoogle } from './ports/acces-google';
import type { DepotLocal } from './ports/depot-local';

// ST-US-017 §6.5 ; port DepotAvantSortie du contexte compte (ST-US-022 §4.3), adapté par la composition.
export type IssueDepotAvantSortieSynchro = 'DEPOSE' | 'ECHEC' | 'NON_TENTE';

export type DependancesDepotAvantSortie = {
  readonly depot: Pick<DepotLocal, 'lire'>;
  /** ST-US-017 v0.11 §6.8 n° 8 : l'action requise du moteur dit si l'espace est en consultation seule. */
  readonly cycle: Pick<CycleSynchronisation, 'deposerMaintenant' | 'etatMoteur'>;
  readonly reseau: EtatReseau;
  readonly acces: Pick<AccesGoogle, 'etat'>;
};

/** Dépôt tenté avant la déconnexion ou la suppression des données de l'appareil (RG-043, RG-055). */
export class DepotAvantSortieSynchro {
  constructor(private readonly dependances: DependancesDepotAvantSortie) {}

  /** Décompte par élément du socle (DAT §4.1.5 bis) ; espace illisible : 0. */
  async compterEnAttente(): Promise<number> {
    const etat = await this.dependances.depot.lire();
    return etat.ok ? decompterModificationsEnAttente(etat.valeur.enAttente) : 0;
  }

  /**
   * Consultation seule (format plus récent, ST-US-017 v0.11 §6.8 n° 8) : NON_TENTE sans appeler le cycle, avant le
   * contrôle du réseau et de l'accès ; sinon, réseau connecté et accès valide : dépôt seul ; sinon NON_TENTE.
   */
  async deposerSiPossible(): Promise<IssueDepotAvantSortieSynchro> {
    const { reseau, acces, cycle } = this.dependances;
    if (cycle.etatMoteur().actionRequise === 'FORMAT_PLUS_RECENT') return 'NON_TENTE';
    if (!reseau.estConnecte() || acces.etat() !== 'VALIDE') return 'NON_TENTE';
    return (await cycle.deposerMaintenant()) === 'TERMINE' ? 'DEPOSE' : 'ECHEC';
  }
}
