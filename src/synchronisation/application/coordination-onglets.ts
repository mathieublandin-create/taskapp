import { nonImplemente } from '@non-implemente';
import type { JournalTechnique } from '../../commun/application/ports/journal-technique';
import type { Annulation } from '../../commun/application/ports/planificateur';
import type { CycleSynchronisation } from './cycle-synchronisation';
import type { AccesGoogle } from './ports/acces-google';
import type { VerrouOnglets } from './ports/verrou-onglets';

// ST-US-031 v0.4 §4.1, §6.1 (rang 13, tranche B2) ; DAT v0.11.12 §4.1.6 (Q-ST031-STA-1, Q-ST031-STA-2) ; guide §6.4
// (deux onglets : reprise sans message). Un onglet meneur par espace : lui seul installe les déclencheurs du cycle.

export type RoleOnglet = 'MENEUR' | 'SUIVEUR';

export type EtatCoordination = {
  readonly role: RoleOnglet;
  /** Vrai si et seulement si `role = SUIVEUR` et qu'un autre onglet tient le verrou « meneur » de l'espace. */
  readonly autreMeneur: boolean;
};

export type DependancesCoordination = {
  readonly verrou: VerrouOnglets;
  readonly cycle: Pick<CycleSynchronisation, 'demarrer' | 'arreter' | 'synchroniserMaintenant'>;
  readonly acces: AccesGoogle;
  /** Nom de l'espace du compte (`donejuan-<env>-<empreinte du sub>`). */
  readonly nomEspace: string;
  readonly journal: JournalTechnique;
};

export class CoordinationOnglets {
  constructor(private readonly dependances: DependancesCoordination) {}

  /** Abonnement à l'accès ; candidature si l'accès est `VALIDE`. Idempotent ; sans effet après `arreter()`. */
  demarrer(): void {
    nonImplemente(`CoordinationOnglets.demarrer(${this.dependances.nomEspace})`);
  }

  /** Rend la main (ou abandonne la candidature), arrête le cycle, se désabonne. Idempotent et définitif. */
  arreter(): void {
    nonImplemente('CoordinationOnglets.arreter');
  }

  etat(): Promise<EtatCoordination> {
    return nonImplemente('CoordinationOnglets.etat');
  }

  /** `rappel` est appelé à chaque changement de rôle de cet onglet (lecture de l'état par `etat()`). */
  observer(rappel: () => void): Annulation {
    return nonImplemente(`CoordinationOnglets.observer(${typeof rappel})`);
  }
}
