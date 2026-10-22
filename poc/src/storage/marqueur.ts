/** Marqueur IndexedDB horodaté : sert à vérifier la durabilité après arrêt forcé ou redémarrage. */

export interface Marqueur {
  /** Instant de la pose, en ISO UTC. */
  poseLe: string;
  /** Identifiant aléatoire : distingue deux poses successives. */
  identifiant: string;
}

export interface StockageMarqueur {
  poser(maintenant: Date): Promise<Marqueur>;
  lire(): Promise<Marqueur | null>;
}

const TABLE = 'marqueur';
const CLE = 'durabilite';

export class MarqueurIndexedDb implements StockageMarqueur {
  private base: Promise<IDBDatabase> | null = null;

  constructor(private readonly nom = 'poc-marqueur') {}

  private ouvrir(): Promise<IDBDatabase> {
    this.base ??= new Promise((resolve, reject) => {
      const requete = indexedDB.open(this.nom, 1);
      requete.onupgradeneeded = () => requete.result.createObjectStore(TABLE);
      requete.onsuccess = () => resolve(requete.result);
      requete.onerror = () => reject(requete.error);
    });
    return this.base;
  }

  private async lireTable<T>(action: (table: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const base = await this.ouvrir();
    return new Promise((resolve, reject) => {
      const requete = action(base.transaction(TABLE, 'readonly').objectStore(TABLE));
      requete.onsuccess = () => resolve(requete.result);
      requete.onerror = () => reject(requete.error);
    });
  }

  /**
   * Écriture en durabilité stricte (mode retenu pour la production, ADR-013). La promesse n'est
   * résolue qu'à l'événement `complete` de la transaction, pas au succès de la requête.
   */
  async poser(maintenant: Date): Promise<Marqueur> {
    const marqueur = { poseLe: maintenant.toISOString(), identifiant: crypto.randomUUID() };
    const base = await this.ouvrir();
    await new Promise<void>((resolve, reject) => {
      const transaction = base.transaction(TABLE, 'readwrite', { durability: 'strict' });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error ?? new Error('transaction_annulee'));
      transaction.objectStore(TABLE).put(marqueur, CLE);
    });
    return marqueur;
  }

  async lire(): Promise<Marqueur | null> {
    const valeur = await this.lireTable((t) => t.get(CLE) as IDBRequest<Marqueur | undefined>);
    return valeur ?? null;
  }
}
