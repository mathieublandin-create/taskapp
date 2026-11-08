import { nonImplemente } from '@non-implemente';
import type {
  EtatPersistance,
  MemoireDemandePersistance,
  PersistanceStockage,
} from '../../../commun/application/ports/persistance-stockage';

// ST-US-018 v0.4 §4.1, §6.3 (rang 12, tranche B1) ; DAT §4.1.6 : « au premier lancement, l'application demande
// `navigator.storage.persist()` ; l'état obtenu est affiché ».

export type DependancesDemanderPersistance = {
  readonly persistance: PersistanceStockage;
  readonly memoire: MemoireDemandePersistance;
};

/**
 * `executer()` : si la demande n'a jamais été faite (`memoire.dejaDemandee()` faux), `persistance.demander()` puis
 * `memoire.noterDemandee()`, et rend l'état obtenu ; sinon `persistance.etat()`. Des appels concurrents partagent la
 * même exécution en cours (une seule demande au premier lancement). Ne rejette jamais.
 */
export class DemanderPersistance {
  constructor(private readonly dependances: DependancesDemanderPersistance) {}

  executer(): Promise<EtatPersistance> {
    return nonImplemente(`DemanderPersistance.executer ${typeof this.dependances}`);
  }
}
