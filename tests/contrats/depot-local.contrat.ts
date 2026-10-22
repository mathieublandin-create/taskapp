/**
 * Suite de contrat du port DepotLocal (ST-socle-ecriture.md §4.3 ; conventions.md §11.10).
 * Exécutée sur DepotLocalDexie (fake-indexeddb) ; ST-US-018 l'exécutera aussi sur DepotLocalSqlite.
 * Identifiants : CT-DEPOT-nn. Les cas « erreur de la base » et « espace non ouvert » sont couverts
 * par les tests d'intégration de l'adaptateur (ST-socle-ecriture.md §14).
 * Précision E10 : les observateurs de l'instance qui écrit sont appelés après la validation et au plus
 * tard à la résolution de la promesse d'`appliquer` (CT-DEPOT-05).
 */
import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import type { DepotLocal } from '@src/synchronisation/application/ports/depot-local';
import type { EvenementJournal } from '@src/synchronisation/domaine/evenement-journal';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { registre } from '@tests/support/fabriques/etat-local';
import { valeurDe } from '@tests/support/environnement';
import { planAjoutant, planVide } from '@tests/support/plans';
import {
  date,
  ecart,
  hlc,
  idEvenementTest,
  idObjectif,
  idOperation,
  instant,
  SMARTPHONE,
} from '@tests/support/valeurs';

const O = idObjectif(1);
const h = hlc('2026-10-21T08:00:00.000Z', 0, SMARTPHONE);
const creation = registre(
  { type: 'OBJECTIF', id: O, champ: 'creation' },
  { creeLe: instant('2026-10-21T08:00:00.000Z') },
  h,
);
const intitule = registre({ type: 'OBJECTIF', id: O, champ: 'intitule' }, 'Publier le guide', h);
const evenement: EvenementJournal = {
  type: 'CREATION',
  element: { type: 'OBJECTIF', id: O },
  avant: {},
  apres: {},
  id: idEvenementTest(idOperation(1), 0),
  hlc: h,
  instant: instant('2026-10-21T08:00:00.000Z'),
  jour: date('2026-10-21'),
};
const entreeEnAttente = {
  cle: { type: 'OBJECTIF', id: O, champ: 'intitule' } as const,
  premiereEcriture: instant('2026-10-21T08:00:00.000Z'),
  derniereHlc: h,
};

/** Fabrique deux instances qui partagent le même stockage (deux onglets, ou un redémarrage). */
export type FabriqueDepots = () => {
  readonly premier: DepotLocal;
  readonly second: () => DepotLocal;
};

export const decrireContratDepotLocal = (nom: string, fabriquer: FabriqueDepots): void => {
  describe(`Contrat DepotLocal — ${nom}`, () => {
    it('CT-DEPOT-01 lire — renvoie un état vide, version 0, sans dernier HLC, pour un espace neuf', async () => {
      const { premier } = fabriquer();

      const etat = valeurDe(await premier.lire());

      expect(etat).toEqual({
        appareilId: SMARTPHONE,
        version: 0,
        correctionHorloge: ecart(0),
        registres: new Map(),
        journal: new Map(),
        enAttente: new Map(),
      });
    });

    it('CT-DEPOT-02 appliquer — transmet au calcul l’état à jour, y compris l’écriture d’une autre instance', async () => {
      const { premier, second } = fabriquer();
      const autre = second();
      valeurDe(await autre.lire());
      valeurDe(
        await premier.appliquer((etat) =>
          succes({
            plan: planAjoutant(etat, { registres: [creation], dernierHlc: h }),
            valeur: undefined,
          }),
        ),
      );

      const vu = valeurDe(
        await autre.appliquer((etat) => succes({ plan: planVide(etat), valeur: etat })),
      );

      expect(vu.version).toBe(1);
      expect([...vu.registres.values()]).toEqual([creation]);
    });

    it('CT-DEPOT-03 appliquer — renvoie l’Echec du calcul tel quel et n’écrit rien', async () => {
      const { premier } = fabriquer();
      const avant = await premier.lire();

      const resultat = await premier.appliquer(() => echec({ type: 'RefusDeTest' }));

      expect(resultat).toEqual(echec({ type: 'RefusDeTest' }));
      expect(await premier.lire()).toEqual(avant);
    });

    it('CT-DEPOT-04 appliquer — renvoie la valeur sans rien écrire ni changer la version quand le plan est vide', async () => {
      const { premier } = fabriquer();
      let appels = 0;
      premier.observer(() => {
        appels += 1;
      });

      const resultat = await premier.appliquer((etat) =>
        succes({ plan: planVide(etat), valeur: 'rien' }),
      );

      expect(resultat).toEqual(succes('rien'));
      expect(valeurDe(await premier.lire()).version).toBe(0);
      expect(appels).toBe(0);
    });

    it('CT-DEPOT-05 appliquer — écrit tout le plan, augmente la version de 1 et a prévenu les observateurs quand la promesse est résolue', async () => {
      const { premier, second } = fabriquer();
      let appels = 0;
      premier.observer(() => {
        appels += 1;
      });

      valeurDe(
        await premier.appliquer((etat) =>
          succes({
            plan: planAjoutant(etat, {
              registres: [creation, intitule],
              evenements: [evenement],
              enAttente: [entreeEnAttente],
              dernierHlc: h,
            }),
            valeur: undefined,
          }),
        ),
      );
      const relu = valeurDe(await second().lire());

      expect(appels).toBe(1);
      expect(relu.version).toBe(1);
      expect(relu.dernierHlc).toEqual(h);
      expect([...relu.registres.values()]).toEqual([creation, intitule]);
      expect([...relu.journal.values()]).toEqual([evenement]);
      expect([...relu.enAttente.values()]).toEqual([
        {
          cle: entreeEnAttente.cle,
          entree: { premiereEcriture: entreeEnAttente.premiereEcriture, derniereHlc: h },
        },
      ]);
    });

    it('CT-DEPOT-06 appliquer — n’écrit rien et propage l’exception quand le calcul en lève une', async () => {
      const { premier } = fabriquer();
      const avant = await premier.lire();

      await expect(
        premier.appliquer(() => {
          throw new Error('panne de calcul');
        }),
      ).rejects.toThrow('panne de calcul');
      expect(await premier.lire()).toEqual(avant);
    });

    it('CT-DEPOT-07 observer — n’appelle plus le rappel après le désabonnement', async () => {
      const { premier } = fabriquer();
      let appels = 0;
      const desabonner = premier.observer(() => {
        appels += 1;
      });
      desabonner();

      valeurDe(
        await premier.appliquer((etat) =>
          succes({
            plan: planAjoutant(etat, { registres: [creation], dernierHlc: h }),
            valeur: undefined,
          }),
        ),
      );

      expect(appels).toBe(0);
    });
  });
};

decrireContratDepotLocal('DepotLocalDexie sur fake-indexeddb', () => {
  const fabrique = new IDBFactory();
  const options = { nomBase: 'done-juan-contrat', fabrique, appareilId: SMARTPHONE };
  return { premier: new DepotLocalDexie(options), second: () => new DepotLocalDexie(options) };
});
