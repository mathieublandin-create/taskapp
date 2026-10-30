import Dexie from 'dexie';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { valeurDe } from '@tests/support/environnement';
import { SMARTPHONE } from '@tests/support/valeurs';

// ST-US-017 v0.4.4 §6.9 n° 4 (revue E13 d'ANO-001, RC-ANO-001-1) : la fermeture d'un espace retire l'écoute globale
// des autres instances (`Dexie.on('storagemutated')`), même si des observateurs n'ont pas été désabonnés (relais de la
// composition, abonné pour toute la vie de l'espace).

const depotSur = (fabrique: IDBFactory) =>
  new DepotLocalDexie({ nomBase: 'done-juan-fermeture', fabrique, appareilId: SMARTPHONE });

describe('DepotLocalDexie — fermeture (ST-US-017 §6.9 n° 4)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('UT-COMP-US-017-56 fermer — retire l’écoute des autres instances, une seule fois, observateurs encore abonnés', async () => {
    const depot = depotSur(new IDBFactory());
    valeurDe(await depot.lire());
    depot.observer(() => undefined);
    depot.observer(() => undefined);
    const retrait = vi.spyOn(Dexie.on('storagemutated'), 'unsubscribe');

    depot.fermer();
    depot.fermer();

    expect(retrait).toHaveBeenCalledTimes(1);
  });

  it('UT-COMP-US-017-57 fermer — un désabonnement tardif ne retire rien de plus et ne lève pas', async () => {
    const depot = depotSur(new IDBFactory());
    valeurDe(await depot.lire());
    const desabonner = depot.observer(() => undefined);
    const retrait = vi.spyOn(Dexie.on('storagemutated'), 'unsubscribe');

    depot.fermer();
    desabonner();

    expect(retrait).toHaveBeenCalledTimes(1);
  });
});
