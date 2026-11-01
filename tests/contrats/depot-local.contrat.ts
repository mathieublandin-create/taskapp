/**
 * Suite de contrat du port DepotLocal (ST-socle-ecriture.md §4.3 ; conventions.md §11.10).
 * Exécutée sur DepotLocalDexie (fake-indexeddb) et sur la doublure DepotLocalEnMemoire (ST-US-017 §12.3).
 * CT-DEPOT-08 à 11 : méthodes de l'incrément 1 d'US-017 (lireMeta, appliquerSynchronisation).
 * CT-DEPOT-12, 13 : signalements de l'incrément 2 (lireSignalements, ST-US-017 v0.5 §4.6), rang 9.
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
import {
  META_INITIALE,
  type IdFichierDrive,
} from '@src/synchronisation/domaine/meta-synchronisation';
import type { Signalements } from '@src/synchronisation/domaine/signalements';
import type { ValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { DepotLocalEnMemoire, StockageDepotEnMemoire } from '@tests/doublures/depot-local-memoire';
import { registre, texteDeCle } from '@tests/support/fabriques/etat-local';
import { valeurDe } from '@tests/support/environnement';
import { planAjoutant, planVide } from '@tests/support/plans';
import {
  h as hSignalement,
  idArbitraire,
  intituleTache,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import {
  date,
  ecart,
  hlc,
  idEvenementTest,
  idObjectif,
  idOperation,
  idTache,
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
const DOSSIER = 'dossier-contrat' as IdFichierDrive;
const FICHIER = 'fichier-contrat' as IdFichierDrive;
const entreeEnAttente = {
  cle: { type: 'OBJECTIF', id: O, champ: 'intitule' } as const,
  premiereEcriture: instant('2026-10-21T08:00:00.000Z'),
  derniereHlc: h,
};

const T = idTache(1);
const conflit = (n: number, gagnante: string): ValeurEcartee => ({
  id: idArbitraire(n),
  motif: 'CONFLIT',
  ecartee: intituleTache(T, 'A', hSignalement(1, SMARTPHONE)),
  gagnante: intituleTache(T, gagnante, hSignalement(2, SMARTPHONE)),
});
const lecture = { id: idArbitraire(1), hlc: hSignalement(3, SMARTPHONE) };
const enTableaux = (s: Signalements) => ({
  valeursEcartees: [...s.valeursEcartees.values()],
  lectures: [...s.lectures.values()],
});

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

    // ST-US-017 §4.2 ; conditions de Starck sur Q-ST017-STA-1 : contrat et adaptateur en mémoire couvrent
    // lireMeta et appliquerSynchronisation, qui tient en une seule transaction stricte.
    it('CT-DEPOT-08 lireMeta — renvoie META_INITIALE pour un espace neuf', async () => {
      const { premier } = fabriquer();

      expect(valeurDe(await premier.lireMeta())).toEqual(META_INITIALE);
    });

    it('CT-DEPOT-09 appliquerSynchronisation — plan vide : fusionne la méta partielle, sans changer la version ni prévenir', async () => {
      const { premier, second } = fabriquer();
      let appels = 0;
      premier.observer(() => {
        appels += 1;
      });

      valeurDe(
        await premier.appliquerSynchronisation((etat) => ({
          plan: planVide(etat),
          meta: { dossier: DOSSIER },
        })),
      );
      valeurDe(
        await premier.appliquerSynchronisation((etat) => ({
          plan: planVide(etat),
          meta: { fichierPropre: FICHIER, deposeJusquA: h },
        })),
      );

      const autre = second();
      expect(valeurDe(await autre.lireMeta())).toEqual({
        dossier: DOSSIER,
        fichierPropre: FICHIER,
        deposeJusquA: h,
        fusionNonDeposee: false,
      });
      expect(valeurDe(await autre.lire()).version).toBe(0);
      expect(appels).toBe(0);
    });

    it('CT-DEPOT-10 appliquerSynchronisation — écrit le plan et la méta dans la même transaction, version + 1, observateurs prévenus', async () => {
      const { premier, second } = fabriquer();
      let appels = 0;
      premier.observer(() => {
        appels += 1;
      });
      valeurDe(
        await premier.appliquer((etat) =>
          succes({
            plan: planAjoutant(etat, {
              registres: [creation],
              enAttente: [entreeEnAttente],
              dernierHlc: h,
            }),
            valeur: undefined,
          }),
        ),
      );

      valeurDe(
        await premier.appliquerSynchronisation((etat) => ({
          plan: {
            ...planVide(etat),
            etatApres: { ...etat, enAttente: new Map() },
            enAttenteRetirees: [texteDeCle(entreeEnAttente.cle)],
          },
          meta: { fichierPropre: FICHIER, deposeJusquA: h },
        })),
      );

      const autre = second();
      const relu = valeurDe(await autre.lire());
      expect(relu.version).toBe(2);
      expect(relu.enAttente.size).toBe(0);
      expect(valeurDe(await autre.lireMeta())).toMatchObject({
        fichierPropre: FICHIER,
        deposeJusquA: h,
      });
      expect(appels).toBe(2);
    });

    it('CT-DEPOT-11 appliquerSynchronisation — transmet l’état et la méta à jour d’une autre instance ; une exception n’écrit ni plan ni méta', async () => {
      const { premier, second } = fabriquer();
      const autre = second();
      valeurDe(await autre.lireMeta());
      valeurDe(
        await premier.appliquerSynchronisation((etat) => ({
          plan: planAjoutant(etat, { registres: [creation], dernierHlc: h }),
          meta: { dossier: DOSSIER },
        })),
      );

      let vus: { readonly version: number; readonly dossier: unknown } | undefined;
      await expect(
        autre.appliquerSynchronisation((etat, meta) => {
          vus = { version: etat.version, dossier: meta.dossier };
          throw new Error('panne de calcul');
        }),
      ).rejects.toThrow('panne de calcul');

      expect(vus).toEqual({ version: 1, dossier: DOSSIER });
      expect(valeurDe(await autre.lireMeta())).toEqual({
        dossier: DOSSIER,
        fusionNonDeposee: false,
      });
      expect(valeurDe(await autre.lire()).version).toBe(1);
    });

    it('CT-DEPOT-12 lireSignalements — vides pour un espace neuf ; appliquerSynchronisation écrit les signalements, version + 1, observateurs prévenus', async () => {
      const { premier, second } = fabriquer();
      expect(enTableaux(valeurDe(await premier.lireSignalements()))).toEqual({
        valeursEcartees: [],
        lectures: [],
      });
      let appels = 0;
      premier.observer(() => {
        appels += 1;
      });

      valeurDe(
        await premier.appliquerSynchronisation((etat) => ({
          plan: planVide(etat),
          meta: {},
          signalements: { valeursEcartees: [conflit(1, 'B')], lectures: [lecture] },
        })),
      );

      const autre = second();
      expect(enTableaux(valeurDe(await autre.lireSignalements()))).toEqual({
        valeursEcartees: [conflit(1, 'B')],
        lectures: [lecture],
      });
      expect(valeurDe(await autre.lire()).version).toBe(1);
      expect(appels).toBe(1);
      let vus: Signalements | undefined;
      valeurDe(
        await autre.appliquerSynchronisation((etat, _meta, signalementsLus) => {
          vus = signalementsLus;
          return { plan: planVide(etat), meta: {} };
        }),
      );
      expect(vus && enTableaux(vus)).toEqual({
        valeursEcartees: [conflit(1, 'B')],
        lectures: [lecture],
      });
      expect(valeurDe(await autre.lire()).version).toBe(1);
    });

    it('CT-DEPOT-13 appliquerSynchronisation — une entrée de même identifiant est remplacée ; une exception n’écrit aucun signalement', async () => {
      const { premier, second } = fabriquer();
      valeurDe(
        await premier.appliquerSynchronisation((etat) => ({
          plan: planVide(etat),
          meta: {},
          signalements: { valeursEcartees: [conflit(1, 'B'), conflit(2, 'B')], lectures: [] },
        })),
      );
      valeurDe(
        await premier.appliquerSynchronisation((etat) => ({
          plan: planVide(etat),
          meta: {},
          signalements: { valeursEcartees: [conflit(1, 'C')], lectures: [] },
        })),
      );
      await expect(
        premier.appliquerSynchronisation(() => {
          throw new Error('panne de calcul');
        }),
      ).rejects.toThrow('panne de calcul');

      const relus = enTableaux(valeurDe(await second().lireSignalements()));
      expect(relus.valeursEcartees).toHaveLength(2);
      expect(relus.valeursEcartees).toEqual(
        expect.arrayContaining([conflit(1, 'C'), conflit(2, 'B')]),
      );
      expect(relus.lectures).toEqual([]);
      expect(valeurDe(await second().lire()).version).toBe(2);
    });
  });
};

decrireContratDepotLocal('DepotLocalEnMemoire', () => {
  const stockage = new StockageDepotEnMemoire(SMARTPHONE);
  return {
    premier: new DepotLocalEnMemoire(stockage),
    second: () => new DepotLocalEnMemoire(stockage),
  };
});

decrireContratDepotLocal('DepotLocalDexie sur fake-indexeddb', () => {
  const fabrique = new IDBFactory();
  const options = { nomBase: 'done-juan-contrat', fabrique, appareilId: SMARTPHONE };
  return { premier: new DepotLocalDexie(options), second: () => new DepotLocalDexie(options) };
});
