/**
 * ST-US-018 v0.4 §6.3 n° 2 (rang 12, tranche B1), tests complémentaires de Bruce : la demande n'est notée qu'après la
 * réponse du navigateur (une page fermée pendant la demande la refera), et une exécution en cours est partagée même
 * si elle se termine par un refus. UT-COMP-US-018-1 à 3.
 */
import { describe, expect, it } from 'vitest';
import type {
  EtatPersistance,
  MemoireDemandePersistance,
  PersistanceStockage,
} from '@src/commun/application/ports/persistance-stockage';
import { DemanderPersistance } from '@src/synchronisation/application/cas-usage/demander-persistance';

/** Journal unique et ordonné des appels aux deux ports ; la réponse de `persist()` est libérée par le test. */
const preparer = (dejaDemandee = false) => {
  const journal: Array<string> = [];
  const reponses: Array<(etat: EtatPersistance) => void> = [];
  let demandee = dejaDemandee;
  const persistance: PersistanceStockage = {
    etat: () => {
      journal.push('etat');
      return Promise.resolve('NON_PERSISTANT');
    },
    demander: () => {
      journal.push('demander');
      return new Promise((resoudre) => reponses.push(resoudre));
    },
  };
  const memoire: MemoireDemandePersistance = {
    dejaDemandee: () => {
      journal.push('dejaDemandee');
      return Promise.resolve(demandee);
    },
    noterDemandee: () => {
      journal.push('noterDemandee');
      demandee = true;
      return Promise.resolve();
    },
  };
  const repondre = (etat: EtatPersistance): void => {
    for (const resoudre of reponses.splice(0)) resoudre(etat);
  };
  return { journal, repondre, cas: new DemanderPersistance({ persistance, memoire }) };
};

/** Laisse s'écouler les continuations en attente (microtâches). */
const laisserFiler = async (): Promise<void> => {
  for (let i = 0; i < 10; i += 1) await Promise.resolve();
};

describe('DemanderPersistance — compléments (ST-US-018 §6.3 n° 2)', () => {
  it('UT-COMP-US-018-1 premier lancement — tant que persist() n’a pas répondu, la demande n’est pas notée ; notée juste après la réponse', async () => {
    const { journal, repondre, cas } = preparer();

    const execution = cas.executer();
    await laisserFiler();

    expect(journal).toEqual(['dejaDemandee', 'demander']);

    repondre('PERSISTANT');

    expect(await execution).toBe('PERSISTANT');
    expect(journal).toEqual(['dejaDemandee', 'demander', 'noterDemandee']);
  });

  it('UT-COMP-US-018-2 appel pendant une demande refusée — le second appel reçoit le refus, sans seconde demande ni seconde lecture', async () => {
    const { journal, repondre, cas } = preparer();

    const premier = cas.executer();
    await laisserFiler();
    const second = cas.executer();
    repondre('NON_PERSISTANT');

    expect(await Promise.all([premier, second])).toEqual(['NON_PERSISTANT', 'NON_PERSISTANT']);
    expect(journal).toEqual(['dejaDemandee', 'demander', 'noterDemandee']);
  });

  it('UT-COMP-US-018-3 lancements suivants concurrents — une seule lecture de persisted(), jamais de demande', async () => {
    const { journal, cas } = preparer(true);

    const etats = await Promise.all([cas.executer(), cas.executer()]);

    expect(etats).toEqual(['NON_PERSISTANT', 'NON_PERSISTANT']);
    expect(journal).toEqual(['dejaDemandee', 'etat']);
  });
});
