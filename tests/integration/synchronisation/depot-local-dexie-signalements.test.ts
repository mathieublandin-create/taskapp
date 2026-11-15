/**
 * DepotLocalDexie, base version 3 : tables `valeursEcartees` et `lectures` (ST-US-017 v0.5 §5.1, §4.6 ; §14, tests
 * complémentaires de la tranche B2). Complète UT-US-017-53 et CT-DEPOT-12, 13.
 */
import Dexie from 'dexie';
import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import type { Lecture } from '@src/synchronisation/domaine/lectures';
import type { AjoutsSignalements } from '@src/synchronisation/domaine/signalements';
import type { ValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { FabriqueIndexedDbEspionne } from '@tests/support/fabrique-indexeddb-espionne';
import { registre } from '@tests/support/fabriques/etat-local';
import { valeurDe } from '@tests/support/environnement';
import { planAjoutant, planVide } from '@tests/support/plans';
import {
  creeSous,
  delaiTache,
  h,
  idArbitraire,
  intituleTache,
  parentObjectif,
  suppressionTache,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { idObjectif, idTache, PC, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

const NOM_BASE = 'done-juan-signalements';
const T1 = idTache(1);
const O1 = idObjectif(1);
const O2 = idObjectif(2);

const VALEURS: ReadonlyArray<ValeurEcartee> = [
  {
    id: idArbitraire(1),
    motif: 'CONFLIT',
    ecartee: intituleTache(T1, 'A', h(1, PC)),
    gagnante: intituleTache(T1, 'B', h(2, SMARTPHONE), { [PC]: h(0, PC) }),
  },
  {
    id: idArbitraire(2),
    motif: 'SUPPRESSION',
    ecartee: delaiTache(T1, '2026-12-10', h(2, TROISIEME), { [PC]: h(0, PC) }),
    gagnante: suppressionTache(T1, h(1, PC)),
    intituleElement: 'Chapitre 1',
  },
  {
    id: idArbitraire(3),
    motif: 'PLACEMENT_ANNULE',
    ecartee: parentObjectif(O1, creeSous(O2, h(1, PC)), h(1, PC)),
    gagnante: parentObjectif(O1, { origine: 'CREATION', hlcOrigine: h(0, PC) }, h(3, SMARTPHONE)),
  },
  {
    id: idArbitraire(4),
    motif: 'DONNEES_EFFACEES',
    ecartee: intituleTache(T1, 'Perdu', h(1, SMARTPHONE)),
    generation: h(5, PC),
  },
];
const LECTURES: ReadonlyArray<Lecture> = [{ id: idArbitraire(1), hlc: h(4, SMARTPHONE) }];
const AJOUTS: AjoutsSignalements = { valeursEcartees: VALEURS, lectures: LECTURES };

const nouveauDepot = (fabrique: IDBFactory) =>
  new DepotLocalDexie({ nomBase: NOM_BASE, fabrique, appareilId: SMARTPHONE });

const deposerSignalements = (depot: DepotLocalDexie, ajouts: AjoutsSignalements = AJOUTS) =>
  depot.appliquerSynchronisation((etat) => ({
    plan: planVide(etat),
    meta: {},
    signalements: ajouts,
  }));

/** Écrit une ligne brute hors de Dexie (situation impossible à produire par l'application). */
const ecrireLigneBrute = async (fabrique: IDBFactory, table: string, ligne: unknown) => {
  const base = new Dexie(NOM_BASE, { indexedDB: fabrique });
  await base.open();
  await base.table(table).put(ligne);
  base.close();
};

describe('DepotLocalDexie — signalements, base version 3 (ST-US-017 v0.5 §5.1)', () => {
  it('UT-COMP-US-017-2-12 les quatre motifs et une lecture sont relus à l’identique par une autre instance', async () => {
    const fabrique = new IDBFactory();
    valeurDe(await deposerSignalements(nouveauDepot(fabrique)));

    const relus = valeurDe(await nouveauDepot(fabrique).lireSignalements());

    expect([...relus.valeursEcartees.values()]).toEqual(VALEURS);
    expect([...relus.lectures.values()]).toEqual(LECTURES);
  });

  it.each(['valeursEcartees', 'lectures'])(
    'UT-COMP-US-017-2-13 une ligne illisible de %s donne DonneesLocalesIllisibles, en lecture comme en synchronisation, sans appeler le calcul',
    async (table) => {
      const fabrique = new IDBFactory();
      valeurDe(await nouveauDepot(fabrique).lire());
      await ecrireLigneBrute(fabrique, table, { id: idArbitraire(9), motif: 'FUTUR', hlc: 'x' });
      const depot = nouveauDepot(fabrique);
      let appels = 0;

      const lus = await depot.lireSignalements();
      const synchronisation = await depot.appliquerSynchronisation((etat) => {
        appels += 1;
        return { plan: planVide(etat), meta: {} };
      });

      expect(lus).toEqual(echec({ type: 'DonneesLocalesIllisibles' }));
      expect(synchronisation).toEqual(echec({ type: 'DonneesLocalesIllisibles' }));
      expect(appels).toBe(0);
    },
  );

  it('UT-COMP-US-017-2-14 registres, méta, dernier HLC et signalements sont écrits par une seule transaction stricte', async () => {
    const fabrique = new FabriqueIndexedDbEspionne();
    const depot = nouveauDepot(fabrique);
    valeurDe(await depot.lire());
    const avant = fabrique.ecritures().length;
    const ecrit = intituleTache(T1, 'B', h(6, SMARTPHONE));

    valeurDe(
      await depot.appliquerSynchronisation((etat) => ({
        plan: planAjoutant(etat, { registres: [ecrit], dernierHlc: h(6, SMARTPHONE) }),
        meta: { fusionNonDeposee: true },
        signalements: AJOUTS,
      })),
    );

    const ecritures = fabrique.ecritures().slice(avant);
    expect(ecritures.map((t) => [t.durabilite, t.terminee()])).toEqual([['strict', true]]);
    const autre = nouveauDepot(fabrique);
    const etat = valeurDe(await autre.lire());
    expect([etat.version, etat.dernierHlc, [...etat.registres.values()]]).toEqual([
      1,
      h(6, SMARTPHONE),
      [ecrit],
    ]);
    expect(valeurDe(await autre.lireSignalements()).valeursEcartees.size).toBe(4);
  });

  it('UT-COMP-US-017-2-15 transaction avortée : EcritureLocaleImpossible, aucun signalement ni changement de version', async () => {
    const fabrique = new FabriqueIndexedDbEspionne();
    valeurDe(await nouveauDepot(fabrique).lire());
    fabrique.avorterLesEcritures();

    const resultat = await deposerSignalements(nouveauDepot(fabrique));

    expect(resultat).toEqual(echec({ type: 'EcritureLocaleImpossible' }));
    fabrique.retablirLesEcritures();
    const autre = nouveauDepot(fabrique);
    expect(valeurDe(await autre.lire()).version).toBe(0);
    expect(valeurDe(await autre.lireSignalements()).valeursEcartees.size).toBe(0);
  });

  it('UT-COMP-US-017-2-16 signalements seuls : le dernier HLC du plan est écrit avec la version (lecture « Compris »)', async () => {
    const fabrique = new IDBFactory();
    const depot = nouveauDepot(fabrique);
    const lecture = { id: idArbitraire(1), hlc: h(7, SMARTPHONE) };

    valeurDe(
      await depot.appliquerSynchronisation((etat) => ({
        plan: { ...planVide(etat), etatApres: { ...etat, dernierHlc: lecture.hlc } },
        meta: {},
        signalements: { valeursEcartees: [], lectures: [lecture] },
      })),
    );

    const etat = valeurDe(await nouveauDepot(fabrique).lire());
    expect([etat.version, etat.dernierHlc]).toEqual([1, lecture.hlc]);
  });

  it('UT-COMP-US-017-2-17 base version 2 existante montée en version 3 : registres conservés, signalements écrits ensuite', async () => {
    const fabrique = new IDBFactory();
    const v2 = new Dexie(NOM_BASE, { indexedDB: fabrique });
    v2.version(2).stores({
      registres: 'cle, [type+id]',
      journal: 'id, [elementType+elementId], hlcTri',
      enAttente: 'cle',
      meta: 'nom',
    });
    await v2.open();
    const ecrit = registre({ type: 'OBJECTIF', id: O1, champ: 'intitule' }, 'Publier', h(1, PC));
    const source = new DepotLocalDexie({ nomBase: 'source', fabrique, appareilId: SMARTPHONE });
    valeurDe(
      await source.appliquer((etat) =>
        succes({
          plan: planAjoutant(etat, { registres: [ecrit], dernierHlc: h(1, PC) }),
          valeur: undefined,
        }),
      ),
    );
    source.fermer();
    const brut = new Dexie('source', { indexedDB: fabrique });
    await brut.open();
    for (const table of ['registres', 'meta']) {
      await v2.table(table).bulkPut(await brut.table(table).toArray());
    }
    brut.close();
    v2.close();

    const depot = nouveauDepot(fabrique);
    valeurDe(await deposerSignalements(depot));

    const etat = valeurDe(await depot.lire());
    expect([etat.version, [...etat.registres.values()]]).toEqual([2, [ecrit]]);
    expect([...valeurDe(await depot.lireSignalements()).lectures.values()]).toEqual(LECTURES);
  });

  it('UT-COMP-US-017-2-18 lireSignalements après fermeture : EspaceLocalNonOuvert', async () => {
    const depot = nouveauDepot(new IDBFactory());
    valeurDe(await depot.lire());
    depot.fermer();

    expect(await depot.lireSignalements()).toEqual(echec({ type: 'EspaceLocalNonOuvert' }));
  });

  it('UT-COMP-US-017-2-25 ligne de valeur écartée dont un registre est invalide : DonneesLocalesIllisibles ; suppression sans intitulé relue sans lui', async () => {
    const fabrique = new IDBFactory();
    const sansIntitule: ValeurEcartee = {
      id: idArbitraire(5),
      motif: 'SUPPRESSION',
      ecartee: intituleTache(T1, 'A', h(1, PC)),
      gagnante: suppressionTache(T1, h(2, SMARTPHONE)),
    };
    valeurDe(
      await deposerSignalements(nouveauDepot(fabrique), {
        valeursEcartees: [sansIntitule],
        lectures: [],
      }),
    );
    expect([
      ...valeurDe(await nouveauDepot(fabrique).lireSignalements()).valeursEcartees.values(),
    ]).toEqual([sansIntitule]);
    const base = new Dexie(NOM_BASE, { indexedDB: fabrique });
    await base.open();
    const [ligne] = (await base.table('valeursEcartees').toArray()) as ReadonlyArray<
      Record<string, Record<string, unknown>>
    >;
    base.close();
    const registreInvalide = { ...ligne?.['ecartee'], champ: 'couleur' };

    for (const cle of ['ecartee', 'gagnante']) {
      await ecrireLigneBrute(fabrique, 'valeursEcartees', { ...ligne, [cle]: registreInvalide });
      expect(await nouveauDepot(fabrique).lireSignalements()).toEqual(
        echec({ type: 'DonneesLocalesIllisibles' }),
      );
    }
  });

  it('UT-COMP-US-017-2-26 lireSignalements sur un espace dont la méta est illisible : DonneesLocalesIllisibles', async () => {
    const fabrique = new IDBFactory();
    valeurDe(await nouveauDepot(fabrique).lire());
    await ecrireLigneBrute(fabrique, 'meta', { nom: 'appareilId', valeur: 'illisible' });

    expect(await nouveauDepot(fabrique).lireSignalements()).toEqual(
      echec({ type: 'DonneesLocalesIllisibles' }),
    );
  });
});
