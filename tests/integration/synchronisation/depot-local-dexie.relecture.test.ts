import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { valeurDe } from '@tests/support/environnement';
import { ecrireLigneBrute } from '@tests/support/ligne-brute';
import { planAjoutant } from '@tests/support/plans';
import { hlc, idObjectif, idTache, SMARTPHONE } from '@tests/support/valeurs';

// Relecture des lignes IndexedDB par les constructeurs du domaine (RC-SOCLE-1, RC-SOCLE-3 ; conventions.md §6.2).

const NOM_BASE = 'done-juan-relecture';
const O = idObjectif(1);
const T = idTache(1);
const ILLISIBLE = echec({ type: 'DonneesLocalesIllisibles' });

const hlcStocke = { physique: '2026-10-21T08:00:00.000Z', compteur: 0, appareil: SMARTPHONE };

const ligneEstimation = (valeur: unknown, hlc: unknown = hlcStocke) => ({
  cle: `TACHE/${T}/estimationInitiale`,
  type: 'TACHE',
  id: T,
  champ: 'estimationInitiale',
  valeur,
  hlc,
  contexte: {},
});

const depotSur = (fabrique: IDBFactory) =>
  new DepotLocalDexie({ nomBase: NOM_BASE, fabrique, appareilId: SMARTPHONE });

/** Espace ouvert (meta écrite) puis ligne brute déposée dans `table`. */
const espaceAvecLigne = async (table: string, ligne: unknown): Promise<IDBFactory> => {
  const fabrique = new IDBFactory();
  valeurDe(await depotSur(fabrique).lire());
  await ecrireLigneBrute(fabrique, NOM_BASE, table, ligne);
  return fabrique;
};

describe('DepotLocalDexie — relecture par les constructeurs du domaine (conventions.md §6.2)', () => {
  it('UT-COMP-100 lire — relit une ligne valide (témoin des cas de rejet suivants)', async () => {
    const fabrique = await espaceAvecLigne('registres', ligneEstimation(90));

    const etat = valeurDe(await depotSur(fabrique).lire());

    expect(etat.registres.size).toBe(1);
  });

  it.each([
    [
      'UT-COMP-101',
      'un compteur HLC supérieur à 65 535',
      ligneEstimation(90, { ...hlcStocke, compteur: 65_536 }),
    ],
    ['UT-COMP-102', 'un compteur HLC négatif', ligneEstimation(90, { ...hlcStocke, compteur: -1 })],
    [
      'UT-COMP-103',
      'un appareil de HLC qui n’est pas un UUID v7',
      ligneEstimation(90, { ...hlcStocke, appareil: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' }),
    ],
    ['UT-COMP-104', 'une estimation qui n’est pas un multiple de 30', ligneEstimation(45)],
    ['UT-COMP-105', 'une estimation négative', ligneEstimation(-30)],
    [
      'UT-COMP-106',
      'un identifiant de tâche qui n’est pas un UUID v7',
      { ...ligneEstimation(90), id: 'tache-1', cle: 'TACHE/tache-1/estimationInitiale' },
    ],
    [
      'UT-COMP-107',
      'une clé de contexte qui n’est pas un UUID v7',
      { ...ligneEstimation(90), contexte: { x: hlcStocke } },
    ],
    [
      'UT-COMP-108',
      'un champ inconnu',
      { ...ligneEstimation(90), champ: 'inconnu', cle: `TACHE/${T}/inconnu` },
    ],
  ])('%s lire — rejette %s avec DonneesLocalesIllisibles (registres)', async (_id, _cas, ligne) => {
    const fabrique = await espaceAvecLigne('registres', ligne);

    expect(await depotSur(fabrique).lire()).toEqual(ILLISIBLE);
  });

  it('UT-COMP-109 lire — rejette un lien dont l’identifiant n’est pas « tâche|objectif » en UUID v7', async () => {
    const fabrique = await espaceAvecLigne('registres', {
      cle: `LIEN_TACHE_OBJECTIF/${T}/actif`,
      type: 'LIEN_TACHE_OBJECTIF',
      id: T,
      champ: 'actif',
      valeur: true,
      hlc: hlcStocke,
      contexte: {},
    });

    expect(await depotSur(fabrique).lire()).toEqual(ILLISIBLE);
  });

  it('UT-COMP-110 lire — rejette une ligne en attente dont le HLC a un compteur hors bornes', async () => {
    const fabrique = await espaceAvecLigne('enAttente', {
      cle: `OBJECTIF/${O}/intitule`,
      type: 'OBJECTIF',
      id: O,
      champ: 'intitule',
      premiereEcriture: '2026-10-21T08:00:00.000Z',
      derniereHlc: { ...hlcStocke, compteur: 70_000 },
    });

    expect(await depotSur(fabrique).lire()).toEqual(ILLISIBLE);
  });

  it.each([
    ['UT-COMP-111', 'un identifiant d’événement mal formé', { id: 'evenement-1' }],
    [
      'UT-COMP-112',
      'un HLC dont l’appareil n’est pas un UUID v7',
      { hlc: { ...hlcStocke, appareil: 'x' } },
    ],
    [
      'UT-COMP-113',
      'une estimation qui n’est pas un multiple de 30',
      {
        contenu: {
          type: 'MODIFICATION_ESTIMATION',
          element: { type: 'TACHE', id: T },
          avant: { estimation: 30 },
          apres: { estimation: 50 },
        },
      },
    ],
    [
      'UT-COMP-114',
      'un élément qui n’est pas un UUID v7',
      {
        contenu: { type: 'SUPPRESSION', element: { type: 'TACHE', id: 'z' }, avant: {}, apres: {} },
      },
    ],
  ])(
    '%s lire — rejette %s avec DonneesLocalesIllisibles (journal)',
    async (_id, _cas, alteration) => {
      const operation = '00000000-0000-7000-80c0-000000000001';
      const valide = {
        id: `${operation}:0`,
        hlc: hlcStocke,
        instant: '2026-10-21T08:00:00.000Z',
        jour: '2026-10-21',
        contenu: { type: 'SUPPRESSION', element: { type: 'TACHE', id: T }, avant: {}, apres: {} },
        elementType: 'TACHE',
        elementId: T,
        hlcTri: 'x',
      };
      const fabrique = await espaceAvecLigne('journal', { ...valide, ...alteration });

      expect(await depotSur(fabrique).lire()).toEqual(ILLISIBLE);
    },
  );

  it('UT-COMP-115 lire et appliquer — une table meta illisible donne DonneesLocalesIllisibles, et l’ouverture peut être retentée', async () => {
    const fabrique = await espaceAvecLigne('meta', { nom: 'version', valeur: 'abc' });
    const depot = depotSur(fabrique);

    expect(await depot.lire()).toEqual(ILLISIBLE);
    expect(
      await depot.appliquer((etat) =>
        succes({
          plan: planAjoutant(etat, { dernierHlc: hlc('2026-10-21T08:00:00.000Z', 0, SMARTPHONE) }),
          valeur: undefined,
        }),
      ),
    ).toEqual(ILLISIBLE);

    await ecrireLigneBrute(fabrique, NOM_BASE, 'meta', { nom: 'version', valeur: 0 });
    expect((await depot.lire()).ok).toBe(true);
  });
});
