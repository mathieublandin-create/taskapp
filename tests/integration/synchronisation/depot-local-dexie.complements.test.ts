import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import { echec, succes } from '@src/commun/domaine/resultat';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { registre } from '@tests/support/fabriques/etat-local';
import { valeurDe } from '@tests/support/environnement';
import { planAjoutant } from '@tests/support/plans';
import { hlc, idObjectif, instant, SMARTPHONE, PC } from '@tests/support/valeurs';

const NOM_BASE = 'done-juan-complements';
const O = idObjectif(1);
const h = hlc('2026-10-21T08:00:00.000Z', 0, SMARTPHONE);
const creation = registre(
  { type: 'OBJECTIF', id: O, champ: 'creation' },
  { creeLe: instant('2026-10-21T08:00:00.000Z') },
  h,
);

const depotSur = (fabrique: IDBFactory, appareilId = SMARTPHONE) =>
  new DepotLocalDexie({ nomBase: NOM_BASE, fabrique, appareilId });

const ecrireCreation = (depot: DepotLocalDexie) =>
  depot.appliquer((etat) =>
    succes({ plan: planAjoutant(etat, { registres: [creation], dernierHlc: h }), valeur: 'fait' }),
  );

const attendre = async (condition: () => boolean): Promise<void> => {
  for (let i = 0; i < 100 && !condition(); i += 1) {
    await new Promise((resoudre) => setTimeout(resoudre, 5));
  }
};

/** IDBFactory dont les écritures échouent, comme un disque plein, une fois `saturer()` appelée. */
class FabriqueQuota extends IDBFactory {
  private saturee = false;

  saturer(): void {
    this.saturee = true;
  }

  override open(nom: string, version?: number): IDBOpenDBRequest {
    const requete = super.open(nom, version);
    requete.addEventListener('success', () => {
      const base = requete.result;
      const ouvrir = base.transaction.bind(base);
      base.transaction = (tables, mode, options) => {
        const transaction = ouvrir(tables, mode, options);
        if (this.saturee && mode === 'readwrite') this.refuserLesEcritures(transaction);
        return transaction;
      };
    });
    return requete;
  }

  private refuserLesEcritures(transaction: IDBTransaction): void {
    const ouvrirTable = transaction.objectStore.bind(transaction);
    transaction.objectStore = (nom) => {
      const table = ouvrirTable(nom);
      table.put = () => {
        throw new DOMException('Quota dépassé', 'QuotaExceededError');
      };
      return table;
    };
  }
}

describe('DepotLocalDexie — compléments (ST-socle-ecriture.md §8, §14)', () => {
  it('UT-COMP-40 observer — prévient l’observateur d’une instance quand une autre instance écrit', async () => {
    const fabrique = new IDBFactory();
    const observatrice = depotSur(fabrique);
    const ecrivaine = depotSur(fabrique);
    valeurDe(await observatrice.lire());
    let appels = 0;
    const desabonner = observatrice.observer(() => {
      appels += 1;
    });

    valeurDe(await ecrireCreation(ecrivaine));
    await attendre(() => appels > 0);
    desabonner();

    expect(appels).toBe(1);
    expect(valeurDe(await observatrice.lire()).version).toBe(1);
  });

  it('UT-COMP-41 appliquer — traduit une erreur de quota de la base en EcritureLocaleImpossible, sans mise à jour du cache', async () => {
    const fabrique = new FabriqueQuota();
    const depot = depotSur(fabrique);
    valeurDe(await depot.lire());
    fabrique.saturer();

    const resultat = await ecrireCreation(depot);

    expect(resultat).toEqual(echec({ type: 'EcritureLocaleImpossible' }));
    expect(valeurDe(await depotSur(fabrique).lire()).version).toBe(0);
    expect(valeurDe(await depot.lire()).registres.size).toBe(0);
  });

  it('UT-COMP-42 lire — refuse un espace ouvert par un autre appareil (ErreurProgrammation)', async () => {
    const fabrique = new IDBFactory();
    valeurDe(await depotSur(fabrique, SMARTPHONE).lire());

    await expect(depotSur(fabrique, PC).lire()).rejects.toThrow(ErreurProgrammation);
  });

  it('UT-COMP-43 appareil — rend l’identifiant donné au constructeur', () => {
    expect(depotSur(new IDBFactory(), PC).appareil()).toBe(PC);
  });
});
