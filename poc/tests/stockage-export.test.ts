import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { exporterCsv, exporterJson } from '../src/journal/export';
import { Journal } from '../src/journal/journal';
import { StockageIndexedDb, StockageLocalStorage, StockageMemoire } from '../src/journal/stockage';

describe('stockage du journal', () => {
  it.each([
    ['mémoire', () => new StockageMemoire()],
    ['localStorage', () => new StockageLocalStorage('test.journal')],
    ['IndexedDB', () => new StockageIndexedDb('test-journal')],
  ])('conserve, relit et vide (%s)', async (_nom, creer) => {
    const journal = new Journal(creer(), 'pc');
    await journal.vider();
    await journal.enregistrer({ mesure: 'R1', operation: 'a', resultat: 'OK' });
    await journal.enregistrer({ mesure: 'R2', operation: 'b', resultat: 'OK' });
    expect(await journal.lire()).toHaveLength(2);
    await journal.vider();
    expect(await journal.lire()).toHaveLength(0);
  });

  it('trie le plus récent en haut', async () => {
    let t = 0;
    const journal = new Journal(new StockageMemoire(), 'pc', () => new Date(2026, 0, 1, 0, 0, t++));
    await journal.enregistrer({ mesure: 'R1', operation: 'premier', resultat: 'OK' });
    await journal.enregistrer({ mesure: 'R1', operation: 'second', resultat: 'OK' });
    expect((await journal.lire()).map((e) => e.operation)).toEqual(['second', 'premier']);
  });
});

describe('export', () => {
  it('produit un JSON et un CSV échappé', async () => {
    const journal = new Journal(new StockageMemoire(), 'pc');
    await journal.enregistrer({
      mesure: 'R1',
      operation: 'op',
      resultat: 'OK',
      detail: 'a, "b"\nc',
    });
    const entrees = await journal.lire();
    expect(JSON.parse(exporterJson(entrees))).toHaveLength(1);
    const csv = exporterCsv(entrees);
    expect(csv.split('\n')[0]).toContain('horodatageUtc');
    expect(csv).toContain('"a, ""b""\nc"');
  });
});
