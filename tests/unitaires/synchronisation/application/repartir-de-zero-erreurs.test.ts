/**
 * « Repartir de zéro » (ST-US-017 v0.10.1 §6.7 n° 11 c) : chemins d'erreur de `CycleSynchronisation.repartirDeZero`.
 * Un échec avant la réinitialisation (étape 6) laisse l'état local intact, `dernierHlc` excepté ; si le fichier de G
 * a été déposé, le cycle suivant achève le choix (n° 11 b, C9). Panne ciblée d'un appel du transport ou du dépôt
 * local, sur FauxDrive et DepotLocalDexie réels. Compléments de couverture de Bruce (rang 10).
 */
import { describe, expect, it } from 'vitest';
import { echec, type Resultat } from '@src/commun/domaine/resultat';
import { CycleSynchronisation } from '@src/synchronisation/application/cycle-synchronisation';
import type {
  DepotLocal,
  ErreurDepotLocal,
} from '@src/synchronisation/application/ports/depot-local';
import type {
  ErreurTransport,
  TransportSynchro,
} from '@src/synchronisation/application/ports/transport-synchro';
import { HorlogeSimulee } from '@tests/doublures/horloge-simulee';
import { SourceAleatoireDeterministe } from '@tests/doublures/source-aleatoire-deterministe';
import { JournalEnMemoire } from '@tests/support/compte/doublures-compte';
import { valeurDe } from '@tests/support/environnement';
import { AccesCommandable, ReseauCommandable } from '@tests/support/synchronisation/appareil-cycle';
import {
  avecObjectifPublie,
  metaDe,
  objectifsDe,
  preparerRestauration,
} from '@tests/support/synchronisation/restauration';
import { SMARTPHONE } from '@tests/support/valeurs';

type Environnement = ReturnType<typeof preparerRestauration>;
type MethodeTransport = 'listerDossiers' | 'preparerDossier';
type MethodeDepot = 'lire' | 'appliquerSynchronisation';
/** Panne d'un appel du dépôt local : erreur rendue, ou exception (promesse rejetée). */
type PanneDepot = Partial<Record<MethodeDepot, ReadonlyArray<number>>> & {
  readonly rejeter?: boolean;
};

const SERVEUR_INDISPONIBLE: ErreurTransport = { type: 'ServeurIndisponible' };
const ECRITURE_IMPOSSIBLE = echec<ErreurDepotLocal>({ type: 'EcritureLocaleImpossible' });

/**
 * Cycle du smartphone (même dépôt local, même Drive) dont le transport rend une fois `ServeurIndisponible` pour les
 * méthodes de `pannesTransport`, et dont le dépôt local échoue aux appels numérotés (à partir de 1) de `pannesDepot`
 * (`EcritureLocaleImpossible`, ou exception pour `lire` si `rejeter`).
 */
const cycleEnPanne = (
  env: Environnement,
  pannesTransport: ReadonlyArray<MethodeTransport>,
  pannesDepot: PanneDepot = {},
) => {
  const reseau = new ReseauCommandable();
  const reel = env.drive.transportPour(SMARTPHONE, { reseau, accesAccorde: () => true });
  const enPanne = new Set<MethodeTransport>(pannesTransport);
  const panne = <T>(
    methode: MethodeTransport,
    appel: () => Promise<Resultat<T, ErreurTransport>>,
  ): Promise<Resultat<T, ErreurTransport>> => {
    if (!enPanne.delete(methode)) return appel();
    return Promise.resolve(echec(SERVEUR_INDISPONIBLE));
  };
  const transport: TransportSynchro = {
    ...reel,
    listerDossiers: () => panne('listerDossiers', () => reel.listerDossiers()),
    preparerDossier: () => panne('preparerDossier', () => reel.preparerDossier()),
  };
  const appels: Record<MethodeDepot, number> = { lire: 0, appliquerSynchronisation: 0 };
  const depotEnPanne = (methode: MethodeDepot): boolean => {
    appels[methode] += 1;
    return pannesDepot[methode]?.includes(appels[methode]) ?? false;
  };
  const vrai = env.smartphone.depot;
  const depot: DepotLocal = {
    lire: () => {
      if (!depotEnPanne('lire')) return vrai.lire();
      return pannesDepot.rejeter === true
        ? Promise.reject(new Error('panne du dépôt local'))
        : Promise.resolve(ECRITURE_IMPOSSIBLE);
    },
    appliquer: (calcul) => vrai.appliquer(calcul),
    observer: (rappel) => vrai.observer(rappel),
    lireMeta: () => vrai.lireMeta(),
    lireSignalements: () => vrai.lireSignalements(),
    appliquerSynchronisation: (calcul) =>
      depotEnPanne('appliquerSynchronisation')
        ? Promise.resolve(ECRITURE_IMPOSSIBLE)
        : vrai.appliquerSynchronisation(calcul),
  };
  return new CycleSynchronisation({
    depot,
    transport,
    acces: new AccesCommandable(),
    reseau,
    planificateur: env.planificateur,
    aleatoire: new SourceAleatoireDeterministe([500]),
    horloge: new HorlogeSimulee(env.temps),
    journal: new JournalEnMemoire(),
    versionApplication: '0.1.0',
  });
};

/** S22b : objectif publié, données du Drive supprimées, ERR-012 constaté par le smartphone. */
const apresAlteration = async (): Promise<Environnement> => {
  const env = preparerRestauration();
  await avecObjectifPublie(env);
  env.drive.supprimerDonnees();
  expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
  return env;
};

/** Rien n'a été effacé ni réinitialisé : l'objectif reste, aucune génération nouvelle mémorisée. */
const intact = async (env: Environnement): Promise<void> => {
  expect((await objectifsDe(env.smartphone)).size).toBe(1);
  expect((await metaDe(env.smartphone)).generation?.type).not.toBe('NOUVELLE');
};

describe('« Repartir de zéro » : chemins d’erreur (ST-US-017 v0.10.1 §6.7 n° 11 c)', () => {
  it('UT-COMP-US-017-3-101 lecture locale impossible : échec transitoire avant toute écriture dans le Drive, rien effacé', async () => {
    const env = await apresAlteration();
    const ecritures = env.drive.ecrituresPar(SMARTPHONE);

    expect(await cycleEnPanne(env, [], { lire: [1] }).repartirDeZero()).toBe('ECHEC_TRANSITOIRE');

    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);
    await intact(env);
  });

  it('UT-COMP-US-017-3-102 observation en 5xx : échec transitoire, aucun HLC consommé, rien écrit ni effacé', async () => {
    const env = await apresAlteration();
    const ecritures = env.drive.ecrituresPar(SMARTPHONE);
    const dernierHlc = valeurDe(await env.smartphone.depot.lire()).dernierHlc;

    expect(await cycleEnPanne(env, ['listerDossiers']).repartirDeZero()).toBe('ECHEC_TRANSITOIRE');

    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);
    expect(valeurDe(await env.smartphone.depot.lire()).dernierHlc).toEqual(dernierHlc);
    await intact(env);
  });

  it('UT-COMP-US-017-3-103 HLC du choix non enregistré (C3) : échec transitoire, rien écrit dans le Drive', async () => {
    const env = await apresAlteration();
    const ecritures = env.drive.ecrituresPar(SMARTPHONE);

    expect(await cycleEnPanne(env, [], { appliquerSynchronisation: [1] }).repartirDeZero()).toBe(
      'ECHEC_TRANSITOIRE',
    );

    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);
    await intact(env);
  });

  it('UT-COMP-US-017-3-104 dossier supprimé puis préparation en 5xx : échec transitoire, rien écrit, rien effacé', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    env.drive.supprimerDossiers();
    const ecritures = env.drive.ecrituresPar(SMARTPHONE);

    expect(await cycleEnPanne(env, ['preparerDossier']).repartirDeZero()).toBe('ECHEC_TRANSITOIRE');

    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);
    await intact(env);
  });

  it('UT-COMP-US-017-3-105 dépôt du fichier de G interrompu : échec transitoire, aucun manifeste écrit, rien effacé', async () => {
    const env = await apresAlteration();
    const ecritures = env.drive.ecrituresPar(SMARTPHONE);
    env.drive.interrompreDepots(1);

    expect(await cycleEnPanne(env, []).repartirDeZero()).toBe('ECHEC_TRANSITOIRE');

    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);
    await intact(env);
  });

  it('UT-COMP-US-017-3-106 réinitialisation locale impossible après le manifeste : échec transitoire, rien effacé ; le cycle suivant achève le choix (n° 11 b)', async () => {
    const env = await apresAlteration();

    expect(await cycleEnPanne(env, [], { appliquerSynchronisation: [2] }).repartirDeZero()).toBe(
      'ECHEC_TRANSITOIRE',
    );
    await intact(env);

    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect((await objectifsDe(env.smartphone)).size).toBe(0);
    const generation = (await metaDe(env.smartphone)).generation;
    expect(generation?.type === 'NOUVELLE' ? generation.hlc.appareil : undefined).toBe(SMARTPHONE);
  });

  it('UT-COMP-US-017-3-107 demandé pendant un cycle : attend sa fin, puis s’exécute (jamais deux cycles à la fois)', async () => {
    const env = await apresAlteration();
    const cycle = cycleEnPanne(env, []);
    const enCours = cycle.synchroniserMaintenant();

    const repartir = cycle.repartirDeZero();

    expect(await enCours).toBe('DONNEES_ALTEREES');
    expect(await repartir).toBe('TERMINE');
    expect((await objectifsDe(env.smartphone)).size).toBe(0);
  });

  it('UT-COMP-US-017-3-108 demandé pendant un cycle qui échoue sur exception : l’exception reste à ce cycle, « Repartir de zéro » s’exécute ensuite', async () => {
    const env = await apresAlteration();
    const cycle = cycleEnPanne(env, [], { lire: [1], rejeter: true });
    const enCours = cycle.synchroniserMaintenant();

    const repartir = cycle.repartirDeZero();

    await expect(enCours).rejects.toThrow('panne du dépôt local');
    expect(await repartir).toBe('TERMINE');
    expect((await objectifsDe(env.smartphone)).size).toBe(0);
  });
});
