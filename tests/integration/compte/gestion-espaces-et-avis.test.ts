import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import type { AvisOnglet } from '@src/compte/application/ports/avis-onglets';
import { succes } from '@src/commun/domaine/resultat';
import { AvisOngletsBroadcast } from '@src/compte/infrastructure/avis-onglets-broadcast';
import { GestionEspacesIndexedDb } from '@src/compte/infrastructure/espaces/gestion-espaces-indexeddb';
import { nomEspace } from '@src/compte/infrastructure/espaces/nom-espace';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { PlanificateurSimule } from '@tests/doublures/planificateur-simule';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { IDENTITE_A, IDENTITE_B } from '@tests/support/compte/doublures-compte';
import { valeurDe } from '@tests/support/environnement';
import { instant } from '@tests/support/valeurs';

// ST-US-022 §14 : GestionEspacesIndexedDb branché sur DepotLocalDexie comme dans la composition ; AvisOngletsBroadcast.
const preparer = () => {
  const fabrique = new IDBFactory();
  let ouvert: DepotLocalDexie | undefined;
  let numero = 0;
  const espaces = new GestionEspacesIndexedDb({
    env: 'recette',
    fabrique,
    planificateur: new PlanificateurSimule(new TempsSimule(instant('2026-10-28T08:00:00.000Z'))),
    surOuverture: async (nomBase) => {
      numero += 1;
      const r = await DepotLocalDexie.ouvrirEspace({
        nomBase,
        fabrique,
        generateur: { genererUuidV7: () => `00000000-0000-7000-8000-00000000000${String(numero)}` },
      });
      if (!r.ok) return { ok: false, erreur: { type: 'EspaceInaccessible' } };
      ouvert = r.valeur;
      return succes(undefined);
    },
    surFermeture: () => {
      ouvert?.fermer();
      ouvert = undefined;
      return Promise.resolve();
    },
  });
  return { fabrique, espaces, ouvert: () => ouvert };
};

const noms = async (fabrique: IDBFactory) => (await fabrique.databases()).map((b) => b.name ?? '');

describe('GestionEspacesIndexedDb (ST-US-022 §5.2, §6.11)', () => {
  it('UT-COMP-US-022-30 ouvrir — crée l’espace du compte (nom sans sub) ; existeUnEspace devient vrai', async () => {
    const env = preparer();
    expect(await env.espaces.existeUnEspace()).toBe(false);

    expect(await env.espaces.ouvrir(IDENTITE_A.compte)).toEqual(succes(undefined));

    expect(await env.espaces.existeUnEspace()).toBe(true);
    expect(await noms(env.fabrique)).toEqual([await nomEspace('recette', IDENTITE_A.compte)]);
    expect((await noms(env.fabrique)).join()).not.toContain('sub-A');
  });

  it('UT-COMP-US-022-31 ouvrir un autre compte — ferme l’espace précédent ; fermer laisse les données', async () => {
    const env = preparer();
    await env.espaces.ouvrir(IDENTITE_A.compte);
    const premier = env.ouvert();

    await env.espaces.ouvrir(IDENTITE_B.compte);
    expect(await premier?.lire()).toEqual({ ok: false, erreur: { type: 'EspaceLocalNonOuvert' } });
    await env.espaces.fermer();

    expect(env.ouvert()).toBeUndefined();
    expect(await noms(env.fabrique)).toHaveLength(2);
  });

  it('UT-COMP-US-022-32 supprimer — retire le seul espace du compte, sans toucher celui d’un autre compte (S19)', async () => {
    const env = preparer();
    await env.espaces.ouvrir(IDENTITE_B.compte);
    await env.espaces.ouvrir(IDENTITE_A.compte);
    const ouvert = env.ouvert();
    expect(ouvert && valeurDe(await ouvert.lire()).version).toBe(0);

    expect(await env.espaces.supprimer(IDENTITE_A.compte)).toEqual(succes(undefined));

    expect(await noms(env.fabrique)).toEqual([await nomEspace('recette', IDENTITE_B.compte)]);
    expect(await env.espaces.existeUnEspace()).toBe(true);
  });
});

describe('AvisOngletsBroadcast (RL-LOT-001-A1)', () => {
  it('UT-COMP-US-022-33 diffuser — reçu par une autre instance, jamais par l’émetteur', async () => {
    const emetteur = new AvisOngletsBroadcast('recette');
    const autre = new AvisOngletsBroadcast('recette');
    const recusEmetteur: Array<AvisOnglet> = [];
    const recusAutre: Array<AvisOnglet> = [];
    const annuler = emetteur.ecouter((a) => recusEmetteur.push(a));
    const recu = new Promise<void>((resoudre) => {
      autre.ecouter((a) => {
        recusAutre.push(a);
        resoudre();
      });
    });

    emetteur.diffuser('SESSION_FERMEE');
    await recu;

    expect(recusAutre).toEqual(['SESSION_FERMEE']);
    expect(recusEmetteur).toEqual([]);
    annuler();
    emetteur.fermer();
    autre.fermer();
  });
});
