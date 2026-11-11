/**
 * ST-US-031 v0.4 §6.1, §6.2, §11 (rang 13, tranches B1 et B2) ; ENF-06 ; S16. Deux onglets d'un même PC : deux
 * `DepotLocalDexie` sur la même `IDBFactory` (même espace, même `appareilId`), deux `CycleSynchronisation` sur le même
 * `FauxDrive`, un `VerrouOngletsEnMemoire` partagé.
 * UT-US-031-08 : propriété sur l'entrelacement des écritures et des exécutions (gestes dans l'un ou l'autre onglet) :
 * jamais deux exécutions à la fois, un seul fichier d'appareil, chaque élément exactement une fois, rien en attente.
 * UT-US-031-09 : une écriture dans l'onglet suiveur arme la temporisation de 5 s du meneur, qui dépose seul.
 */
import fc from 'fast-check';
import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it, vi } from 'vitest';
import { CoordinationOnglets } from '@src/synchronisation/application/coordination-onglets';
import type { ExclusionCycle } from '@src/synchronisation/application/exclusion-cycle';
import { FauxDrive } from '@tests/doublures/faux-drive';
import { PlanificateurSimule } from '@tests/doublures/planificateur-simule';
import { VerrouOngletsEnMemoire, type OngletSimule } from '@tests/doublures/verrou-onglets-memoire';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { appliquerModifications, valeurDe } from '@tests/support/environnement';
import { creationObjectif } from '@tests/support/modifications';
import {
  creerAppareilCycle,
  type AppareilCycle,
} from '@tests/support/synchronisation/appareil-cycle';
import { objectifsDuDrive } from '@tests/support/synchronisation/drive-banc';
import { vider } from '@tests/support/synchronisation/onglets';
import { ecart, idObjectif, instant, PC } from '@tests/support/valeurs';

const ESPACE = 'donejuan-test-espace';
const CYCLE = `${ESPACE}:synchronisation-cycle`;

const exclusionSur = (onglet: OngletSimule): ExclusionCycle => ({
  executer: (tache) => onglet.executerExclusivement(CYCLE, tache),
});

const preparer = () => {
  const temps = new TempsSimule(instant('2026-10-21T08:00:00.000Z'));
  const planificateur = new PlanificateurSimule(temps);
  const drive = new FauxDrive(temps);
  const fabrique = new IDBFactory();
  const verrous = new VerrouOngletsEnMemoire();
  const onglet = (prefixe: string) => {
    const verrou = verrous.onglet();
    const appareil = creerAppareilCycle({
      appareilId: PC,
      prefixe,
      drive,
      temps,
      planificateur,
      fabrique,
      exclusion: exclusionSur(verrou),
    });
    return { verrou, appareil };
  };
  return { temps, planificateur, drive, verrous, onglets: [onglet('01'), onglet('02')] as const };
};

const intitule = (n: number): string => `Objectif ${String(n)}`;

const creer = (a: AppareilCycle, n: number) =>
  appliquerModifications(a.service, (_etat, contexte) => [
    creationObjectif({ id: idObjectif(n), intitule: intitule(n) }, contexte.instant),
  ]);

const fichiersDuPc = (drive: FauxDrive) =>
  drive
    .fichiers()
    .filter(
      (f) =>
        !f.supprime &&
        f.appProperties['donejuan'] === 'appareil' &&
        f.appProperties['appareil'] === PC,
    );

/** Relève les chevauchements : une exécution qui commence pendant celle de l'autre onglet. */
const surveillerChevauchements = (cycles: ReadonlyArray<AppareilCycle>) => {
  const actifs = new Set<number>();
  const chevauchements: Array<string> = [];
  cycles.forEach((a, indice) => {
    a.cycle.observer(() => {
      if (a.cycle.cycleEnCours() === undefined) {
        actifs.delete(indice);
        return;
      }
      if ([...actifs].some((autre) => autre !== indice)) {
        chevauchements.push(`onglet ${String(indice + 1)} pendant l'autre`);
      }
      actifs.add(indice);
    });
  });
  return chevauchements;
};

type Lancement = {
  readonly onglet: 0 | 1;
  readonly sorte: 'SYNCHRONISER' | 'DEPOSER';
  /** Microtâches laissées passer avant ce lancement. */
  readonly decalage: number;
};

const lancement: fc.Arbitrary<Lancement> = fc.record({
  onglet: fc.constantFrom<0 | 1>(0, 1),
  sorte: fc.constantFrom<'SYNCHRONISER' | 'DEPOSER'>('SYNCHRONISER', 'DEPOSER'),
  decalage: fc.integer({ min: 0, max: 3 }),
});

const laisserPasser = async (microtaches: number): Promise<void> => {
  for (let i = 0; i < microtaches; i += 1) await Promise.resolve();
};

describe('Deux onglets du PC (ST-US-031 §6.2, ENF-06)', () => {
  it('UT-US-031-08 entrelacements — jamais deux exécutions à la fois ; un seul fichier d’appareil ; chaque élément exactement une fois ; rien en attente', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom<0 | 1>(0, 1), { minLength: 1, maxLength: 4 }),
        fc.array(lancement, { minLength: 2, maxLength: 4 }),
        async (ecrivains, lancements) => {
          const env = preparer();
          const cycles = env.onglets.map((o) => o.appareil);
          const chevauchements = surveillerChevauchements(cycles);
          for (const [n, ecrivain] of ecrivains.entries()) {
            valeurDe(await creer(env.onglets[ecrivain].appareil, n + 1));
          }

          const executions: Array<Promise<unknown>> = [];
          for (const l of lancements) {
            await laisserPasser(l.decalage);
            const { cycle } = env.onglets[l.onglet].appareil;
            executions.push(
              l.sorte === 'SYNCHRONISER'
                ? cycle.synchroniserMaintenant()
                : cycle.deposerMaintenant(),
            );
          }
          await Promise.all(executions);
          for (const a of cycles) await a.cycle.synchroniserMaintenant();

          expect(chevauchements).toEqual([]);
          expect(fichiersDuPc(env.drive)).toHaveLength(1);
          for (const n of ecrivains.keys()) {
            expect(await objectifsDuDrive(env.drive, intitule(n + 1))).toHaveLength(1);
          }
          for (const a of cycles) {
            expect(valeurDe(await a.service.lireDecompteEnAttente()).nombre).toBe(0);
          }
        },
      ),
      { numRuns: 20 },
    );
  });

  it('UT-US-031-09 écriture dans l’onglet suiveur — temporisation de 5 s du meneur armée ; dépôt par le meneur seul, à 5 s et pas avant', async () => {
    const env = preparer();
    const [meneur, suiveur] = env.onglets;
    const coordination = (o: (typeof env.onglets)[number]) =>
      new CoordinationOnglets({
        verrou: o.verrou,
        cycle: o.appareil.cycle,
        acces: o.appareil.acces,
        nomEspace: ESPACE,
        journal: o.appareil.journal,
      });
    coordination(meneur).demarrer();
    await vider();
    await meneur.appareil.cycle.cycleEnCours();
    coordination(suiveur).demarrer();
    await vider();
    const executionsDuSuiveur = { nombre: 0 };
    suiveur.appareil.cycle.observer(() => {
      executionsDuSuiveur.nombre += 1;
    });
    const debut = env.temps.maintenant();
    // Avant l'écriture, seule la période de 2 min du meneur est programmée.
    expect(env.planificateur.prochaineEcheance()).toBe(debut + 120_000);

    valeurDe(await creer(suiveur.appareil, 1));

    await vi.waitFor(() => {
      expect(env.planificateur.prochaineEcheance()).toBe(debut + 5_000);
    });
    env.temps.avancer(ecart(4_999));
    env.planificateur.executerEchus();
    expect(meneur.appareil.cycle.cycleEnCours()).toBeUndefined();
    expect(await objectifsDuDrive(env.drive, intitule(1))).toHaveLength(0);

    env.temps.avancer(ecart(1));
    env.planificateur.executerEchus();
    await meneur.appareil.cycle.cycleEnCours();

    expect(await objectifsDuDrive(env.drive, intitule(1))).toHaveLength(1);
    expect(executionsDuSuiveur.nombre).toBe(0);
    expect(valeurDe(await suiveur.appareil.service.lireDecompteEnAttente()).nombre).toBe(0);
  });
});
