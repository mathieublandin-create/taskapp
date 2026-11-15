import type {
  EtatPersistance,
  MemoireDemandePersistance,
  PersistanceStockage,
} from '../../../commun/application/ports/persistance-stockage';

// ST-US-018 v0.4 §4.1, §6.3 n° 2 (rang 12, tranche B1) ; DAT §4.1.6 : « au premier lancement, l'application demande
// `navigator.storage.persist()` ; l'état obtenu est affiché ».

export type DependancesDemanderPersistance = {
  readonly persistance: PersistanceStockage;
  readonly memoire: MemoireDemandePersistance;
};

/**
 * `executer()` : si la demande n'a jamais été faite (`memoire.dejaDemandee()` faux), `persistance.demander()` puis
 * `memoire.noterDemandee()`, et rend l'état obtenu ; sinon `persistance.etat()`. Des appels concurrents partagent la
 * même exécution en cours (une seule demande au premier lancement). Ne rejette jamais (ports qui ne rejettent pas).
 */
export class DemanderPersistance {
  private enCours: Promise<EtatPersistance> | undefined;

  constructor(private readonly dependances: DependancesDemanderPersistance) {}

  executer(): Promise<EtatPersistance> {
    if (this.enCours !== undefined) return this.enCours;
    const execution = this.#executer().finally(() => {
      // Oubliée une fois réglée : l'appel suivant relit l'état (la carte ALR-015 disparaît quand le navigateur accorde).
      this.enCours = undefined;
    });
    this.enCours = execution;
    return execution;
  }

  async #executer(): Promise<EtatPersistance> {
    const { persistance, memoire } = this.dependances;
    if (await memoire.dejaDemandee()) return persistance.etat();
    const obtenu = await persistance.demander();
    // Notée même si refusée : la demande n'est jamais refaite (Chrome mémorise sa réponse par origine).
    await memoire.noterDemandee();
    return obtenu;
  }
}
