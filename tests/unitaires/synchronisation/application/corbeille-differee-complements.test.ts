/**
 * Compléments de H4 sur la reprise des mises à la corbeille (DT-036 ; ST-US-017 v0.11 §6.8 n° 18 à 21) : transactions
 * d'inscription et de reprise en échec, dossier quitté introuvable, inventaire ou corbeille du dossier en échec,
 * jamais par le dépôt seul. UT-COMP-US-017-4-39 à 4-44 (rang 11, tranche H4, Bruce).
 */
import { describe, expect, it } from 'vitest';
import { echec } from '@src/commun/domaine/resultat';
import { CycleSynchronisation } from '@src/synchronisation/application/cycle-synchronisation';
import type { DepotLocal } from '@src/synchronisation/application/ports/depot-local';
import type { IdFichierDrive } from '@src/synchronisation/domaine/meta-synchronisation';
import { HorlogeSimulee } from '@tests/doublures/horloge-simulee';
import { SourceAleatoireDeterministe } from '@tests/doublures/source-aleatoire-deterministe';
import { JournalEnMemoire } from '@tests/support/compte/doublures-compte';
import { valeurDe } from '@tests/support/environnement';
import { AccesCommandable, ReseauCommandable } from '@tests/support/synchronisation/appareil-cycle';
import { cycleEnPanne } from '@tests/support/synchronisation/pannes-cycle';
import {
  avecObjectifPublie,
  DEPART,
  metaDe,
  preparerRestauration,
} from '@tests/support/synchronisation/restauration';
import { creationObjectif } from '@tests/support/modifications';
import { appliquerModifications } from '@tests/support/environnement';
import { idObjectif, instant, PC, SMARTPHONE } from '@tests/support/valeurs';

type Env = ReturnType<typeof preparerRestauration>;

const T0 = instant(DEPART);

/** Dossier en double : le smartphone déménage vers le canonique (le PC reste dans l'ancien). */
const avecDossierEnDouble = async () => {
  const env = preparerRestauration();
  await avecObjectifPublie(env);
  const [ancien] = env.drive.dossiers();
  if (ancien === undefined) throw new Error('dossier attendu');
  const canonique = env.drive.ajouterDossier(PC, T0 - 60_000);
  return { env, ancien: ancien.id as IdFichierDrive, canonique };
};

/** Déménagement du smartphone seul (le PC a déjà déménagé), sa suppression de l'ancien fichier propre en échec. */
const avecListe = async () => {
  const { env, ancien, canonique } = await avecDossierEnDouble();
  expect(await env.pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
  const ancienPropre = (await metaDe(env.smartphone)).fichierPropre;
  if (ancienPropre === undefined) throw new Error('fichier propre attendu');
  env.drive.echouerProchainesSuppressions(1);
  expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
  expect((await metaDe(env.smartphone)).aMettreALaCorbeille).toHaveLength(2);
  return { env, ancien, canonique, ancienPropre };
};

/**
 * Cycle du smartphone (même dépôt, même Drive) dont chaque transaction qui écrit `aMettreALaCorbeille` échoue ; le
 * calcul est évalué une fois de plus sur les lectures courantes pour le reconnaître (il est pur).
 */
const cycleSansCorbeille = (env: Env) => {
  const vrai = env.smartphone.depot;
  const depot: DepotLocal = {
    lire: () => vrai.lire(),
    lireMeta: () => vrai.lireMeta(),
    lireSignalements: () => vrai.lireSignalements(),
    lireInconnus: () => vrai.lireInconnus(),
    appliquer: (calcul) => vrai.appliquer(calcul),
    observer: (rappel) => vrai.observer(rappel),
    appliquerSynchronisation: async (calcul) => {
      const essai = calcul(
        valeurDe(await vrai.lire()),
        valeurDe(await vrai.lireMeta()),
        valeurDe(await vrai.lireSignalements()),
      );
      return essai.meta.aMettreALaCorbeille === undefined
        ? vrai.appliquerSynchronisation(calcul)
        : echec({ type: 'EcritureLocaleImpossible' });
    },
  };
  const reseau = new ReseauCommandable();
  const journal = new JournalEnMemoire();
  const cycle = new CycleSynchronisation({
    depot,
    transport: env.drive.transportPour(SMARTPHONE, { reseau, accesAccorde: () => true }),
    acces: new AccesCommandable(),
    reseau,
    planificateur: env.planificateur,
    aleatoire: new SourceAleatoireDeterministe([500]),
    horloge: new HorlogeSimulee(env.temps),
    journal,
    versionApplication: '0.1.0',
  });
  return { cycle, journal };
};

const evenements = (journal: JournalEnMemoire) =>
  journal.entrees.map((e) => [e.niveau, e.evenement, e.champs]);

describe('Transactions de la corbeille en échec : issue inchangée, journal (n° 18, n° 21)', () => {
  it('UT-COMP-US-017-4-39 inscription impossible : le cycle reste TERMINE, l’échec de la corbeille et celui de l’inscription sont journalisés (champ erreur), la liste reste absente', async () => {
    const { env } = await avecDossierEnDouble();
    expect(await env.pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
    env.drive.echouerProchainesSuppressions(1);
    const { cycle, journal } = cycleSansCorbeille(env);

    expect(await cycle.synchroniserMaintenant()).toBe('TERMINE');

    expect(evenements(journal)).toEqual([
      ['avertissement', 'MiseALaCorbeilleDifferee', { erreur: 'ServeurIndisponible' }],
      ['avertissement', 'CorbeilleNonMemorisee', { erreur: 'EcritureLocaleImpossible' }],
    ]);
    expect((await metaDe(env.smartphone)).aMettreALaCorbeille).toBeUndefined();
  });

  it('UT-COMP-US-017-4-40 reprise faite mais liste non réécrite : TERMINE, journal ; au cycle suivant, le fichier déjà à la corbeille et le dossier introuvable sont retirés sans erreur', async () => {
    const { env, ancien, ancienPropre } = await avecListe();
    const { cycle, journal } = cycleSansCorbeille(env);

    expect(await cycle.synchroniserMaintenant()).toBe('TERMINE');

    expect(evenements(journal)).toEqual([
      ['avertissement', 'CorbeilleNonMemorisee', { erreur: 'EcritureLocaleImpossible' }],
    ]);
    expect(env.drive.fichiers().find((f) => f.id === ancienPropre)?.supprime).toBe(true);
    expect(env.drive.dossiers().map((d) => d.id)).not.toContain(ancien);
    expect((await metaDe(env.smartphone)).aMettreALaCorbeille).toHaveLength(2);

    const avant = env.smartphone.journal.entrees.length;
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.smartphone.journal.entrees.slice(avant)).toEqual([]);
    expect((await metaDe(env.smartphone)).aMettreALaCorbeille).toEqual([]);
  });
});

describe('Dossier quitté à la reprise (n° 21, C5)', () => {
  it('UT-COMP-US-017-4-41 inventaire du dossier quitté en échec à la reprise : le fichier est retiré, le dossier gardé et journalisé (DossierQuitteConserve), repris au cycle suivant', async () => {
    const { env, ancien } = await avecListe();
    // Inventaires du cycle de reprise : observation du dossier courant (1), dossier quitté (2).
    const enPanne = cycleEnPanne(env, env.smartphone, {
      cible: 'transport',
      methode: 'inventorierDossier',
      occurrence: 2,
      erreur: { type: 'ServeurIndisponible' },
    });

    expect(await enPanne.cycle.synchroniserMaintenant()).toBe('TERMINE');

    expect(evenements(enPanne.journal)).toEqual([
      ['avertissement', 'DossierQuitteConserve', { erreur: 'ServeurIndisponible' }],
    ]);
    expect((await metaDe(env.smartphone)).aMettreALaCorbeille).toEqual([
      { type: 'DOSSIER_QUITTE', id: ancien },
    ]);
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.drive.dossiers().map((d) => d.id)).not.toContain(ancien);
    expect((await metaDe(env.smartphone)).aMettreALaCorbeille).toEqual([]);
  });

  it('UT-COMP-US-017-4-42 mise à la corbeille du dossier vide en échec, au déménagement puis à la reprise : le dossier seul est inscrit, gardé, puis supprimé', async () => {
    const { env, ancien } = await avecDossierEnDouble();
    expect(await env.pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
    // Suppressions du déménagement : ancien fichier propre (1), dossier quitté vide (2).
    const demenagement = cycleEnPanne(env, env.smartphone, {
      cible: 'transport',
      methode: 'supprimerFichier',
      occurrence: 2,
      erreur: { type: 'ServeurIndisponible' },
    });
    expect(await demenagement.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect((await metaDe(env.smartphone)).aMettreALaCorbeille).toEqual([
      { type: 'DOSSIER_QUITTE', id: ancien },
    ]);

    const reprise = cycleEnPanne(env, env.smartphone, {
      cible: 'transport',
      methode: 'supprimerFichier',
      occurrence: 1,
      erreur: { type: 'ServeurIndisponible' },
    });
    expect(await reprise.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(evenements(reprise.journal)).toEqual([
      ['avertissement', 'MiseALaCorbeilleDifferee', { erreur: 'ServeurIndisponible' }],
    ]);
    expect((await metaDe(env.smartphone)).aMettreALaCorbeille).toEqual([
      { type: 'DOSSIER_QUITTE', id: ancien },
    ]);

    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.drive.dossiers().map((d) => d.id)).not.toContain(ancien);
    expect((await metaDe(env.smartphone)).aMettreALaCorbeille).toEqual([]);
  });

  it('UT-COMP-US-017-4-43 inventaire du dossier quitté en échec au déménagement : le dossier seul est inscrit (DossierQuitteConserve), puis mis à la corbeille au cycle suivant', async () => {
    const sonde = await avecDossierEnDouble();
    expect(await sonde.env.pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
    const sansPanne = cycleEnPanne(sonde.env, sonde.env.smartphone);
    expect(await sansPanne.cycle.synchroniserMaintenant()).toBe('TERMINE');
    const dernier = sansPanne.appels['inventorierDossier'] ?? 0;

    const { env, ancien } = await avecDossierEnDouble();
    expect(await env.pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
    const enPanne = cycleEnPanne(env, env.smartphone, {
      cible: 'transport',
      methode: 'inventorierDossier',
      occurrence: dernier,
      erreur: { type: 'ServeurIndisponible' },
    });
    expect(await enPanne.cycle.synchroniserMaintenant()).toBe('TERMINE');

    expect(evenements(enPanne.journal)).toEqual([
      ['avertissement', 'DossierQuitteConserve', { erreur: 'ServeurIndisponible' }],
    ]);
    expect((await metaDe(env.smartphone)).aMettreALaCorbeille).toEqual([
      { type: 'DOSSIER_QUITTE', id: ancien },
    ]);
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.drive.dossiers().map((d) => d.id)).not.toContain(ancien);
    expect((await metaDe(env.smartphone)).aMettreALaCorbeille).toEqual([]);
  });
});

describe('Jamais par le dépôt seul (n° 21, §6.5)', () => {
  it('UT-COMP-US-017-4-44 deposerMaintenant dépose les modifications sans aucune mise à la corbeille ; la liste est gardée pour le cycle suivant', async () => {
    const { env, ancienPropre } = await avecListe();
    const liste = (await metaDe(env.smartphone)).aMettreALaCorbeille;
    valeurDe(
      await appliquerModifications(env.smartphone.service, (_etat, contexte) => [
        creationObjectif({ id: idObjectif(2), intitule: 'Courir' }, contexte.instant),
      ]),
    );
    const sonde = cycleEnPanne(env, env.smartphone);

    expect(await sonde.cycle.deposerMaintenant()).toBe('TERMINE');

    expect(sonde.appels['deposerFichierAppareil']).toBe(1);
    expect(sonde.appels['supprimerFichier']).toBeUndefined();
    expect(env.drive.fichiers().find((f) => f.id === ancienPropre)?.supprime).not.toBe(true);
    expect((await metaDe(env.smartphone)).aMettreALaCorbeille).toEqual(liste);
  });
});
