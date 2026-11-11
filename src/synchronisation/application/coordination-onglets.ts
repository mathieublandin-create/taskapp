import type { JournalTechnique } from '../../commun/application/ports/journal-technique';
import type { Annulation } from '../../commun/application/ports/planificateur';
import type { CycleSynchronisation } from './cycle-synchronisation';
import { nomVerrouMeneur } from './noms-verrous';
import type { AccesGoogle, EtatAccesGoogle } from './ports/acces-google';
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

type Phase = 'NEUVE' | 'DEMARREE' | 'ARRETEE';

export class CoordinationOnglets {
  #phase: Phase = 'NEUVE';
  #role: RoleOnglet = 'SUIVEUR';
  /** Défini tant qu'une candidature est en attente ou que la main est tenue. */
  #rendre: (() => void) | undefined;
  #desabonnerAcces: Annulation | undefined;
  readonly #observateurs = new Set<() => void>();

  constructor(private readonly dependances: DependancesCoordination) {}

  /** Abonnement à l'accès ; candidature si l'accès est `VALIDE`. Idempotent ; sans effet après `arreter()`. */
  demarrer(): void {
    if (this.#phase !== 'NEUVE') return;
    this.#phase = 'DEMARREE';
    this.#desabonnerAcces = this.dependances.acces.observer((etat) => {
      this.#surAcces(etat);
    });
    if (this.dependances.acces.etat() === 'VALIDE') this.#candidater();
  }

  /** Rend la main (ou abandonne la candidature), arrête le cycle, se désabonne. Idempotent et définitif. */
  arreter(): void {
    if (this.#phase === 'ARRETEE') return;
    this.#phase = 'ARRETEE';
    this.#desabonnerAcces?.();
    this.#desabonnerAcces = undefined;
    this.dependances.cycle.arreter();
    this.#lacher();
  }

  async etat(): Promise<EtatCoordination> {
    if (this.#role === 'MENEUR') return { role: 'MENEUR', autreMeneur: false };
    const tenu = await this.dependances.verrou.estTenu(this.#nomVerrou());
    return { role: 'SUIVEUR', autreMeneur: tenu };
  }

  /** `rappel` est appelé à chaque changement de rôle de cet onglet (lecture de l'état par `etat()`). */
  observer(rappel: () => void): Annulation {
    const enveloppe = (): void => {
      rappel();
    };
    this.#observateurs.add(enveloppe);
    return () => {
      this.#observateurs.delete(enveloppe);
    };
  }

  #surAcces(etat: EtatAccesGoogle): void {
    if (etat === 'VALIDE') {
      this.#candidater();
      return;
    }
    // Q-ST031-STA-2 : un onglet sans accès ne garde ni la main ni sa candidature.
    if (this.#role === 'MENEUR') this.dependances.cycle.arreter();
    this.#lacher();
  }

  #candidater(): void {
    if (this.#rendre !== undefined) return;
    this.#rendre = this.dependances.verrou.demanderLaMain(this.#nomVerrou(), () => {
      this.#obtenue();
    });
  }

  #obtenue(): void {
    const { cycle, journal } = this.dependances;
    this.#role = 'MENEUR';
    cycle.demarrer();
    cycle.synchroniserMaintenant().catch((erreur: unknown) => {
      journal.consigner({
        niveau: 'erreur',
        evenement: 'SynchronisationInterrompue',
        champs: { erreur: erreur instanceof Error ? erreur.name : 'inconnue' },
      });
    });
    journal.consigner({ niveau: 'info', evenement: 'OngletMeneur' });
    this.#notifier();
  }

  /** Main rendue ou candidature abandonnée ; notification si l'onglet était meneur. */
  #lacher(): void {
    const rendre = this.#rendre;
    this.#rendre = undefined;
    rendre?.();
    if (this.#role === 'SUIVEUR') return;
    this.#role = 'SUIVEUR';
    this.#notifier();
  }

  #notifier(): void {
    [...this.#observateurs].forEach((rappel) => {
      rappel();
    });
  }

  #nomVerrou(): string {
    return nomVerrouMeneur(this.dependances.nomEspace);
  }
}
