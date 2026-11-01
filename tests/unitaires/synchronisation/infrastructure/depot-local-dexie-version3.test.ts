import Dexie from 'dexie';
import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { succes } from '@src/commun/domaine/resultat';
import type { IdFichierDrive } from '@src/synchronisation/domaine/meta-synchronisation';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { registre } from '@tests/support/fabriques/etat-local';
import { valeurDe } from '@tests/support/environnement';
import { planAjoutant, planVide } from '@tests/support/plans';
import { hlc, idObjectif, SMARTPHONE } from '@tests/support/valeurs';

// ST-US-017 v0.5 §5.1 : base de l'espace en version 3 (tables `valeursEcartees` et `lectures`, clé `id`), ajout pur :
// une base version 2 existante est ouverte sans perte. UT-US-017-53.

const TABLES_V2 = {
  registres: 'cle, [type+id]',
  journal: 'id, [elementType+elementId], hlcTri',
  enAttente: 'cle',
  meta: 'nom',
};
const NOMS_V2 = Object.keys(TABLES_V2);
const h = hlc('2026-10-21T08:00:00.000Z', 0, SMARTPHONE);
const O = idObjectif(1);

const depotSur = (fabrique: IDBFactory, nomBase: string) =>
  new DepotLocalDexie({ nomBase, fabrique, appareilId: SMARTPHONE });

/** Lignes brutes des tables de la version 2 d'une base existante (ouverture dynamique, sans schéma). */
const lignesV2 = async (fabrique: IDBFactory, nomBase: string) => {
  const base = new Dexie(nomBase, { indexedDB: fabrique });
  await base.open();
  const lignes = Object.fromEntries(
    await Promise.all(NOMS_V2.map(async (nom) => [nom, await base.table(nom).toArray()] as const)),
  );
  base.close();
  return lignes;
};

describe('DepotLocalDexie — base version 3 (ST-US-017 v0.5 §5.1)', () => {
  it('UT-US-017-53 une base version 2 est ouverte en version 3 sans perte ; tables valeursEcartees et lectures créées, vides', async () => {
    const fabrique = new IDBFactory();
    const source = depotSur(fabrique, 'done-juan-source');
    valeurDe(
      await source.appliquer((etat) =>
        succes({
          plan: planAjoutant(etat, {
            registres: [
              registre({ type: 'OBJECTIF', id: O, champ: 'intitule' }, 'Publier le guide', h),
            ],
            dernierHlc: h,
          }),
          valeur: undefined,
        }),
      ),
    );
    valeurDe(
      await source.appliquerSynchronisation((etat) => ({
        plan: planVide(etat),
        meta: { dossier: 'dossier' as IdFichierDrive },
      })),
    );
    const etatSource = valeurDe(await source.lire());
    const metaSource = valeurDe(await source.lireMeta());
    source.fermer();

    // Base version 2 construite à la main avec les mêmes lignes.
    const lignes = await lignesV2(fabrique, 'done-juan-source');
    const v2 = new Dexie('done-juan-cible', { indexedDB: fabrique });
    v2.version(2).stores(TABLES_V2);
    await v2.open();
    for (const nom of NOMS_V2) await v2.table(nom).bulkPut(lignes[nom] ?? []);
    v2.close();

    const cible = depotSur(fabrique, 'done-juan-cible');
    expect(valeurDe(await cible.lire())).toEqual(etatSource);
    expect(valeurDe(await cible.lireMeta())).toEqual(metaSource);
    const signalements = valeurDe(await cible.lireSignalements());
    expect([signalements.valeursEcartees.size, signalements.lectures.size]).toEqual([0, 0]);
    cible.fermer();

    const relue = new Dexie('done-juan-cible', { indexedDB: fabrique });
    await relue.open();
    expect(relue.verno).toBe(3);
    expect(relue.tables.map((table) => table.name)).toEqual(
      expect.arrayContaining(['valeursEcartees', 'lectures']),
    );
    relue.close();
  });
});
