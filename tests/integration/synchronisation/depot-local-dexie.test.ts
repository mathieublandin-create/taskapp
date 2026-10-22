import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { registre } from '@tests/support/fabriques/etat-local';
import { valeurDe } from '@tests/support/environnement';
import { planAjoutant } from '@tests/support/plans';
import { hlc, idObjectif, instant, SMARTPHONE } from '@tests/support/valeurs';

const NOM_BASE = 'done-juan-integration';
const O = idObjectif(1);
const h = hlc('2026-10-21T08:00:00.000Z', 0, SMARTPHONE);

const nouveauDepot = (fabrique: IDBFactory) =>
  new DepotLocalDexie({ nomBase: NOM_BASE, fabrique, appareilId: SMARTPHONE });

/** Écrit une ligne brute dans une table IndexedDB, hors de Dexie (situation impossible à produire par l'application). */
const ecrireLigneBrute = (fabrique: IDBFactory, table: string, ligne: unknown): Promise<void> =>
  new Promise((resoudre, rejeter) => {
    const ouverture = fabrique.open(NOM_BASE);
    ouverture.onerror = () => {
      rejeter(new Error('ouverture impossible'));
    };
    ouverture.onsuccess = () => {
      const base = ouverture.result;
      const transaction = base.transaction(table, 'readwrite');
      transaction.objectStore(table).put(ligne);
      transaction.oncomplete = () => {
        base.close();
        resoudre();
      };
      transaction.onerror = () => {
        rejeter(new Error('écriture impossible'));
      };
    };
  });

describe('DepotLocalDexie (ST-socle-ecriture.md §4.4, §5.1)', () => {
  it('UT-SOC-40 DepotLocalDexie — restitue un délai absent (stocké null) et un Instant (stocké en ISO) à la relecture', async () => {
    const fabrique = new IDBFactory();
    const depot = nouveauDepot(fabrique);
    const registres = [
      registre(
        { type: 'OBJECTIF', id: O, champ: 'creation' },
        { creeLe: instant('2026-10-21T08:00:00.123Z') },
        h,
      ),
      registre({ type: 'OBJECTIF', id: O, champ: 'delai' }, undefined, h),
    ];

    valeurDe(
      await depot.appliquer((etat) =>
        succes({ plan: planAjoutant(etat, { registres, dernierHlc: h }), valeur: undefined }),
      ),
    );
    const relu = valeurDe(await nouveauDepot(fabrique).lire());

    expect([...relu.registres.values()]).toEqual(registres);
  });

  it('UT-SOC-41 DepotLocalDexie.lire — renvoie DonneesLocalesIllisibles quand une ligne de registres est corrompue (conventions.md §6.2)', async () => {
    const fabrique = new IDBFactory();
    valeurDe(await nouveauDepot(fabrique).lire());
    await ecrireLigneBrute(fabrique, 'registres', {
      cle: `OBJECTIF/${O}/delai`,
      type: 'OBJECTIF',
      id: O,
      champ: 'delai',
      valeur: 42,
      hlc: 'illisible',
      contexte: {},
    });

    const resultat = await nouveauDepot(fabrique).lire();

    expect(resultat).toEqual(echec({ type: 'DonneesLocalesIllisibles' }));
  });
});
