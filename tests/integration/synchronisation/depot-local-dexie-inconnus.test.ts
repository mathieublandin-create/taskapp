/**
 * DepotLocalDexie, base version 4 : tables `registresInconnus` et `evenementsInconnus`, méta d'appareil (ST-US-017 v0.11
 * §5.1, §6.8 n° 6, n° 12 ; tests complémentaires de la tranche H2). Complète CT-DEPOT-16 à 18 et UT-US-017-53.
 */
import Dexie from 'dexie';
import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import { echec, succes } from '@src/commun/domaine/resultat';
import type { Inconnus } from '@src/synchronisation/domaine/inconnus';
import type { IdFichierDrive } from '@src/synchronisation/domaine/meta-synchronisation';
import type { ValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { FabriqueIndexedDbEspionne } from '@tests/support/fabrique-indexeddb-espionne';
import { valeurDe } from '@tests/support/environnement';
import { planAjoutant, planVide } from '@tests/support/plans';
import {
  h,
  idArbitraire,
  intituleObjectif,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { ecart, idObjectif, PC, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

const NOM_BASE = 'done-juan-inconnus';
const O1 = idObjectif(1);

const INCONNUS: Inconnus = {
  registres: [
    { type: 'ETIQUETTE', id: 'e-1', champ: 'nom', valeur: 'Travail', hlc: h(1, PC) },
    {
      type: 'OBJECTIF',
      id: O1,
      champ: 'importance',
      valeur: { niveau: 3, notes: [1, null, 'x'] },
      hlc: h(2, SMARTPHONE),
      contexte: { [PC]: h(1, PC), [TROISIEME]: h(0, TROISIEME) },
    },
  ],
  evenements: [
    { id: 'evt-a', hlc: h(3, PC), brut: { type: 'ETIQUETAGE', element: { id: O1 }, n: 1 } },
    { id: 'evt-b', hlc: h(4, TROISIEME), brut: { type: 'ARCHIVAGE' } },
  ],
};

const nouveauDepot = (fabrique: IDBFactory, appareilId = SMARTPHONE) =>
  new DepotLocalDexie({ nomBase: NOM_BASE, fabrique, appareilId });

const deposerInconnus = (depot: DepotLocalDexie, inconnus: Inconnus = INCONNUS) =>
  depot.appliquerSynchronisation((etat) => ({ plan: planVide(etat), meta: {}, inconnus }));

/** Écrit une ligne brute hors de Dexie (situation impossible à produire par l'application). */
const ecrireLigneBrute = async (fabrique: IDBFactory, table: string, ligne: unknown) => {
  const base = new Dexie(NOM_BASE, { indexedDB: fabrique });
  await base.open();
  await base.table(table).put(ligne);
  base.close();
};

describe('DepotLocalDexie — éléments inconnus et méta d’appareil, base version 4 (ST-US-017 v0.11 §5.1)', () => {
  it('UT-COMP-US-017-4-21 une base version 3 existante est ouverte en version 4 sans perte (état, méta, signalements) ; les tables d’inconnus sont créées vides', async () => {
    const fabrique = new IDBFactory();
    const effacee: ValeurEcartee = {
      id: idArbitraire(1),
      motif: 'DONNEES_EFFACEES',
      ecartee: intituleObjectif(O1, 'Publier le guide', h(1, PC)),
      generation: h(5, SMARTPHONE),
    };
    // Lignes d'une base version 3, produites par une instance du dépôt sur une autre base, puis recopiées.
    const source = new DepotLocalDexie({ nomBase: 'source', fabrique, appareilId: SMARTPHONE });
    valeurDe(
      await source.appliquerSynchronisation((etat) => ({
        plan: planAjoutant(etat, {
          registres: [intituleObjectif(O1, 'Publier le guide', h(2, SMARTPHONE))],
          dernierHlc: h(2, SMARTPHONE),
        }),
        meta: { dossier: 'dossier' as IdFichierDrive, fusionNonDeposee: true },
        signalements: { valeursEcartees: [effacee], lectures: [] },
      })),
    );
    const etatSource = valeurDe(await source.lire());
    const metaSource = valeurDe(await source.lireMeta());
    source.fermer();
    const tablesV3 = {
      registres: 'cle, [type+id]',
      journal: 'id, [elementType+elementId], hlcTri',
      enAttente: 'cle',
      meta: 'nom',
      valeursEcartees: 'id',
      lectures: 'id',
    };
    const brut = new Dexie('source', { indexedDB: fabrique });
    await brut.open();
    const v3 = new Dexie(NOM_BASE, { indexedDB: fabrique });
    v3.version(3).stores(tablesV3);
    await v3.open();
    for (const table of Object.keys(tablesV3)) {
      await v3.table(table).bulkPut(await brut.table(table).toArray());
    }
    brut.close();
    v3.close();

    const depot = nouveauDepot(fabrique);
    expect(valeurDe(await depot.lire())).toEqual(etatSource);
    expect(valeurDe(await depot.lireMeta())).toEqual(metaSource);
    expect([...valeurDe(await depot.lireSignalements()).valeursEcartees.values()]).toEqual([
      effacee,
    ]);
    expect(valeurDe(await depot.lireInconnus())).toEqual({ registres: [], evenements: [] });
    depot.fermer();
    const relue = new Dexie(NOM_BASE, { indexedDB: fabrique });
    await relue.open();
    expect(relue.verno).toBe(4);
    expect(relue.tables.map((t) => t.name)).toEqual(
      expect.arrayContaining(['registresInconnus', 'evenementsInconnus']),
    );
    relue.close();
  });

  it('UT-COMP-US-017-4-22 inconnus relus à l’identique par une autre instance (valeur et brut JSON tels quels, contexte de plusieurs appareils) ; un contexte vide n’est ni écrit ni relu', async () => {
    const fabrique = new IDBFactory();
    valeurDe(await deposerInconnus(nouveauDepot(fabrique)));
    expect(valeurDe(await nouveauDepot(fabrique).lireInconnus())).toEqual(INCONNUS);

    const sansContexte = {
      type: 'TACHE',
      id: 't-1',
      champ: 'priorite',
      valeur: null,
      hlc: h(6, PC),
      contexte: {},
    };
    valeurDe(
      await deposerInconnus(nouveauDepot(fabrique), { registres: [sansContexte], evenements: [] }),
    );
    const base = new Dexie(NOM_BASE, { indexedDB: fabrique });
    await base.open();
    const ligne: unknown = await base.table('registresInconnus').get('TACHE:t-1:priorite');
    base.close();
    expect(ligne).not.toHaveProperty('contexte');
    const relus = valeurDe(await nouveauDepot(fabrique).lireInconnus()).registres;
    const { contexte: _vide, ...attendu } = sansContexte;
    expect(relus.find((r) => r.type === 'TACHE')).toStrictEqual(attendu);
  });

  it.each([
    ['registresInconnus', { cle: 'X:1:y', type: 'X', id: '1', champ: 'y', valeur: 1, hlc: 'faux' }],
    [
      'registresInconnus',
      {
        cle: 'X:autre:y',
        type: 'X',
        id: '1',
        champ: 'y',
        valeur: 1,
        hlc: { physique: '2026-10-21T08:00:00.000Z', compteur: 0, appareil: PC },
      },
    ],
    ['evenementsInconnus', { id: '', hlc: { physique: 'x', compteur: 0, appareil: PC }, brut: {} }],
    [
      'evenementsInconnus',
      { id: 'evt', hlc: { physique: '2026-10-21T08:00:00.000Z', compteur: 0, appareil: PC } },
    ],
  ])(
    'UT-COMP-US-017-4-23 une ligne illisible de %s (forme, ou clé incohérente avec ses colonnes) donne DonneesLocalesIllisibles',
    async (table, ligne) => {
      const fabrique = new IDBFactory();
      valeurDe(await nouveauDepot(fabrique).lire());
      await ecrireLigneBrute(fabrique, table, ligne);

      expect(await nouveauDepot(fabrique).lireInconnus()).toEqual(
        echec({ type: 'DonneesLocalesIllisibles' }),
      );
    },
  );

  it.each([
    ['mesuresHorloge', [1_000, 1.5]],
    ['mesuresHorloge', 'x'],
    ['aMettreALaCorbeille', [{ type: 'AUTRE', id: 'f' }]],
    ['aMettreALaCorbeille', [{ type: 'FICHIER', id: '' }]],
  ])(
    'UT-COMP-US-017-4-24 une méta d’appareil illisible (%s = %j) donne DonneesLocalesIllisibles',
    async (nom, valeur) => {
      const fabrique = new IDBFactory();
      valeurDe(await nouveauDepot(fabrique).lire());
      await ecrireLigneBrute(fabrique, 'meta', { nom, valeur });

      expect(await nouveauDepot(fabrique).lireMeta()).toEqual(
        echec({ type: 'DonneesLocalesIllisibles' }),
      );
    },
  );

  it('UT-COMP-US-017-4-25 lireInconnus : espace fermé → EspaceLocalNonOuvert ; méta illisible → DonneesLocalesIllisibles ; espace d’un autre appareil → ErreurProgrammation levée', async () => {
    const fabrique = new IDBFactory();
    const depot = nouveauDepot(fabrique);
    valeurDe(await depot.lire());
    depot.fermer();
    expect(await depot.lireInconnus()).toEqual(echec({ type: 'EspaceLocalNonOuvert' }));

    await expect(nouveauDepot(fabrique, PC).lireInconnus()).rejects.toThrow(ErreurProgrammation);

    await ecrireLigneBrute(fabrique, 'meta', { nom: 'version', valeur: -1 });
    expect(await nouveauDepot(fabrique).lireInconnus()).toEqual(
      echec({ type: 'DonneesLocalesIllisibles' }),
    );
  });

  it('UT-COMP-US-017-4-26 inconnus, plan et méta écrits par une seule transaction stricte ; transaction avortée : EcritureLocaleImpossible, aucun inconnu ni version', async () => {
    const fabrique = new FabriqueIndexedDbEspionne();
    valeurDe(await nouveauDepot(fabrique).lire());
    const avant = fabrique.ecritures().length;
    valeurDe(
      await nouveauDepot(fabrique).appliquerSynchronisation((etat) => ({
        plan: planVide(etat),
        meta: { fusionNonDeposee: true, mesuresHorloge: [] },
        inconnus: { registres: [], evenements: INCONNUS.evenements },
      })),
    );
    const ecritures = fabrique.ecritures().slice(avant);
    expect(ecritures.map((t) => [t.durabilite, t.terminee()])).toEqual([['strict', true]]);
    expect(valeurDe(await nouveauDepot(fabrique).lire()).version).toBe(1);

    fabrique.avorterLesEcritures();
    const resultat = await deposerInconnus(nouveauDepot(fabrique));
    fabrique.retablirLesEcritures();

    expect(resultat).toEqual(echec({ type: 'EcritureLocaleImpossible' }));
    const autre = nouveauDepot(fabrique);
    expect(valeurDe(await autre.lire()).version).toBe(1);
    expect(valeurDe(await autre.lireInconnus())).toEqual({
      registres: [],
      evenements: INCONNUS.evenements,
    });
  });

  it('UT-COMP-US-017-4-27 appliquer (écriture locale) ne touche ni aux inconnus ni à la méta d’appareil', async () => {
    const fabrique = new IDBFactory();
    const depot = nouveauDepot(fabrique);
    valeurDe(
      await depot.appliquerSynchronisation((etat) => ({
        plan: planVide(etat),
        meta: { mesuresHorloge: [ecart(1_000)], aMettreALaCorbeille: [] },
        inconnus: INCONNUS,
      })),
    );
    valeurDe(
      await depot.appliquer((etat) =>
        succes({
          plan: planAjoutant(etat, {
            registres: [intituleObjectif(O1, 'Publier', h(8, SMARTPHONE))],
            dernierHlc: h(8, SMARTPHONE),
          }),
          valeur: undefined,
        }),
      ),
    );
    const autre = nouveauDepot(fabrique);
    expect(valeurDe(await autre.lireInconnus())).toEqual(INCONNUS);
    expect(valeurDe(await autre.lireMeta())).toMatchObject({
      mesuresHorloge: [1_000],
      aMettreALaCorbeille: [],
    });
  });
});
