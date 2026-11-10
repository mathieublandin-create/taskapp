/**
 * Tests complémentaires de `VerrouOngletsWeb` (ST-US-031 v0.4 §4.2, §8, tranche B1), au-delà d'UT-US-031-10 et du
 * contrat : une demande de main abandonnée en attente est retirée de la file (`abort()`), sans rejet non traité,
 * observé sans espion sur `request` (un espion de Vitest attache ses propres gestionnaires à la promesse rendue) ;
 * `verrouOngletsDuNavigateur` lit `navigator.locks` s'il existe.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  verrouOngletsDuNavigateur,
  VerrouOngletsWeb,
} from '@src/synchronisation/infrastructure/verrou-onglets-web';
import { RegistreVerrousSimule } from '@tests/doublures/lock-manager-simule';
import { JournalEnMemoire } from '@tests/support/compte/doublures-compte';
import { barriere, vider } from '@tests/support/synchronisation/onglets';

const NOM = 'donejuan-recette-3f5a9c0e:synchronisation-meneur';

const rejetsNonTraites: Array<unknown> = [];
const surRejet = (motif: unknown): void => {
  rejetsNonTraites.push(motif);
};

beforeEach(() => {
  rejetsNonTraites.length = 0;
  process.on('unhandledRejection', surRejet);
});

afterEach(() => {
  process.off('unhandledRejection', surRejet);
  vi.unstubAllGlobals();
});

describe('VerrouOngletsWeb, compléments (ST-US-031 §4.2)', () => {
  it('UT-COMP-US-031-1 rendre une demande en attente — retirée de la file aussitôt, l’autre onglet tient toujours ; aucun rejet non traité', async () => {
    const registre = new RegistreVerrousSimule();
    const journal = new JournalEnMemoire();
    const ici = new VerrouOngletsWeb({ gestionnaire: registre.client('client-1'), journal });
    const autre = new VerrouOngletsWeb({ gestionnaire: registre.client('client-2'), journal });
    const fin = barriere();
    const tenue = autre.executerExclusivement(NOM, () => fin.promesse);
    await vider();
    const obtenues: Array<string> = [];
    const rendre = ici.demanderLaMain(NOM, () => obtenues.push('jamais'));
    await vider();
    expect((await registre.client('observateur').query()).pending).toHaveLength(1);

    rendre();
    await vider();

    const instantane = await registre.client('observateur').query();
    expect(instantane.pending).toEqual([]);
    expect(instantane.held).toEqual([{ name: NOM, mode: 'exclusive', clientId: 'client-2' }]);
    expect(rejetsNonTraites).toEqual([]);
    fin.ouvrir();
    await tenue;
    await vider();
    expect(obtenues).toEqual([]);
    expect(registre.demandes).toBe(2);
    expect(journal.entrees).toEqual([]);
  });

  it('UT-COMP-US-031-2 verrouOngletsDuNavigateur — navigator.locks présent : utilisé ; absent : exécution directe et entrée erreur au premier appel', async () => {
    const registre = new RegistreVerrousSimule();
    vi.stubGlobal('navigator', { locks: registre.client('page') });
    const journal = new JournalEnMemoire();
    const avecApi = verrouOngletsDuNavigateur(journal);
    expect(await avecApi.executerExclusivement(NOM, () => Promise.resolve('fait'))).toBe('fait');
    expect(registre.demandes).toBe(1);
    expect(journal.entrees).toEqual([]);

    vi.stubGlobal('navigator', {});
    const sansApi = verrouOngletsDuNavigateur(journal);
    expect(journal.entrees).toEqual([]);
    expect(await sansApi.estTenu(NOM)).toBe(false);
    expect(await sansApi.executerExclusivement(NOM, () => Promise.resolve('direct'))).toBe(
      'direct',
    );
    expect(registre.demandes).toBe(1);
    expect(journal.entrees).toEqual([{ niveau: 'erreur', evenement: 'VerrouOngletsIndisponible' }]);
  });
});
