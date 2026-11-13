/**
 * ST-US-018 v0.4 §5, §8 (rang 12, tranche B1), tests complémentaires de Bruce : drapeau `persistanceDemandee` de la
 * base technique (fake-indexeddb). Ligne absente non signalée ; `demandee: false` invalide ; base fermée après usage
 * sans écriture ; drapeau indépendant des lignes `session` et `redirection`. UT-COMP-US-018-4 à 7.
 */
import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import {
  BaseTechnique,
  MemoireDemandePersistanceDexie,
  MemoireSessionDexie,
  nomBaseTechnique,
} from '@src/compte/infrastructure/base-technique';
import { AdresseGoogle, IdCompte } from '@src/compte/domaine/identite';

const ouvrir = (fabrique: IDBFactory, invalides: Array<string> = []) => {
  const base = new BaseTechnique({
    env: 'recette',
    fabrique,
    surLigneInvalide: (table) => invalides.push(table),
  });
  return { base, memoire: new MemoireDemandePersistanceDexie(base) };
};

/** Toutes les lignes d'une table de la base technique, lues sans Dexie. */
const lignesBrutes = (fabrique: IDBFactory, table: string): Promise<ReadonlyArray<unknown>> =>
  new Promise((resoudre, rejeter) => {
    const ouverture = fabrique.open(nomBaseTechnique('recette'));
    ouverture.onsuccess = () => {
      const requete = ouverture.result.transaction(table, 'readonly').objectStore(table).getAll();
      requete.onsuccess = () => {
        ouverture.result.close();
        resoudre(requete.result);
      };
      requete.onerror = () => {
        rejeter(new Error('lecture brute impossible'));
      };
    };
  });

const remplacerBrut = (fabrique: IDBFactory, ligne: unknown): Promise<void> =>
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

const identite = () => {
  const compte = IdCompte.depuisSub('sub-a');
  const adresse = AdresseGoogle.depuisTexte('a@exemple.test');
  if (!compte.ok || !adresse.ok) throw new Error('identité de test invalide');
  return { compte: compte.valeur, adresse: adresse.valeur };
};

describe('MemoireDemandePersistanceDexie — compléments (ST-US-018 §5)', () => {
  it('UT-COMP-US-018-4 ligne absente — faux, sans signalement (seule une ligne présente et invalide est signalée)', async () => {
    const invalides: Array<string> = [];
    const { base, memoire } = ouvrir(new IDBFactory(), invalides);

    expect(await memoire.dejaDemandee()).toBe(false);
    expect(invalides).toEqual([]);
    base.fermer();
  });

  it('UT-COMP-US-018-5 ligne { demandee: false } — invalide (seul true est admis) : faux et table signalée', async () => {
    const fabrique = new IDBFactory();
    const preparation = ouvrir(fabrique);
    await preparation.memoire.noterDemandee();
    preparation.base.fermer();
    await remplacerBrut(fabrique, { cle: 'persistanceDemandee', demandee: false });
    const invalides: Array<string> = [];
    const { base, memoire } = ouvrir(fabrique, invalides);

    expect(await memoire.dejaDemandee()).toBe(false);
    expect(invalides).toEqual(['installation']);
    base.fermer();
  });

  it('UT-COMP-US-018-6 base fermée après usage — dejaDemandee faux, noterDemandee résolue sans aucune écriture', async () => {
    const fabrique = new IDBFactory();
    const { base, memoire } = ouvrir(fabrique);
    expect(await memoire.dejaDemandee()).toBe(false);
    base.fermer();

    await expect(memoire.noterDemandee()).resolves.toBeUndefined();
    await expect(memoire.dejaDemandee()).resolves.toBe(false);
    expect(await lignesBrutes(fabrique, 'installation')).toEqual([]);
  });

  it('UT-COMP-US-018-7 drapeau et session coexistent — chacun sa ligne, dans sa table, sans écraser l’autre', async () => {
    const fabrique = new IDBFactory();
    const { base, memoire } = ouvrir(fabrique);
    const session = new MemoireSessionDexie(base);

    await session.ecrire({ identite: identite(), accesPerdu: false });
    await memoire.noterDemandee();
    base.fermer();

    expect(await lignesBrutes(fabrique, 'installation')).toEqual([
      { cle: 'persistanceDemandee', demandee: true },
    ]);
    expect(await lignesBrutes(fabrique, 'session')).toEqual([
      { cle: 'session', sub: 'sub-a', adresse: 'a@exemple.test', accesPerdu: false },
    ]);
    const relue = ouvrir(fabrique);
    expect(await relue.memoire.dejaDemandee()).toBe(true);
    expect((await new MemoireSessionDexie(relue.base).lire())?.identite).toEqual(identite());
    relue.base.fermer();
  });
});
