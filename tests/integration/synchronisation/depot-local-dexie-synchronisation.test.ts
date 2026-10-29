import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import type { IdFichierDrive } from '@src/synchronisation/domaine/meta-synchronisation';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { valeurDe } from '@tests/support/environnement';
import { ecrireLigneBrute } from '@tests/support/ligne-brute';
import { planVide } from '@tests/support/plans';
import { hlc, instant, SMARTPHONE } from '@tests/support/valeurs';

// ST-US-017 §5.1 : méta de synchronisation de DepotLocalDexie (base version 2), relecture et cas d'erreur.

const NOM_BASE = 'done-juan-meta-synchro';
const ILLISIBLE = echec({ type: 'DonneesLocalesIllisibles' });
const NON_OUVERT = echec({ type: 'EspaceLocalNonOuvert' });

const depotSur = (fabrique: IDBFactory) =>
  new DepotLocalDexie({ nomBase: NOM_BASE, fabrique, appareilId: SMARTPHONE });

describe('DepotLocalDexie — méta de synchronisation (ST-US-017 §5.1)', () => {
  it('UT-COMP-US-017-40 toutes les clés de la méta sont écrites puis relues par une autre instance', async () => {
    const fabrique = new IDBFactory();
    const meta = {
      dossier: 'd' as IdFichierDrive,
      fichierPropre: 'f' as IdFichierDrive,
      manifeste: 'm' as IdFichierDrive,
      deposeJusquA: hlc('2026-10-21T08:00:00.000Z', 3, SMARTPHONE),
      pageToken: '7',
      dernierContactDrive: instant('2026-10-21T09:00:00.000Z'),
      fusionNonDeposee: true,
    };
    valeurDe(
      await depotSur(fabrique).appliquerSynchronisation((etat) => ({ plan: planVide(etat), meta })),
    );

    expect(await depotSur(fabrique).lireMeta()).toEqual(succes(meta));
  });

  it('UT-COMP-US-017-41 une clé de méta invalide donne DonneesLocalesIllisibles, sans appeler le calcul', async () => {
    const fabrique = new IDBFactory();
    valeurDe(await depotSur(fabrique).lire());
    await ecrireLigneBrute(fabrique, NOM_BASE, 'meta', { nom: 'deposeJusquA', valeur: 3 });
    const depot = depotSur(fabrique);
    let appels = 0;

    expect(await depot.lireMeta()).toEqual(ILLISIBLE);
    expect(
      await depot.appliquerSynchronisation((etat) => {
        appels += 1;
        return { plan: planVide(etat), meta: {} };
      }),
    ).toEqual(ILLISIBLE);
    expect(appels).toBe(0);
  });

  it('UT-COMP-US-017-42 espace fermé ou ouverture illisible : EspaceLocalNonOuvert, DonneesLocalesIllisibles', async () => {
    const fabrique = new IDBFactory();
    const ferme = depotSur(fabrique);
    ferme.fermer();
    expect(await ferme.lireMeta()).toEqual(NON_OUVERT);
    expect(
      await ferme.appliquerSynchronisation((etat) => ({ plan: planVide(etat), meta: {} })),
    ).toEqual(NON_OUVERT);

    const autre = new IDBFactory();
    valeurDe(await depotSur(autre).lire());
    await ecrireLigneBrute(autre, NOM_BASE, 'meta', { nom: 'version', valeur: 'abc' });
    const illisible = depotSur(autre);
    expect(await illisible.lireMeta()).toEqual(ILLISIBLE);
    expect(
      await illisible.appliquerSynchronisation((etat) => ({ plan: planVide(etat), meta: {} })),
    ).toEqual(ILLISIBLE);
    await ecrireLigneBrute(autre, NOM_BASE, 'meta', { nom: 'pageToken', valeur: 1 });
    await ecrireLigneBrute(autre, NOM_BASE, 'meta', { nom: 'version', valeur: 0 });
    expect(
      await illisible.appliquerSynchronisation((etat) => ({ plan: planVide(etat), meta: {} })),
    ).toEqual(ILLISIBLE);
  });
});
