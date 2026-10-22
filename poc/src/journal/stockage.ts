import type { EntreeJournal, StockageJournal } from './journal';

export class StockageMemoire implements StockageJournal {
  private entrees: EntreeJournal[] = [];
  async charger(): Promise<EntreeJournal[]> {
    return [...this.entrees];
  }
  async ajouter(entree: EntreeJournal): Promise<void> {
    this.entrees.push(entree);
  }
  async vider(): Promise<void> {
    this.entrees = [];
  }
}

/** Android : localStorage (spécification §6). */
export class StockageLocalStorage implements StockageJournal {
  constructor(
    private readonly cle = 'poc.journal',
    private readonly stockage: Storage = localStorage,
  ) {}
  async charger(): Promise<EntreeJournal[]> {
    const brut = this.stockage.getItem(this.cle);
    return brut === null ? [] : (JSON.parse(brut) as EntreeJournal[]);
  }
  async ajouter(entree: EntreeJournal): Promise<void> {
    this.stockage.setItem(this.cle, JSON.stringify([...(await this.charger()), entree]));
  }
  async vider(): Promise<void> {
    this.stockage.removeItem(this.cle);
  }
}

/** PC : IndexedDB (spécification §6). */
export class StockageIndexedDb implements StockageJournal {
  private static readonly TABLE = 'entrees';
  private base: Promise<IDBDatabase> | null = null;

  constructor(private readonly nom = 'poc-journal') {}

  private ouvrir(): Promise<IDBDatabase> {
    this.base ??= new Promise((resolve, reject) => {
      const requete = indexedDB.open(this.nom, 1);
      requete.onupgradeneeded = () =>
        requete.result.createObjectStore(StockageIndexedDb.TABLE, { keyPath: 'id' });
      requete.onsuccess = () => resolve(requete.result);
      requete.onerror = () => reject(requete.error);
    });
    return this.base;
  }

  private async executer<T>(
    mode: IDBTransactionMode,
    action: (table: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    const base = await this.ouvrir();
    return new Promise((resolve, reject) => {
      const requete = action(
        base.transaction(StockageIndexedDb.TABLE, mode).objectStore(StockageIndexedDb.TABLE),
      );
      requete.onsuccess = () => resolve(requete.result);
      requete.onerror = () => reject(requete.error);
    });
  }

  charger(): Promise<EntreeJournal[]> {
    return this.executer('readonly', (t) => t.getAll() as IDBRequest<EntreeJournal[]>);
  }
  async ajouter(entree: EntreeJournal): Promise<void> {
    await this.executer('readwrite', (t) => t.put(entree));
  }
  async vider(): Promise<void> {
    await this.executer('readwrite', (t) => t.clear());
  }
}
