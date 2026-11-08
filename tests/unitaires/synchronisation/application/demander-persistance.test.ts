/**
 * ST-US-018 v0.4 §4.1, §6.3, §13 (rang 12, tranche B1) : persistance du stockage demandée au premier lancement
 * seulement (DAT §4.1.6, R15, ADR-013).
 */
import { describe, expect, it } from 'vitest';
import type {
  EtatPersistance,
  MemoireDemandePersistance,
} from '@src/commun/application/ports/persistance-stockage';
import { DemanderPersistance } from '@src/synchronisation/application/cas-usage/demander-persistance';
import { PersistanceSimulee } from '../../../doublures/persistance-simulee';

/** Mémoire du drapeau, partagée entre « lancements » ; journal ordonné des appels. */
class MemoireEspionne implements MemoireDemandePersistance {
  readonly appels: Array<string> = [];

  constructor(private demandee = false) {}

  dejaDemandee(): Promise<boolean> {
    this.appels.push('dejaDemandee');
    return Promise.resolve(this.demandee);
  }

  noterDemandee(): Promise<void> {
    this.appels.push('noterDemandee');
    this.demandee = true;
    return Promise.resolve();
  }
}

describe('DemanderPersistance (ST-US-018 §6.3)', () => {
  it('UT-US-018-01 premier lancement — persist() une fois, demande notée après la réponse, état obtenu rendu ; lancement suivant : persisted() seulement', async () => {
    const memoire = new MemoireEspionne();
    const persistance = new PersistanceSimulee('NON_PERSISTANT', 'PERSISTANT');

    const premier = await new DemanderPersistance({ persistance, memoire }).executer();

    expect(premier).toBe('PERSISTANT');
    expect(persistance.appelsDemander).toBe(1);
    expect(persistance.appelsEtat).toBe(0);
    expect(memoire.appels).toEqual(['dejaDemandee', 'noterDemandee']);

    const suivant = await new DemanderPersistance({ persistance, memoire }).executer();

    expect(suivant).toBe('PERSISTANT');
    expect(persistance.appelsDemander).toBe(1);
    expect(persistance.appelsEtat).toBe(1);
    expect(memoire.appels).toEqual(['dejaDemandee', 'noterDemandee', 'dejaDemandee']);
  });

  it('UT-US-018-01 premier lancement refusé — NON_PERSISTANT rendu, demande notée quand même (jamais redemandée)', async () => {
    const memoire = new MemoireEspionne();
    const persistance = new PersistanceSimulee('NON_PERSISTANT', 'NON_PERSISTANT');

    expect(await new DemanderPersistance({ persistance, memoire }).executer()).toBe(
      'NON_PERSISTANT',
    );
    expect(memoire.appels).toEqual(['dejaDemandee', 'noterDemandee']);

    expect(await new DemanderPersistance({ persistance, memoire }).executer()).toBe(
      'NON_PERSISTANT',
    );
    expect(persistance.appelsDemander).toBe(1);
  });

  it('UT-US-018-01 lancements suivants — l’état relu suit le navigateur (la carte disparaît quand le stockage devient protégé)', async () => {
    const memoire = new MemoireEspionne(true);
    const persistance = new PersistanceSimulee('NON_PERSISTANT', 'NON_PERSISTANT');
    const cas = new DemanderPersistance({ persistance, memoire });

    expect(await cas.executer()).toBe('NON_PERSISTANT');
    persistance.changerEtat('PERSISTANT');
    expect(await cas.executer()).toBe('PERSISTANT');
    expect(persistance.appelsDemander).toBe(0);
    expect(persistance.appelsEtat).toBe(2);
  });

  it('UT-US-018-02 API absente — INDISPONIBLE rendu, sans erreur, au premier lancement comme aux suivants', async () => {
    const memoire = new MemoireEspionne();
    const persistance = new PersistanceSimulee('INDISPONIBLE', 'INDISPONIBLE');

    await expect(new DemanderPersistance({ persistance, memoire }).executer()).resolves.toBe(
      'INDISPONIBLE',
    );
    await expect(new DemanderPersistance({ persistance, memoire }).executer()).resolves.toBe(
      'INDISPONIBLE',
    );
  });

  it('UT-US-018-06 appels concurrents au premier lancement — une seule demande, un seul drapeau noté, même état rendu à chacun', async () => {
    const memoire = new MemoireEspionne();
    const persistance = new PersistanceSimulee('NON_PERSISTANT', 'PERSISTANT');
    const cas = new DemanderPersistance({ persistance, memoire });

    const etats: ReadonlyArray<EtatPersistance> = await Promise.all([
      cas.executer(),
      cas.executer(),
      cas.executer(),
    ]);

    expect(etats).toEqual(['PERSISTANT', 'PERSISTANT', 'PERSISTANT']);
    expect(persistance.appelsDemander).toBe(1);
    expect(memoire.appels.filter((a) => a === 'noterDemandee')).toHaveLength(1);
  });

  it('UT-US-018-06 après une exécution terminée — un nouvel appel relit l’état (la promesse partagée n’est pas mémorisée à vie)', async () => {
    const memoire = new MemoireEspionne();
    const persistance = new PersistanceSimulee('NON_PERSISTANT', 'NON_PERSISTANT');
    const cas = new DemanderPersistance({ persistance, memoire });

    await cas.executer();
    persistance.changerEtat('PERSISTANT');

    expect(await cas.executer()).toBe('PERSISTANT');
    expect(persistance.appelsEtat).toBe(1);
  });
});
