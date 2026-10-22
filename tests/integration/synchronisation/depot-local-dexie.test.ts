import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { FabriqueIndexedDbEspionne } from '@tests/support/fabrique-indexeddb-espionne';
import { registre } from '@tests/support/fabriques/etat-local';
import { valeurDe } from '@tests/support/environnement';
import { planAjoutant } from '@tests/support/plans';
import { hlc, idObjectif, instant, SMARTPHONE } from '@tests/support/valeurs';

const NOM_BASE = 'done-juan-integration';
const O = idObjectif(1);
const h = hlc('2026-10-21T08:00:00.000Z', 0, SMARTPHONE);

const nouveauDepot = (fabrique: IDBFactory) =>
  new DepotLocalDexie({ nomBase: NOM_BASE, fabrique, appareilId: SMARTPHONE });

const registreDeCreation = () =>
  registre(
    { type: 'OBJECTIF', id: O, champ: 'creation' },
    { creeLe: instant('2026-10-21T08:00:00.000Z') },
    h,
  );

/** Applique un plan qui écrit un registre ; renvoie le résultat brut d'`appliquer`. */
const ecrireUnRegistre = (depot: DepotLocalDexie) =>
  depot.appliquer((etat) =>
    succes({
      plan: planAjoutant(etat, { registres: [registreDeCreation()], dernierHlc: h }),
      valeur: undefined,
    }),
  );

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

  it('UT-SOC-44 DepotLocalDexie.appliquer — ouvre chaque transaction d’écriture en durabilité stricte (conventions.md §10.1, ADR-013)', async () => {
    const fabrique = new FabriqueIndexedDbEspionne();

    valeurDe(await ecrireUnRegistre(nouveauDepot(fabrique)));

    const ecritures = fabrique.ecritures();
    expect(ecritures.length).toBeGreaterThan(0);
    expect(ecritures.map((t) => t.durabilite)).toEqual(ecritures.map(() => 'strict'));
  });

  it('UT-SOC-45 DepotLocalDexie.appliquer — ne confirme l’écriture qu’après l’événement complete de sa transaction (conventions.md §10.1, US-018 CA-5)', async () => {
    const fabrique = new FabriqueIndexedDbEspionne();

    valeurDe(await ecrireUnRegistre(nouveauDepot(fabrique)));

    const ecritures = fabrique.ecritures();
    expect(ecritures.length).toBeGreaterThan(0);
    expect(ecritures.map((t) => t.terminee())).toEqual(ecritures.map(() => true));
  });

  it('UT-SOC-46 DepotLocalDexie.appliquer — renvoie EcritureLocaleImpossible et ne laisse rien en base quand la transaction d’écriture est avortée (§8 n° 3)', async () => {
    const fabrique = new FabriqueIndexedDbEspionne();
    valeurDe(await nouveauDepot(fabrique).lire());
    fabrique.avorterLesEcritures();

    const resultat = await ecrireUnRegistre(nouveauDepot(fabrique));

    expect(resultat).toEqual(echec({ type: 'EcritureLocaleImpossible' }));
    fabrique.retablirLesEcritures();
    const relu = valeurDe(await nouveauDepot(fabrique).lire());
    expect(relu.version).toBe(0);
    expect(relu.registres.size).toBe(0);
  });
});
