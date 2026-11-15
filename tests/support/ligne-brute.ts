import type { IDBFactory } from 'fake-indexeddb';

/** Écrit une ligne brute dans une table IndexedDB, hors de Dexie (situation impossible à produire par l'application). */
export const ecrireLigneBrute = (
  fabrique: IDBFactory,
  nomBase: string,
  table: string,
  ligne: unknown,
): Promise<void> =>
  new Promise((resoudre, rejeter) => {
    const ouverture = fabrique.open(nomBase);
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
