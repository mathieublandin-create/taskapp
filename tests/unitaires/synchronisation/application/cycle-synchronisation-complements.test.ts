/**
 * Tests complémentaires de CycleSynchronisation (ST-US-017 §6.3, §6.4) et de DepotAvantSortieSynchro (§6.5), au-delà
 * des UT-US-017-17 à 32 : demandes concurrentes, arrêt, premier plan, erreurs non transitoires, fichiers ignorés.
 */
import { describe, expect, it } from 'vitest';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import { echec } from '@src/commun/domaine/resultat';
import {
  CycleSynchronisation,
  type IssueCycle,
} from '@src/synchronisation/application/cycle-synchronisation';
import { DepotAvantSortieSynchro } from '@src/synchronisation/application/depot-avant-sortie-synchro';
import type { TransportSynchro } from '@src/synchronisation/application/ports/transport-synchro';
import { FauxDrive } from '@tests/doublures/faux-drive';
import { HorlogeSimulee } from '@tests/doublures/horloge-simulee';
import { PlanificateurSimule } from '@tests/doublures/planificateur-simule';
import { SourceAleatoireDeterministe } from '@tests/doublures/source-aleatoire-deterministe';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { JournalEnMemoire } from '@tests/support/compte/doublures-compte';
import { appliquerModifications, valeurDe } from '@tests/support/environnement';
import { creationObjectif } from '@tests/support/modifications';
import {
  AccesCommandable,
  creerAppareilCycle,
  ReseauCommandable,
  type AppareilCycle,
} from '@tests/support/synchronisation/appareil-cycle';
import { ecart, idObjectif, instant, MINUTE, PC, SMARTPHONE } from '@tests/support/valeurs';

const preparer = () => {
  const temps = new TempsSimule(instant('2026-10-21T08:00:00.000Z'));
  const planificateur = new PlanificateurSimule(temps);
  const drive = new FauxDrive(temps);
  const appareil = (appareilId: IdAppareil, prefixe: string) =>
    creerAppareilCycle({ appareilId, prefixe, drive, temps, planificateur });
  const avancer = async (ms: number, a: AppareilCycle) => {
    temps.avancer(ecart(ms));
    planificateur.executerEchus();
    await (a.cycle.cycleEnCours() ?? Promise.resolve(undefined));
  };
  return { temps, planificateur, drive, appareil, avancer };
};

const creer = (a: AppareilCycle, n: number) =>
  appliquerModifications(a.service, (_etat, contexte) => [
    creationObjectif({ id: idObjectif(n), intitule: `Objectif ${String(n)}` }, contexte.instant),
  ]);
const enAttente = async (a: AppareilCycle) =>
  valeurDe(await a.service.lireDecompteEnAttente()).nombre;
const avertissements = (a: AppareilCycle) =>
  a.journal.entrees.filter((e) => e.niveau === 'avertissement').map((e) => e.evenement);

describe('CycleSynchronisation, compléments (ST-US-017 §6.3, §6.4)', () => {
  it('UT-COMP-US-017-10 une demande pendant un cycle rend DEJA_EN_COURS et fait relancer un cycle complet à sa fin', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    await creer(smartphone, 1);

    const premier = smartphone.cycle.synchroniserMaintenant();
    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('DEJA_EN_COURS');
    const reponsesAvant = env.drive.nombreReponses(SMARTPHONE);

    expect(await premier).toBe('TERMINE');
    expect(smartphone.cycle.cycleEnCours()).toBeUndefined();
    expect(env.drive.nombreReponses(SMARTPHONE)).toBeGreaterThan(reponsesAvant + 1);
  });

  it('UT-COMP-US-017-11 deposerMaintenant attend la fin du cycle en cours, puis dépose seul', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    const enCours = smartphone.cycle.synchroniserMaintenant();
    await creer(smartphone, 1);

    expect(await smartphone.cycle.deposerMaintenant()).toBe('TERMINE');
    expect(await enCours).toBe('TERMINE');
    expect(await enAttente(smartphone)).toBe(0);
  });

  it('UT-COMP-US-017-12 arreter retire les déclencheurs ; demarrer est idempotent ; ni réseau coupé ni accès inchangé ne déclenchent', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    smartphone.cycle.demarrer();
    smartphone.cycle.demarrer();
    smartphone.reseau.changer(false);
    smartphone.reseau.changer(true);
    await smartphone.cycle.cycleEnCours();
    const ecritures = env.drive.ecrituresPar(SMARTPHONE);
    smartphone.acces.changer('VALIDE');
    expect(smartphone.cycle.cycleEnCours()).toBeUndefined();

    smartphone.cycle.arreter();
    await creer(smartphone, 1);
    await env.avancer(5 * MINUTE, smartphone);

    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);
    expect(await enAttente(smartphone)).toBe(1);
  });

  it('UT-COMP-US-017-13 page masquée : plus de cycle toutes les 2 min ; retour au premier plan : un cycle, et la période reprend', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    smartphone.cycle.definirPremierPlan(true);
    expect(smartphone.cycle.cycleEnCours()).toBeUndefined();
    smartphone.cycle.demarrer();
    smartphone.cycle.definirPremierPlan(false);
    const reponses = env.drive.nombreReponses(SMARTPHONE);

    await env.avancer(10 * MINUTE, smartphone);
    expect(env.drive.nombreReponses(SMARTPHONE)).toBe(reponses);

    smartphone.cycle.definirPremierPlan(true);
    await smartphone.cycle.cycleEnCours();
    const apresRetour = env.drive.nombreReponses(SMARTPHONE);
    expect(apresRetour).toBeGreaterThan(reponses);
    await env.avancer(2 * MINUTE, smartphone);
    expect(env.drive.nombreReponses(SMARTPHONE)).toBeGreaterThan(apresRetour);
  });

  it('UT-COMP-US-017-14 Drive désactivé (403) : action requise, échec persistant, sans nouvelle tentative programmée', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    env.drive.desactiverPourLeCompte();

    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('ECHEC_TRANSITOIRE');

    expect(smartphone.cycle.etatMoteur()).toEqual({
      cycle: 'REPOS',
      actionRequise: 'ECHEC_PERSISTANT',
      aLire: 0,
    });
    expect(env.planificateur.prochaineEcheance()).toBeUndefined();
    expect(avertissements(smartphone)).toContain('SynchronisationEchec');
  });

  it('UT-COMP-US-017-15 un fichier d’un autre appareil illisible ou un manifeste altéré sont ignorés et journalisés, sans arrêter le cycle', async () => {
    const env = preparer();
    const pc = env.appareil(PC, '02');
    await creer(pc, 1);
    await pc.cycle.synchroniserMaintenant();
    env.drive
      .fichiers()
      .filter((f) => f.appProperties['donejuan'] !== 'dossier' && f.nom !== 'LISEZ-MOI.txt')
      .forEach((f) => {
        env.drive.modifierFichierALaMain(f.id);
      });
    const smartphone = env.appareil(SMARTPHONE, '01');

    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');

    expect(avertissements(smartphone)).toEqual(['FichierAppareilIgnore', 'ManifesteIgnore']);
    expect(valeurDe(await smartphone.service.lire()).objectifs.size).toBe(0);
  });

  it('UT-COMP-US-017-16 dépôt interrompu par le réseau : échec transitoire, au repos, sans tentative ni action', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    await creer(smartphone, 1);
    env.drive.interrompreDepots(1);

    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('ECHEC_TRANSITOIRE');

    expect(smartphone.cycle.etatMoteur()).toEqual({ cycle: 'REPOS', aLire: 0 });
    expect(await enAttente(smartphone)).toBe(1);
  });

  it('UT-COMP-US-017-17 espace local fermé : échec transitoire journalisé ; exception d’un adaptateur propagée, moteur au repos, consignée en erreur par un déclencheur', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    smartphone.depot.fermer();
    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('ECHEC_TRANSITOIRE');
    expect(avertissements(smartphone)).toContain('SynchronisationEchec');

    const reseau = new ReseauCommandable(false);
    const journal = new JournalEnMemoire();
    const panne = (): never => {
      throw new Error('panne');
    };
    const cycle = new CycleSynchronisation({
      depot: env.appareil(PC, '02').depot,
      transport: { preparerDossier: panne } as unknown as TransportSynchro,
      acces: new AccesCommandable(),
      reseau,
      planificateur: env.planificateur,
      aleatoire: new SourceAleatoireDeterministe([0]),
      horloge: new HorlogeSimulee(env.temps),
      journal,
      versionApplication: '0.1.0',
    });
    cycle.demarrer();
    reseau.changer(true);
    await expect(cycle.cycleEnCours()).rejects.toThrow('panne');
    await Promise.resolve();

    expect(cycle.etatMoteur().cycle).toBe('REPOS');
    expect(journal.entrees).toContainEqual({
      niveau: 'erreur',
      evenement: 'SynchronisationInterrompue',
      champs: { erreur: 'Error' },
    });
  });
});

describe('DepotAvantSortieSynchro (ST-US-017 §6.5)', () => {
  const sortie = (p: {
    readonly connecte: boolean;
    readonly acces?: AccesCommandable;
    readonly issue?: IssueCycle;
  }) => {
    const appels: Array<string> = [];
    const depot = new DepotAvantSortieSynchro({
      depot: { lire: () => Promise.resolve(echec({ type: 'EspaceLocalNonOuvert' } as const)) },
      cycle: {
        deposerMaintenant: () => {
          appels.push('deposer');
          return Promise.resolve(p.issue ?? 'TERMINE');
        },
      },
      reseau: new ReseauCommandable(p.connecte),
      acces: p.acces ?? new AccesCommandable(),
    });
    return { depot, appels };
  };

  it('UT-COMP-US-017-20 deposerSiPossible — NON_TENTE hors ligne ou sans accès valide ; DEPOSE si le dépôt aboutit, ECHEC sinon', async () => {
    const horsLigne = sortie({ connecte: false });
    expect(await horsLigne.depot.deposerSiPossible()).toBe('NON_TENTE');
    expect(horsLigne.appels).toEqual([]);
    expect(
      await sortie({
        connecte: true,
        acces: new AccesCommandable('PERDU'),
      }).depot.deposerSiPossible(),
    ).toBe('NON_TENTE');
    expect(await sortie({ connecte: true }).depot.deposerSiPossible()).toBe('DEPOSE');
    expect(await sortie({ connecte: true, issue: 'DRIVE_PLEIN' }).depot.deposerSiPossible()).toBe(
      'ECHEC',
    );
  });

  it('UT-COMP-US-017-21 compterEnAttente — décompte par élément ; espace illisible : 0', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    await creer(smartphone, 1);
    await creer(smartphone, 2);
    const reel = new DepotAvantSortieSynchro({
      depot: smartphone.depot,
      cycle: smartphone.cycle,
      reseau: smartphone.reseau,
      acces: smartphone.acces,
    });

    expect(await reel.compterEnAttente()).toBe(2);
    expect(await sortie({ connecte: true }).depot.compterEnAttente()).toBe(0);
  });
});
