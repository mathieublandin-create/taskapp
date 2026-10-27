import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import type { GenerateurIdentifiants } from '@src/commun/application/ports/generateur-identifiants';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { valeurDe } from '@tests/support/environnement';

const NOM_ESPACE = `donejuan-recette-${'a'.repeat(64)}`;

/** Générateur à liste fixe : chaque appel rend l'identifiant suivant et est compté. */
class GenerateurListe implements GenerateurIdentifiants {
  appels = 0;
  constructor(private readonly uuids: ReadonlyArray<string>) {}
  genererUuidV7(): string {
    const uuid = this.uuids[this.appels];
    this.appels += 1;
    if (uuid === undefined) throw new Error('plus aucun identifiant prévu');
    return uuid;
  }
}

const ID_1 = '00000000-0000-7000-8000-0000000000a1';
const ID_2 = '00000000-0000-7000-8000-0000000000a2';

const supprimerBase = (fabrique: IDBFactory, nom: string): Promise<void> =>
  new Promise((resoudre, rejeter) => {
    const demande = fabrique.deleteDatabase(nom);
    demande.onsuccess = () => {
      resoudre();
    };
    demande.onerror = () => {
      rejeter(new Error('suppression impossible'));
    };
  });

describe('DepotLocalDexie.ouvrirEspace (DAT v0.11.3 §4.1.4, Q-ST022-STA-3 ; ST-US-022 §5.2)', () => {
  it('UT-US-022-55 ouvrirEspace — l’appareilId naît avec l’espace et est relu à la réouverture', async () => {
    const fabrique = new IDBFactory();
    const generateur = new GenerateurListe([ID_1, ID_2]);

    const premier = valeurDe(
      await DepotLocalDexie.ouvrirEspace({ nomBase: NOM_ESPACE, fabrique, generateur }),
    );
    expect(premier.appareil()).toBe(ID_1);
    expect(valeurDe(await premier.lire()).appareilId).toBe(ID_1);

    const reouvert = valeurDe(
      await DepotLocalDexie.ouvrirEspace({ nomBase: NOM_ESPACE, fabrique, generateur }),
    );
    expect(reouvert.appareil()).toBe(ID_1);
    expect(generateur.appels).toBe(1);
  });

  it('UT-US-022-55 ouvrirEspace — après la suppression de l’espace, la reconnexion crée un nouvel appareilId (RG-055)', async () => {
    const fabrique = new IDBFactory();
    const generateur = new GenerateurListe([ID_1, ID_2]);
    valeurDe(await DepotLocalDexie.ouvrirEspace({ nomBase: NOM_ESPACE, fabrique, generateur }));

    await supprimerBase(fabrique, NOM_ESPACE);
    const recree = valeurDe(
      await DepotLocalDexie.ouvrirEspace({ nomBase: NOM_ESPACE, fabrique, generateur }),
    );

    expect(recree.appareil()).toBe(ID_2);
    expect(generateur.appels).toBe(2);
  });
});
