/**
 * Dossier et manifeste en double, dossier supprimé (ST-US-017 v0.10 §6.7 n° 13, n° 14 ; DAT §4.2.2 d) : le plus
 * ancien est canonique, un appareil ne supprime que le doublon qu'il a créé, déménagement vers le dossier canonique,
 * bascule vers le dossier recréé par une restauration. UT-US-017-71.
 * v0.10.1, conditions de Starck (DAT v0.11.10 §4.2.2) : C5 (nouvel inventaire juste avant de mettre à la corbeille le
 * dossier quitté) ; C8 (fichiers orphelins de l'appareil lus puis mis à la corbeille par lui).
 */
import { describe, expect, it } from 'vitest';
import type { IdFichierDrive } from '@src/synchronisation/domaine/meta-synchronisation';
import { valeurDe } from '@tests/support/environnement';
import {
  avecObjectifPublie,
  DEPART,
  fichierDuDrive,
  manifestesDuDrive,
  metaDe,
  objectifsDe,
  preparerRestauration,
} from '@tests/support/synchronisation/restauration';
import { appliquerModifications } from '@tests/support/environnement';
import { creationObjectif } from '@tests/support/modifications';
import { date, hlc, idObjectif, instant, PC, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

const PUBLIE = new Map([['Publier le guide', '2026-12-15']]);
const T0 = instant(DEPART);

describe('Doublons du manifeste et du dossier (ST-US-017 v0.10 §6.7 n° 13, n° 14)', () => {
  it('UT-US-017-71 manifeste créé en même temps par un autre appareil : le plus ancien est canonique, l’appareil supprime le doublon qu’il vient de créer et mémorise le canonique', async () => {
    const env = preparerRestauration();
    valeurDe(
      await appliquerModifications(env.smartphone.service, (_etat, contexte) => [
        creationObjectif(
          { id: idObjectif(1), intitule: 'Publier le guide', delai: date('2026-12-15') },
          contexte.instant,
        ),
      ]),
    );
    let concurrent: IdFichierDrive | undefined;
    env.drive.avantLaProchaineCreationDeManifeste(async () => {
      const dossier = env.drive.dossiers()[0]?.id as IdFichierDrive;
      concurrent = await env.drive.ajouterManifeste(
        PC,
        dossier,
        { schemaVersion: 1, generation: { type: 'INITIALE' } },
        T0 - 1000,
      );
    });
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');

    const presents = await manifestesDuDrive(env.drive);
    expect(presents.map((m) => m.fichier.id)).toEqual([concurrent]);
    expect(
      env.drive.fichiers().filter((f) => f.supprime && f.appProperties['donejuan'] === 'manifeste')
        .length,
    ).toBe(1);
    expect((await metaDe(env.smartphone)).manifeste).toBe(concurrent);
    await env.echanger();
    expect(await objectifsDe(env.pc)).toEqual(PUBLIE);
    expect((await manifestesDuDrive(env.drive)).map((m) => m.fichier.id)).toEqual([concurrent]);
  });

  it('UT-US-017-71 doublon plus récent créé par un autre appareil : jamais supprimé par cet appareil ; sa restauration est prise en compte (jointure écrite dans le canonique)', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    const dossier = (await metaDe(env.smartphone)).dossier;
    if (dossier === undefined) throw new Error('dossier attendu');
    const [canonique] = await manifestesDuDrive(env.drive);
    const restauration = hlc('2026-10-21T08:30:00.000Z', 0, PC);
    const doublon = await env.drive.ajouterManifeste(
      PC,
      dossier,
      { schemaVersion: 1, generation: { type: 'INITIALE' }, restauration },
      T0 + 60_000,
    );
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    const presents = await manifestesDuDrive(env.drive);
    expect(presents.map((m) => m.fichier.id)).toEqual([canonique?.fichier.id, doublon]);
    expect(presents[0]?.contenu.restauration).toEqual(restauration);
    expect((await metaDe(env.smartphone)).restaurationConnue).toEqual(restauration);
    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBeUndefined();
  });

  it('UT-US-017-71 dossier « Done Juan » en double : chaque appareil redépose son fichier dans le plus ancien, supprime son ancien fichier, et le dossier vidé est supprimé', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    const [ancien] = env.drive.dossiers();
    const canonique = env.drive.ajouterDossier(PC, T0 - 60_000);

    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.drive.fichierDe(SMARTPHONE)?.parent).toBe(canonique);
    expect((await metaDe(env.smartphone)).dossier).toBe(canonique);
    expect(env.drive.dossiers().map((d) => d.id)).toEqual([canonique, ancien?.id]);
    expect(
      env.drive
        .fichiers()
        .filter(
          (f) =>
            !f.supprime && f.parent === canonique && f.appProperties['donejuan'] === 'manifeste',
        ),
    ).toHaveLength(1);

    expect(await env.pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.drive.fichierDe(PC)?.parent).toBe(canonique);
    expect(env.drive.dossiers().map((d) => d.id)).toEqual([canonique]);

    await env.echanger();
    expect(await objectifsDe(env.smartphone)).toEqual(PUBLIE);
    expect(await objectifsDe(env.pc)).toEqual(PUBLIE);
    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBeUndefined();
    expect(env.pc.cycle.etatMoteur().actionRequise).toBeUndefined();
    expect((await fichierDuDrive(env.drive, PC)).fichier.parent).toBe(canonique);
  });

  it('UT-US-017-71 condition C5 : juste avant de mettre à la corbeille le dossier qu’il quitte, l’appareil refait l’inventaire ; un fichier d’appareil déposé entre-temps l’en empêche', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    const [ancien] = env.drive.dossiers();
    if (ancien === undefined) throw new Error('dossier attendu');
    const canonique = env.drive.ajouterDossier(PC, T0 - 60_000);
    // Le PC déménage le premier : le fichier du smartphone est encore dans l'ancien dossier, qui reste.
    expect(await env.pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.drive.dossiers().map((d) => d.id)).toEqual([canonique, ancien.id]);

    // Pendant le déménagement du smartphone (après son premier inventaire), un troisième appareil dépose dans l'ancien
    // dossier : l'inventaire refait juste avant la suppression le voit.
    const { contenu } = await fichierDuDrive(env.drive, SMARTPHONE);
    env.drive.avantReponseDuProchainDepot(async () => {
      await env.drive.ajouterFichierAppareil(TROISIEME, ancien.id as IdFichierDrive, {
        ...contenu,
        appareil: TROISIEME,
        registres: [],
        journal: [],
      });
    });
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.drive.fichierDe(SMARTPHONE)?.parent).toBe(canonique);
    expect(env.drive.dossiers().map((d) => d.id)).toEqual([canonique, ancien.id]);
    expect(env.drive.fichierDe(TROISIEME)?.parent).toBe(ancien.id);
    // L'ancien fichier du smartphone, lui, est à la corbeille.
    expect(
      env.drive
        .fichiers()
        .filter((f) => f.parent === ancien.id && f.appProperties['appareil'] === SMARTPHONE)
        .every((f) => f.supprime),
    ).toBe(true);
  });

  it('UT-US-017-71 condition C8 : un fichier de l’appareil autre que celui qu’il mémorise (création interrompue), lisible ou non, est lu, jamais fusionné ni compté comme altération, puis mis à la corbeille par l’appareil lui-même ; le fichier mémorisé reste', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    const dossier = (await metaDe(env.smartphone)).dossier;
    if (dossier === undefined) throw new Error('dossier attendu');
    const { fichier, contenu } = await fichierDuDrive(env.drive, SMARTPHONE);
    const valide = await env.drive.ajouterFichierAppareil(SMARTPHONE, dossier, contenu);
    const illisible = await env.drive.ajouterFichierAppareil(SMARTPHONE, dossier, 'ILLISIBLE');

    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBeUndefined();
    expect(env.drive.lecturesDe(valide, SMARTPHONE)).toBe(1);
    expect(env.drive.lecturesDe(illisible, SMARTPHONE)).toBe(1);
    expect(
      env.drive
        .fichiers()
        .filter((f) => !f.supprime && f.appProperties['appareil'] === SMARTPHONE)
        .map((f) => f.id),
    ).toEqual([fichier.id]);
    expect((await metaDe(env.smartphone)).fichierPropre).toBe(fichier.id);

    await env.echanger();
    expect(await objectifsDe(env.pc)).toEqual(PUBLIE);
    expect(env.pc.cycle.etatMoteur().actionRequise).toBeUndefined();
    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBeUndefined();
  });

  it('UT-US-017-71 dossier supprimé puis recréé par « Restaurer » sur le smartphone : le PC bascule vers le nouveau dossier et y réécrit son fichier sans question', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    const [supprime] = env.drive.dossiers();
    env.drive.supprimerDossiers();
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    expect(valeurDe(await env.smartphone.restaurer.executer())).toBe('LANCEE');
    const [recree] = env.drive.dossiers();
    expect(recree?.id).not.toBe(supprime?.id);

    expect(await env.pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.pc.cycle.etatMoteur().actionRequise).toBeUndefined();
    expect((await metaDe(env.pc)).dossier).toBe(recree?.id);
    expect(env.drive.fichierDe(PC)?.parent).toBe(recree?.id);
    await env.echanger();
    expect(await objectifsDe(env.pc)).toEqual(PUBLIE);
    expect(env.drive.dossiers()).toHaveLength(1);
  });
});
