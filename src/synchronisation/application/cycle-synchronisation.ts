import { nonImplemente } from '@non-implemente';
import type { EtatReseau } from '../../commun/application/ports/etat-reseau';
import type { Horloge } from '../../commun/application/ports/horloge';
import type { JournalTechnique } from '../../commun/application/ports/journal-technique';
import type { Planificateur } from '../../commun/application/ports/planificateur';
import type { SourceAleatoire } from '../../commun/application/ports/source-aleatoire';
import type { AccesGoogle } from './ports/acces-google';
import type { DepotLocal } from './ports/depot-local';
import type { EtatMoteur, SuiviCycle } from './ports/suivi-cycle';
import type { TransportSynchro } from './ports/transport-synchro';

// DAT §4.3 ; ST-US-017 §6.2 à §6.4.
export type IssueCycle =
  | 'TERMINE'
  | 'NON_LANCE_HORS_LIGNE'
  | 'NON_LANCE_SANS_ACCES'
  | 'DEJA_EN_COURS'
  | 'ACCES_REFUSE'
  | 'DRIVE_PLEIN'
  | 'ECHEC_TRANSITOIRE';

export type DependancesCycle = {
  readonly depot: DepotLocal;
  readonly transport: TransportSynchro;
  readonly acces: AccesGoogle;
  readonly reseau: EtatReseau;
  readonly planificateur: Planificateur;
  readonly aleatoire: SourceAleatoire;
  readonly horloge: Horloge;
  readonly journal: JournalTechnique;
  readonly versionApplication: string;
};

export class CycleSynchronisation implements SuiviCycle {
  constructor(private readonly dependances: DependancesCycle) {}

  /** Installe les déclencheurs (§6.4) ; idempotent. */
  demarrer(): void {
    nonImplemente('CycleSynchronisation.demarrer');
  }

  arreter(): void {
    nonImplemente('CycleSynchronisation.arreter');
  }

  synchroniserMaintenant(): Promise<IssueCycle> {
    return nonImplemente('CycleSynchronisation.synchroniserMaintenant');
  }

  deposerMaintenant(): Promise<IssueCycle> {
    return nonImplemente('CycleSynchronisation.deposerMaintenant');
  }

  etatMoteur(): EtatMoteur {
    return nonImplemente('CycleSynchronisation.etatMoteur');
  }

  cycleEnCours(): Promise<IssueCycle> | undefined {
    return nonImplemente('CycleSynchronisation.cycleEnCours');
  }
}
