import { createHash } from 'node:crypto';
import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import type { GenerateurIdentifiants } from '@src/commun/application/ports/generateur-identifiants';
import type { Annulation, Planificateur } from '@src/commun/application/ports/planificateur';
import { echec, succes } from '@src/commun/domaine/resultat';
import type { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import { GestionEspacesIndexedDb } from '@src/compte/infrastructure/espaces/gestion-espaces-indexeddb';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { IDENTITE_A } from '@tests/support/compte/doublures-compte';
import { valeurDe } from '@tests/support/environnement';

// RL-LOT-001-A1 (DAT v0.11.4 §4.1.6) : suppression d'un espace avec deux connexions (deux onglets).
const NOM_A = `donejuan-recette-${createHash('sha256').update('sub-A', 'utf8').digest('hex')}`;

const generateur = (uuid: string): GenerateurIdentifiants => ({ genererUuidV7: () => uuid });

/** Planificateur piloté par le test : les échéances ne partent que sur `declencher()`. */
class PlanificateurManuel implements Planificateur {
  private readonly actions: Array<() => void> = [];
  delais: Array<EcartTemps> = [];
  apres(delai: EcartTemps, action: () => void): Annulation {
    this.delais.push(delai);
    this.actions.push(action);
    return () => {
      const i = this.actions.indexOf(action);
      if (i >= 0) this.actions.splice(i, 1);
    };
  }
  periodiquement(): Annulation {
    return () => undefined;
  }
  attendre(): Promise<void> {
    return new Promise(() => undefined);
  }
  declencher(): void {
    this.actions.splice(0).forEach((action) => {
      action();
    });
  }
  enAttente(): number {
    return this.actions.length;
  }
}

const tache = (): Promise<void> =>
  new Promise((resoudre) => {
    setTimeout(resoudre, 0);
  });

/** Attend que la suppression arme son délai (requête bloquée), 200 tâches au plus. */
const attendreDelaiArme = async (planificateur: PlanificateurManuel): Promise<void> => {
  for (let i = 0; i < 200 && planificateur.enAttente() === 0; i += 1) await tache();
};

const nomsDesBases = async (fabrique: IDBFactory): Promise<ReadonlyArray<string | undefined>> =>
  (await fabrique.databases()).map((base) => base.name);

describe('GestionEspacesIndexedDb.supprimer avec deux connexions (RL-LOT-001-A1)', () => {
  it('UT-US-022-60 supprimer — l’autre onglet ferme sa connexion sur versionchange, sans la rouvrir : la base disparaît et n’est pas recréée', async () => {
    const fabrique = new IDBFactory();
    const premier = valeurDe(
      await DepotLocalDexie.ouvrirEspace({
        nomBase: NOM_A,
        fabrique,
        generateur: generateur('00000000-0000-7000-8000-0000000000a1'),
      }),
    );
    let fermeturesImposees = 0;
    const second = valeurDe(
      await DepotLocalDexie.ouvrirEspace({
        nomBase: NOM_A,
        fabrique,
        generateur: generateur('00000000-0000-7000-8000-0000000000a2'),
        surFermetureImposee: () => {
          fermeturesImposees += 1;
        },
      }),
    );
    const espaces = new GestionEspacesIndexedDb({
      env: 'recette',
      fabrique,
      planificateur: new PlanificateurManuel(),
      surOuverture: () => Promise.resolve(succes(undefined)),
      surFermeture: () => {
        premier.fermer();
        return Promise.resolve();
      },
    });

    expect(await espaces.supprimer(IDENTITE_A.compte)).toEqual(succes(undefined));

    expect(fermeturesImposees).toBe(1);
    expect(await second.lire()).toEqual(echec({ type: 'EspaceLocalNonOuvert' }));
    expect(await second.lireMeta()).toEqual(echec({ type: 'EspaceLocalNonOuvert' }));
    expect(await nomsDesBases(fabrique)).not.toContain(NOM_A);
  });

  it('UT-US-022-61 supprimer — une connexion qui ne se ferme pas bloque la suppression : SuppressionBloquee après 5 s, base intacte ; un nouvel appel aboutit quand elle se ferme (ERR-017)', async () => {
    const fabrique = new IDBFactory();
    valeurDe(
      await DepotLocalDexie.ouvrirEspace({
        nomBase: NOM_A,
        fabrique,
        generateur: generateur('00000000-0000-7000-8000-0000000000a1'),
      }),
    ).fermer();
    const recalcitrante = await new Promise<IDBDatabase>((resoudre, rejeter) => {
      const ouverture = fabrique.open(NOM_A);
      ouverture.onsuccess = () => {
        resoudre(ouverture.result);
      };
      ouverture.onerror = () => {
        rejeter(new Error('ouverture impossible'));
      };
    });
    const planificateur = new PlanificateurManuel();
    const espaces = new GestionEspacesIndexedDb({
      env: 'recette',
      fabrique,
      planificateur,
      surOuverture: () => Promise.resolve(succes(undefined)),
      surFermeture: () => Promise.resolve(),
    });

    const bloquee = espaces.supprimer(IDENTITE_A.compte);
    await attendreDelaiArme(planificateur);
    expect(planificateur.delais).toEqual([5_000]);
    planificateur.declencher();

    expect(await bloquee).toEqual(echec({ type: 'SuppressionBloquee' }));
    expect(await nomsDesBases(fabrique)).toContain(NOM_A);

    const reprise = espaces.supprimer(IDENTITE_A.compte);
    recalcitrante.close();

    expect(await reprise).toEqual(succes(undefined));
    expect(await nomsDesBases(fabrique)).not.toContain(NOM_A);
  });
});
