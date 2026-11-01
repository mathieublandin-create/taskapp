import Dexie from 'dexie';
import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import type { Generation } from '@src/synchronisation/domaine/contenu-fichier';
import type { IdFichierDrive } from '@src/synchronisation/domaine/meta-synchronisation';
import type { ValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { valeurDe } from '@tests/support/environnement';
import { planVide } from '@tests/support/plans';
import {
  h,
  idArbitraire,
  intituleObjectif,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { idObjectif, PC, SMARTPHONE } from '@tests/support/valeurs';

// ST-US-017 v0.10 §5.1 : l'incrément 3 n'ajoute AUCUNE version de base (clés de méta absentes ≡ valeur initiale, champ
// facultatif d'une ligne existante) : une base version 3 existante est lue sans perte, sans `upgrade`. I3-8.

const NOM = 'done-juan-increment-3';
const depotSur = (fabrique: IDBFactory) =>
  new DepotLocalDexie({ nomBase: NOM, fabrique, appareilId: SMARTPHONE });
const generation: Generation = { type: 'NOUVELLE', hlc: h(5, SMARTPHONE) };

describe('DepotLocalDexie — incrément 3 (ST-US-017 v0.10 §5.1)', () => {
  it('UT-COMP-US-017-3-1 une base version 3 existante, sans clé de l’incrément 3, est lue sans perte avec les valeurs initiales ; la version reste 3', async () => {
    const fabrique = new IDBFactory();
    const existante = new Dexie(NOM, { indexedDB: fabrique });
    existante.version(3).stores({
      registres: 'cle, [type+id]',
      journal: 'id, [elementType+elementId], hlcTri',
      enAttente: 'cle',
      meta: 'nom',
      valeursEcartees: 'id',
      lectures: 'id',
    });
    await existante.open();
    await existante.table('meta').bulkPut([
      { nom: 'appareilId', valeur: SMARTPHONE },
      { nom: 'version', valeur: 4 },
      { nom: 'dossier', valeur: 'dossier-existant' },
      { nom: 'fusionNonDeposee', valeur: true },
    ]);
    existante.close();

    const depot = depotSur(fabrique);
    expect(valeurDe(await depot.lireMeta())).toEqual({
      dossier: 'dossier-existant',
      fusionNonDeposee: true,
    });
    expect(valeurDe(await depot.lire()).version).toBe(4);
    depot.fermer();
    const relue = new Dexie(NOM, { indexedDB: fabrique });
    await relue.open();
    expect(relue.verno).toBe(3);
    relue.close();
  });

  it('UT-COMP-US-017-3-2 les cinq clés de méta de l’incrément 3 et l’intituleElement d’une ligne DONNEES_EFFACEES font l’aller-retour', async () => {
    const fabrique = new IDBFactory();
    const depot = depotSur(fabrique);
    const effacee: ValeurEcartee = {
      id: idArbitraire(1),
      motif: 'DONNEES_EFFACEES',
      ecartee: intituleObjectif(idObjectif(1), 'Publier le guide', h(1, PC)),
      generation: h(5, SMARTPHONE),
      intituleElement: 'Publier le guide',
    };
    const meta = {
      generation,
      versionFichierPropre: '42',
      restaurationDemandee: true,
      restaurationConnue: h(7, PC),
      inventaireAFaire: true,
      fichierPropre: 'fichier' as IdFichierDrive,
      fusionNonDeposee: false,
    };
    valeurDe(
      await depot.appliquerSynchronisation((etat) => ({
        plan: planVide(etat),
        meta,
        signalements: { valeursEcartees: [effacee], lectures: [] },
      })),
    );
    depot.fermer();
    const relu = depotSur(fabrique);
    expect(valeurDe(await relu.lireMeta())).toEqual(meta);
    expect([...valeurDe(await relu.lireSignalements()).valeursEcartees.values()]).toEqual([
      effacee,
    ]);
    // Génération INITIALE : forme sans HLC.
    valeurDe(
      await relu.appliquerSynchronisation((etat) => ({
        plan: planVide(etat),
        meta: { generation: { type: 'INITIALE' } },
      })),
    );
    expect(valeurDe(await relu.lireMeta()).generation).toEqual({ type: 'INITIALE' });
    relu.fermer();
  });

  it('UT-COMP-US-017-3-4 reinitialiser sans signalements : tables vidées, clés de synchronisation retirées, valeurs initiales', async () => {
    const fabrique = new IDBFactory();
    const depot = depotSur(fabrique);
    const sansTitre: ValeurEcartee = {
      id: idArbitraire(2),
      motif: 'DONNEES_EFFACEES',
      ecartee: intituleObjectif(idObjectif(2), 'Sans titre connu', h(2, PC)),
      generation: h(5, SMARTPHONE),
    };
    valeurDe(
      await depot.appliquerSynchronisation((etat) => ({
        plan: planVide(etat),
        meta: { dossier: 'dossier' as IdFichierDrive, restaurationConnue: h(3, PC) },
        signalements: { valeursEcartees: [sansTitre], lectures: [] },
      })),
    );
    expect([...valeurDe(await depot.lireSignalements()).valeursEcartees.values()]).toEqual([
      sansTitre,
    ]);
    valeurDe(
      await depot.appliquerSynchronisation((etat) => ({
        plan: planVide(etat),
        meta: {},
        reinitialiser: true,
      })),
    );
    expect(valeurDe(await depot.lireMeta())).toEqual({ fusionNonDeposee: false });
    expect(valeurDe(await depot.lireSignalements()).valeursEcartees.size).toBe(0);
    depot.fermer();
  });

  it('UT-COMP-US-017-3-5 une ligne de méta étrangère (nom non textuel) est ignorée à la lecture de l’état et de la méta', async () => {
    const fabrique = new IDBFactory();
    const depot = depotSur(fabrique);
    valeurDe(await depot.lire());
    depot.fermer();
    const brute = new Dexie(NOM, { indexedDB: fabrique });
    await brute.open();
    await brute.table('meta').put({ nom: 5, valeur: 'étrangère' });
    brute.close();
    const relu = depotSur(fabrique);
    expect(valeurDe(await relu.lireMeta())).toEqual({ fusionNonDeposee: false });
    expect(valeurDe(await relu.lire()).appareilId).toBe(SMARTPHONE);
    relu.fermer();
  });

  it('UT-COMP-US-017-3-3 une clé de méta de l’incrément 3 illisible donne DonneesLocalesIllisibles', async () => {
    const fabrique = new IDBFactory();
    const depot = depotSur(fabrique);
    valeurDe(await depot.lire());
    depot.fermer();
    const brute = new Dexie(NOM, { indexedDB: fabrique });
    await brute.open();
    await brute.table('meta').put({ nom: 'generation', valeur: { type: 'AUTRE' } });
    brute.close();
    const relu = depotSur(fabrique);
    const lue = await relu.lireMeta();
    expect(lue.ok).toBe(false);
    relu.fermer();
  });
});
