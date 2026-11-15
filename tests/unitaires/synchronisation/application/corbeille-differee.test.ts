/**
 * Reprise des mises à la corbeille en échec (DT-036 ; ST-US-017 v0.11 §6.7 n° 13, n° 14 et §6.8 n° 18 à 21) : l'ancien
 * fichier propre et le dossier quitté au déménagement, le doublon de manifeste créé par l'appareil, sont inscrits dans
 * `aMettreALaCorbeille` et repris à la fin de chaque cycle qui synchronise ou restaure, jamais sous une altération ni
 * en consultation seule. UT-US-017-120 à 123 et 127 (rang 11, tranche H4).
 */
import { describe, expect, it } from 'vitest';
import type { IdFichierDrive } from '@src/synchronisation/domaine/meta-synchronisation';
import { SCHEMA_VERSION } from '@src/synchronisation/domaine/version-schema';
import {
  avecObjectifPublie,
  DEPART,
  manifestesDuDrive,
  metaDe,
  preparerRestauration,
} from '@tests/support/synchronisation/restauration';
import { instant, PC, SMARTPHONE } from '@tests/support/valeurs';

const T0 = instant(DEPART);

const avertissements = (env: ReturnType<typeof preparerRestauration>) =>
  env.smartphone.journal.entrees.filter((e) => e.evenement === 'MiseALaCorbeilleDifferee');

/** Dossier en double : le PC déménage le premier ; le smartphone déménage ensuite, sa première suppression échoue. */
const demenagementEnEchec = async (echecs: number) => {
  const env = preparerRestauration();
  await avecObjectifPublie(env);
  const [ancien] = env.drive.dossiers();
  if (ancien === undefined) throw new Error('dossier attendu');
  const canonique = env.drive.ajouterDossier(PC, T0 - 60_000);
  expect(await env.pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
  const ancienPropre = (await metaDe(env.smartphone)).fichierPropre;
  if (ancienPropre === undefined) throw new Error('fichier propre attendu');
  env.drive.echouerProchainesSuppressions(echecs);
  expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
  return { env, ancien: ancien.id as IdFichierDrive, canonique, ancienPropre };
};

describe('Déménagement : ancien fichier propre et dossier quitté (n° 14, n° 18, n° 20)', () => {
  it('UT-US-017-120 la suppression de l’ancien fichier propre échoue : issue inchangée, avertissement, fichier et dossier quitté inscrits ; le cycle suivant les met à la corbeille et vide la liste', async () => {
    const { env, ancien, canonique, ancienPropre } = await demenagementEnEchec(1);

    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBeUndefined();
    expect(avertissements(env)).toHaveLength(1);
    expect((await metaDe(env.smartphone)).aMettreALaCorbeille).toEqual([
      { type: 'FICHIER', id: ancienPropre },
      { type: 'DOSSIER_QUITTE', id: ancien },
    ]);
    expect(env.drive.dossiers().map((d) => d.id)).toEqual([canonique, ancien]);

    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');

    expect(env.drive.fichiers().find((f) => f.id === ancienPropre)?.supprime).toBe(true);
    expect(env.drive.dossiers().map((d) => d.id)).toEqual([canonique]);
    expect((await metaDe(env.smartphone)).aMettreALaCorbeille ?? []).toEqual([]);
  });

  it('UT-US-017-121 échecs répétés : la liste est gardée telle quelle (le dossier n’est pas examiné tant que son fichier n’est pas supprimé), chaque échec est journalisé, l’issue reste TERMINE ; un fichier déjà absent est retiré de la liste', async () => {
    const { env, ancien, ancienPropre } = await demenagementEnEchec(3);
    const attendu = [
      { type: 'FICHIER', id: ancienPropre },
      { type: 'DOSSIER_QUITTE', id: ancien },
    ];

    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect((await metaDe(env.smartphone)).aMettreALaCorbeille).toEqual(attendu);
    expect(avertissements(env)).toHaveLength(3);
    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBeUndefined();

    // Mis à la corbeille entre-temps (par l'utilisateur) : la suppression d'un fichier absent est un succès (§7).
    const utilisateur = env.drive.transportPour(PC, {
      reseau: env.pc.reseau,
      accesAccorde: () => true,
    });
    expect((await utilisateur.supprimerFichier(ancienPropre)).ok).toBe(true);
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.drive.dossiers().map((d) => d.id)).not.toContain(ancien);
    expect((await metaDe(env.smartphone)).aMettreALaCorbeille ?? []).toEqual([]);
  });

  it('UT-US-017-121 dossier quitté qui contient encore le fichier d’un autre appareil : retiré de la liste sans être supprimé (condition C5 : le dernier appareil qui le vide le supprime)', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    const [ancien] = env.drive.dossiers();
    if (ancien === undefined) throw new Error('dossier attendu');
    env.drive.ajouterDossier(PC, T0 - 60_000);
    // Le smartphone déménage le premier, sa suppression échoue ; le PC est encore dans l'ancien dossier.
    env.drive.echouerProchainesSuppressions(1);
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect((await metaDe(env.smartphone)).aMettreALaCorbeille).toHaveLength(2);
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');

    expect((await metaDe(env.smartphone)).aMettreALaCorbeille ?? []).toEqual([]);
    expect(env.drive.dossiers().map((d) => d.id)).toContain(ancien.id);
    expect(env.drive.fichierDe(PC)?.parent).toBe(ancien.id);
  });
});

describe('Doublon de manifeste créé par l’appareil (n° 13, n° 19)', () => {
  it('UT-US-017-122 création concurrente, puis suppression du doublon en échec : l’écriture du manifeste réussit (canonique mémorisé), le doublon est inscrit puis mis à la corbeille au cycle suivant', async () => {
    const env = preparerRestauration();
    let concurrent: IdFichierDrive | undefined;
    env.drive.avantLaProchaineCreationDeManifeste(async () => {
      const dossier = env.drive.dossiers()[0]?.id as IdFichierDrive;
      concurrent = await env.drive.ajouterManifeste(
        PC,
        dossier,
        { schemaVersion: SCHEMA_VERSION, generation: { type: 'INITIALE' } },
        T0 - 1000,
      );
      env.drive.echouerProchainesSuppressions(1);
    });

    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');

    const meta = await metaDe(env.smartphone);
    expect(meta.manifeste).toBe(concurrent);
    expect(meta.aMettreALaCorbeille).toHaveLength(1);
    const [doublon] = meta.aMettreALaCorbeille ?? [];
    expect(doublon?.type).toBe('FICHIER');
    expect(doublon?.id).not.toBe(concurrent);
    expect((await manifestesDuDrive(env.drive)).map((m) => m.fichier.id)).toHaveLength(2);
    expect(avertissements(env)).toHaveLength(1);

    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect((await manifestesDuDrive(env.drive)).map((m) => m.fichier.id)).toEqual([concurrent]);
    expect((await metaDe(env.smartphone)).aMettreALaCorbeille ?? []).toEqual([]);
  });
});

describe('Garde C1 : un fichier devenu le manifeste canonique n’est jamais mis à la corbeille (Q-ST017-STA-8 c)', () => {
  it('UT-US-017-127 le doublon inscrit est devenu le seul manifeste (le plus ancien a disparu) : il est retiré de la liste sans être supprimé, aucun ERR-012 ni ce cycle ni le suivant', async () => {
    const env = preparerRestauration();
    let concurrent: IdFichierDrive | undefined;
    env.drive.avantLaProchaineCreationDeManifeste(async () => {
      const dossier = env.drive.dossiers()[0]?.id as IdFichierDrive;
      concurrent = await env.drive.ajouterManifeste(
        PC,
        dossier,
        { schemaVersion: SCHEMA_VERSION, generation: { type: 'INITIALE' } },
        T0 - 1000,
      );
      env.drive.echouerProchainesSuppressions(1);
    });
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    const [doublon] = (await metaDe(env.smartphone)).aMettreALaCorbeille ?? [];
    if (doublon === undefined || concurrent === undefined) throw new Error('doublon attendu');

    // L'utilisateur met à la corbeille le plus ancien : le doublon inscrit devient le manifeste canonique.
    const utilisateur = env.drive.transportPour(PC, {
      reseau: env.pc.reseau,
      accesAccorde: () => true,
    });
    expect((await utilisateur.supprimerFichier(concurrent)).ok).toBe(true);

    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');

    expect(env.drive.fichiers().find((f) => f.id === doublon.id)?.supprime).not.toBe(true);
    expect((await manifestesDuDrive(env.drive)).map((m) => m.fichier.id)).toEqual([doublon.id]);
    expect((await metaDe(env.smartphone)).aMettreALaCorbeille ?? []).toEqual([]);
    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBeUndefined();

    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect((await manifestesDuDrive(env.drive)).map((m) => m.fichier.id)).toEqual([doublon.id]);
    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBeUndefined();
  });
});

describe('Jamais en consultation seule (n° 20) ; sous altération : UT-COMP-US-017-4-80', () => {
  it('UT-US-017-123 en consultation seule (FORMAT_PLUS_RECENT, ERR-013), la reprise n’écrit rien dans le Drive et la liste est gardée ; elle reprend au premier cycle qui synchronise', async () => {
    const { env, ancien, ancienPropre } = await demenagementEnEchec(1);
    const liste = (await metaDe(env.smartphone)).aMettreALaCorbeille;

    await env.drive.passerAuFormatPlusRecent(PC);
    const ecritures = env.drive.ecrituresPar(SMARTPHONE);
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('FORMAT_PLUS_RECENT');
    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);
    expect((await metaDe(env.smartphone)).aMettreALaCorbeille).toEqual(liste);

    env.drive.connaitreFormat(SMARTPHONE, SCHEMA_VERSION + 1);
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.drive.fichiers().find((f) => f.id === ancienPropre)?.supprime).toBe(true);
    expect(env.drive.dossiers().map((d) => d.id)).not.toContain(ancien);
    expect((await metaDe(env.smartphone)).aMettreALaCorbeille ?? []).toEqual([]);
  });
});
