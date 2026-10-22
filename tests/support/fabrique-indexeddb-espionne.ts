/**
 * IDBFactory de `fake-indexeddb` instrumentée (ST-socle-ecriture.md §4.4, §13 ; conventions.md §10.1) :
 * observe le mode et la durabilité de chaque transaction ouverte par l'adaptateur, et l'événement
 * `complete` ; peut avorter les transactions d'écriture pour simuler une écriture qui échoue.
 * Elle ne remplace pas le code testé : la base reste celle de `fake-indexeddb`.
 */
import { IDBFactory } from 'fake-indexeddb';

export type TransactionObservee = {
  readonly mode: IDBTransactionMode;
  readonly durabilite: IDBTransactionDurability;
  /** Vrai une fois l'événement `complete` reçu. */
  readonly terminee: () => boolean;
};

export class FabriqueIndexedDbEspionne extends IDBFactory {
  private readonly observees: Array<TransactionObservee> = [];
  private avorterEcritures = false;

  /** Toutes les transactions ouvertes depuis la création de la fabrique, dans l'ordre. */
  transactions(): ReadonlyArray<TransactionObservee> {
    return [...this.observees];
  }

  ecritures(): ReadonlyArray<TransactionObservee> {
    return this.observees.filter((t) => t.mode === 'readwrite');
  }

  /** Les transactions d'écriture ouvertes ensuite sont avortées avant leur validation. */
  avorterLesEcritures(): void {
    this.avorterEcritures = true;
  }

  retablirLesEcritures(): void {
    this.avorterEcritures = false;
  }

  override open(nom: string, version?: number): IDBOpenDBRequest {
    const requete = super.open(nom, version);
    requete.addEventListener('success', () => {
      this.instrumenter(requete.result);
    });
    return requete;
  }

  private instrumenter(base: IDBDatabase): void {
    const ouvrir = base.transaction.bind(base);
    base.transaction = (tables, mode, options) => {
      const transaction = ouvrir(tables, mode, options);
      this.observer(transaction);
      if (this.avorterEcritures && transaction.mode === 'readwrite') {
        queueMicrotask(() => {
          transaction.abort();
        });
      }
      return transaction;
    };
  }

  private observer(transaction: IDBTransaction): void {
    let terminee = false;
    transaction.addEventListener('complete', () => {
      terminee = true;
    });
    this.observees.push({
      mode: transaction.mode,
      durabilite: transaction.durability,
      terminee: () => terminee,
    });
  }
}
