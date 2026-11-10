/**
 * Contrat du port `VerrouOnglets` (ST-US-031 v0.4 §4.1, §13 ; DAT v0.11.12 §4.1.6), exécuté sur la doublure
 * `VerrouOngletsEnMemoire` et sur `VerrouOngletsWeb` posé sur un `LockManager` simulé (`RegistreVerrousSimule`).
 * CT-VER-01 exclusion ; 02 FIFO ; 03 rejet ; 04 main durable ; 05 demande abandonnée ; 06 fermeture d'un onglet ;
 * 07 `estTenu`. Rang 13 (`rangs-tests.json`).
 */
import { describe, expect, it } from 'vitest';
import type { VerrouOnglets } from '@src/synchronisation/application/ports/verrou-onglets';
import { VerrouOngletsWeb } from '@src/synchronisation/infrastructure/verrou-onglets-web';
import { RegistreVerrousSimule } from '@tests/doublures/lock-manager-simule';
import { VerrouOngletsEnMemoire, type OngletSimule } from '@tests/doublures/verrou-onglets-memoire';
import { JournalEnMemoire } from '@tests/support/compte/doublures-compte';
import { barriere, vider } from '@tests/support/synchronisation/onglets';

/** Un profil de navigateur : des onglets qui partagent les mêmes verrous ; la fermeture d'un onglet rend les siens. */
export type ProfilVerrous = {
  readonly onglet: () => VerrouOnglets;
  readonly fermer: (onglet: VerrouOnglets) => void;
};

const NOM = 'donejuan-recette-empreinte:synchronisation-cycle';
const AUTRE_NOM = 'donejuan-recette-empreinte:synchronisation-meneur';

export const decrireContratVerrouOnglets = (nom: string, profil: () => ProfilVerrous): void => {
  describe(`Contrat VerrouOnglets — ${nom}`, () => {
    it('CT-VER-01 exclusion — la tâche du second onglet ne commence qu’au règlement de la première ; un autre nom n’attend pas', async () => {
      const p = profil();
      const [a, b] = [p.onglet(), p.onglet()];
      const traces: Array<string> = [];
      const fin = barriere();

      const premiere = a.executerExclusivement(NOM, async () => {
        traces.push('a:debut');
        await fin.promesse;
        traces.push('a:fin');
        return 'a';
      });
      const seconde = b.executerExclusivement(NOM, () => {
        traces.push('b:debut');
        return Promise.resolve('b');
      });
      const autre = b.executerExclusivement(AUTRE_NOM, () => {
        traces.push('autre:debut');
        return Promise.resolve('autre');
      });
      await vider();

      expect(traces).toEqual(['a:debut', 'autre:debut']);
      expect(await autre).toBe('autre');
      fin.ouvrir();
      expect(await premiere).toBe('a');
      expect(await seconde).toBe('b');
      expect(traces).toEqual(['a:debut', 'autre:debut', 'a:fin', 'b:debut']);
    });

    it('CT-VER-02 FIFO — trois demandes sur un nom tenu sont servies dans l’ordre des appels, onglets mêlés', async () => {
      const p = profil();
      const [a, b, c] = [p.onglet(), p.onglet(), p.onglet()];
      const ordre: Array<string> = [];
      const fin = barriere();
      const tenue = a.executerExclusivement(NOM, () => fin.promesse);
      const demandes = [
        b.executerExclusivement(NOM, () => Promise.resolve(ordre.push('b1'))),
        c.executerExclusivement(NOM, () => Promise.resolve(ordre.push('c'))),
        b.executerExclusivement(NOM, () => Promise.resolve(ordre.push('b2'))),
      ];
      await vider();
      expect(ordre).toEqual([]);

      fin.ouvrir();
      await tenue;
      expect(await Promise.all(demandes)).toEqual([1, 2, 3]);
      expect(ordre).toEqual(['b1', 'c', 'b2']);
    });

    it('CT-VER-03 rejet — l’erreur de la tâche est renvoyée telle quelle et le verrou est rendu', async () => {
      const p = profil();
      const [a, b] = [p.onglet(), p.onglet()];
      const erreur = new Error('panne pendant le cycle');

      const echec = a.executerExclusivement(NOM, () => Promise.reject(erreur));
      const suivante = b.executerExclusivement(NOM, () => Promise.resolve('servie'));

      await expect(echec).rejects.toBe(erreur);
      expect(await suivante).toBe('servie');
      expect(await a.estTenu(NOM)).toBe(false);
    });

    it('CT-VER-04 main durable — quandObtenue une fois, après le retour de l’appel ; tenue jusqu’à rendre ; rendre idempotent', async () => {
      const p = profil();
      const [a, b, c] = [p.onglet(), p.onglet(), p.onglet()];
      const obtenues: Array<string> = [];

      const rendreA = a.demanderLaMain(NOM, () => obtenues.push('a'));
      expect(obtenues).toEqual([]);
      await vider();
      expect(obtenues).toEqual(['a']);

      const tacheDeB = b.executerExclusivement(NOM, () =>
        Promise.resolve(obtenues.push('tache-b')),
      );
      c.demanderLaMain(NOM, () => obtenues.push('c'));
      await vider();
      expect(obtenues).toEqual(['a']);

      rendreA();
      rendreA();
      expect(await tacheDeB).toBe(2);
      await vider();
      expect(obtenues).toEqual(['a', 'tache-b', 'c']);
    });

    it('CT-VER-05 demande abandonnée — rendre avant l’obtention : quandObtenue n’est jamais appelée et la file avance', async () => {
      const p = profil();
      const [a, b, c] = [p.onglet(), p.onglet(), p.onglet()];
      const obtenues: Array<string> = [];
      const rendreA = a.demanderLaMain(NOM, () => obtenues.push('a'));
      await vider();

      const rendreB = b.demanderLaMain(NOM, () => obtenues.push('b'));
      c.demanderLaMain(NOM, () => obtenues.push('c'));
      rendreB();
      rendreB();
      rendreA();
      await vider();

      expect(obtenues).toEqual(['a', 'c']);
      // Abandon immédiat, sur un nom libre : jamais obtenue.
      const p2 = profil();
      const rendre = p2.onglet().demanderLaMain(NOM, () => obtenues.push('immediat'));
      rendre();
      await vider();
      expect(obtenues).toEqual(['a', 'c']);
      expect(await p2.onglet().estTenu(NOM)).toBe(false);
    });

    it('CT-VER-06 fermeture d’un onglet — ses verrous sont rendus ; le premier en attente obtient la main', async () => {
      const p = profil();
      const [a, b, c] = [p.onglet(), p.onglet(), p.onglet()];
      const obtenues: Array<string> = [];
      a.demanderLaMain(NOM, () => obtenues.push('a'));
      void a.executerExclusivement(AUTRE_NOM, () => new Promise<never>(() => undefined));
      b.demanderLaMain(NOM, () => obtenues.push('b'));
      const tacheDeC = c.executerExclusivement(AUTRE_NOM, () => Promise.resolve('c'));
      await vider();
      expect(obtenues).toEqual(['a']);

      p.fermer(a);
      await vider();

      expect(obtenues).toEqual(['a', 'b']);
      expect(await tacheDeC).toBe('c');
    });

    it('CT-VER-07 estTenu — faux si libre ; vrai pendant une tâche ou une main tenue, vu de tout onglet ; faux après', async () => {
      const p = profil();
      const [a, b] = [p.onglet(), p.onglet()];
      expect(await b.estTenu(NOM)).toBe(false);

      const fin = barriere();
      const tache = a.executerExclusivement(NOM, () => fin.promesse);
      await vider();
      expect([await a.estTenu(NOM), await b.estTenu(NOM), await b.estTenu(AUTRE_NOM)]).toEqual([
        true,
        true,
        false,
      ]);
      fin.ouvrir();
      await tache;
      expect(await b.estTenu(NOM)).toBe(false);

      const rendre = b.demanderLaMain(NOM, () => undefined);
      await vider();
      expect(await a.estTenu(NOM)).toBe(true);
      rendre();
      await vider();
      expect(await a.estTenu(NOM)).toBe(false);
    });
  });
};

decrireContratVerrouOnglets('VerrouOngletsEnMemoire', () => {
  const verrous = new VerrouOngletsEnMemoire();
  return {
    onglet: () => verrous.onglet(),
    fermer: (onglet) => {
      verrous.fermerOnglet((onglet as OngletSimule).id);
    },
  };
});

decrireContratVerrouOnglets('VerrouOngletsWeb sur un LockManager simulé', () => {
  const registre = new RegistreVerrousSimule();
  const clients = new Map<VerrouOnglets, string>();
  return {
    onglet: () => {
      const id = `client-${String(clients.size + 1)}`;
      const verrou = new VerrouOngletsWeb({
        gestionnaire: registre.client(id),
        journal: new JournalEnMemoire(),
      });
      clients.set(verrou, id);
      return verrou;
    },
    fermer: (onglet) => {
      registre.fermerClient(clients.get(onglet) ?? '');
    },
  };
});
