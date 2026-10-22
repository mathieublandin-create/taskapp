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

  private async executer<T>(
    mode: IDBTransactionMode,
    action: (table: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    const base = await this.ouvrir();
    return new Promise((resolve, reject) => {
      const requete = action(base.transaction(TABLE, mode).objectStore(TABLE));
      requete.onsuccess = () => resolve(requete.result);
      requete.onerror = () => reject(requete.error);
    });
  }

  async poser(maintenant: Date): Promise<Marqueur> {
    const marqueur = { poseLe: maintenant.toISOString(), identifiant: crypto.randomUUID() };
    await this.executer('readwrite', (t) => t.put(marqueur, CLE));
    return marqueur;
  }

  async lire(): Promise<Marqueur | null> {
    const valeur = await this.executer(
      'readonly',
      (t) => t.get(CLE) as IDBRequest<Marqueur | undefined>,
    );
    return valeur ?? null;
  }
}
