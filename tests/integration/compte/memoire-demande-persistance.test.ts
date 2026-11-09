/** ST-US-018 v0.4 §4.1, §5 (rang 12, tranche B1) : drapeau `persistanceDemandee` de la base technique (fake-indexeddb). */
import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import {
  BaseTechnique,
  MemoireDemandePersistanceDexie,
  nomBaseTechnique,
} from '@src/compte/infrastructure/base-technique';

const ouvrir = (fabrique: IDBFactory, invalides: Array<string> = []) => {
  const base = new BaseTechnique({
    env: 'recette',
    fabrique,
    surLigneInvalide: (table) => invalides.push(table),
  });
  return { base, memoire: new MemoireDemandePersistanceDexie(base) };
};

const lireBrut = (fabrique: IDBFactory, cle: string): Promise<unknown> =>
  new Promise((resoudre, rejeter) => {
    const ouverture = fabrique.open(nomBaseTechnique('recette'));
    ouverture.onsuccess = () => {
      const requete = ouverture.result
        .transaction('installation', 'readonly')
        .objectStore('installation')
        .get(cle);
      requete.onsuccess = () => {
        ouverture.result.close();
        resoudre(requete.result);
      };
      requete.onerror = () => {
        rejeter(new Error('lecture brute impossible'));
      };
    };
  });

const ecrireBrut = (fabrique: IDBFactory, ligne: unknown): Promise<void> =>
  new Promise((resoudre, rejeter) => {
    const ouverture = fabrique.open(nomBaseTechnique('recette'));
    ouverture.onsuccess = () => {
      const transaction = ouverture.result.transaction('installation', 'readwrite');
      transaction.objectStore('installation').put(ligne);
      transaction.oncomplete = () => {
        ouverture.result.close();
        resoudre();
      };
      transaction.onerror = () => {
        rejeter(new Error('écriture brute impossible'));
      };
    };
  });

describe('MemoireDemandePersistanceDexie (ST-US-018 §5)', () => {
  it('UT-US-018-08 base neuve — faux ; après noterDemandee — vrai, relu par une autre instance ; ligne { cle: persistanceDemandee, demandee: true }', async () => {
    const fabrique = new IDBFactory();
    const premiere = ouvrir(fabrique);

    expect(await premiere.memoire.dejaDemandee()).toBe(false);
    await premiere.memoire.noterDemandee();
    expect(await premiere.memoire.dejaDemandee()).toBe(true);
    premiere.base.fermer();

    const seconde = ouvrir(fabrique);
    expect(await seconde.memoire.dejaDemandee()).toBe(true);
    seconde.base.fermer();
    expect(await lireBrut(fabrique, 'persistanceDemandee')).toEqual({
      cle: 'persistanceDemandee',
      demandee: true,
    });
  });

  it('UT-US-018-08 base fermée — dejaDemandee rend faux et noterDemandee se résout sans erreur ni écriture', async () => {
    const fabrique = new IDBFactory();
    const { base, memoire } = ouvrir(fabrique);
    expect(await memoire.dejaDemandee()).toBe(false); // ouvre (et crée) la base avant de la fermer
    base.fermer();

    await expect(memoire.dejaDemandee()).resolves.toBe(false);
    await expect(memoire.noterDemandee()).resolves.toBeUndefined();
    expect(await lireBrut(fabrique, 'persistanceDemandee')).toBeUndefined();
  });

  it('UT-US-018-08 ligne invalide — faux, et la table « installation » est signalée une fois', async () => {
    const fabrique = new IDBFactory();
    const preparation = ouvrir(fabrique);
    await preparation.memoire.noterDemandee();
    preparation.base.fermer();
    await ecrireBrut(fabrique, { cle: 'persistanceDemandee', demandee: 'oui' });
    const invalides: Array<string> = [];
    const { base, memoire } = ouvrir(fabrique, invalides);

    expect(await memoire.dejaDemandee()).toBe(false);
    expect(invalides).toEqual(['installation']);
    base.fermer();
  });
});
