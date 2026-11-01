/**
 * « Restaurer mes données » (ST-US-017 v0.10 §6.7 n° 8, n° 9, n° 13 ; RG-044 ; DAT §4.2.2 b ; DEC-030) :
 * en ligne et restauration faite ailleurs (UT-US-017-67 ; US-017 S20, S22d, S33), hors ligne, annulée, abandonnée
 * devant une génération plus récente (UT-US-017-68 ; US-017 S20b, S22c).
 */
import { describe, expect, it } from 'vitest';
import { echec } from '@src/commun/domaine/resultat';
import { compterALire } from '@src/synchronisation/domaine/lectures';
import { comparerHlc } from '@src/synchronisation/domaine/hlc';
import type { IdFichierDrive } from '@src/synchronisation/domaine/meta-synchronisation';
import {
  avecObjectifPublie,
  fichierDuDrive,
  manifestesDuDrive,
  metaDe,
  objectifsDe,
  preparerRestauration,
  PUBLIER,
  renommerObjectif,
  signalementsDe,
} from '@tests/support/synchronisation/restauration';
import { valeurDe } from '@tests/support/environnement';
import { PC, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

const PUBLIE = new Map([['Publier le guide', '2026-12-15']]);

describe('Restaurer en ligne ; restauration faite ailleurs (ST-US-017 v0.10 §6.7 n° 8, n° 9)', () => {
  it('UT-US-017-67 S20 : le smartphone réécrit son fichier et le manifeste (restauration datée, génération inchangée) ; le PC, en ERR-012, réécrit son propre fichier sans question et ERR-012 disparaît', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    env.drive.supprimerDonnees();
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    expect(await env.pc.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');

    expect(valeurDe(await env.smartphone.restaurer.executer())).toBe('LANCEE');
    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBeUndefined();
    const manifestes = await manifestesDuDrive(env.drive);
    expect(manifestes).toHaveLength(1);
    const restauration = manifestes[0]?.contenu.restauration;
    expect(restauration?.appareil).toBe(SMARTPHONE);
    expect(manifestes[0]?.contenu.generation).toEqual({ type: 'INITIALE' });
    const duSmartphone = await fichierDuDrive(env.drive, SMARTPHONE);
    expect(duSmartphone.contenu.registres.some((r) => r.cle.id === PUBLIER)).toBe(true);
    const metaSmartphone = await metaDe(env.smartphone);
    expect(metaSmartphone.restaurationDemandee).not.toBe(true);
    expect(metaSmartphone.restaurationConnue).toEqual(restauration);
    // La restauration consomme un HLC (n° 9) : dernierHlc = restauration = deposeJusquA.
    expect(valeurDe(await env.smartphone.depot.lire()).dernierHlc).toEqual(restauration);
    expect(metaSmartphone.deposeJusquA).toEqual(restauration);

    const ecrituresManifeste = manifestes[0]?.fichier.version;
    expect(await env.pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.pc.cycle.etatMoteur().actionRequise).toBeUndefined();
    expect(
      (await fichierDuDrive(env.drive, PC)).contenu.registres.some((r) => r.cle.id === PUBLIER),
    ).toBe(true);
    expect((await manifestesDuDrive(env.drive))[0]?.fichier.version).toBe(ecrituresManifeste);
    expect((await metaDe(env.pc)).restaurationConnue).toEqual(restauration);
    await env.echanger();
    expect(await objectifsDe(env.smartphone)).toEqual(PUBLIE);
    expect(await objectifsDe(env.pc)).toEqual(PUBLIE);
    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBeUndefined();
    expect(env.pc.cycle.etatMoteur().actionRequise).toBeUndefined();
  });

  it('UT-US-017-67 S20 sans ERR-012 préalable sur le PC : même résultat ; nouvel incident après la restauration (restauration déjà connue) → ERR-012 sur le PC', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    env.drive.supprimerDonnees();
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    valeurDe(await env.smartphone.restaurer.executer());
    await env.echanger();
    expect(env.pc.cycle.etatMoteur().actionRequise).toBeUndefined();
    expect(await objectifsDe(env.pc)).toEqual(PUBLIE);

    const { fichier: duPc } = await fichierDuDrive(env.drive, PC);
    const tiers = env.drive.transportPour(TROISIEME, {
      reseau: env.pc.reseau,
      accesAccorde: () => true,
    });
    valeurDe(await tiers.supprimerFichier(duPc.id as IdFichierDrive));
    expect(await env.pc.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    expect(env.pc.cycle.etatMoteur().actionRequise).toBe('DONNEES_ABSENTES');
    expect(env.drive.fichierDe(PC)).toBeUndefined();
  });

  it('UT-US-017-67 S33 : après « Restaurer » sur le smartphone, son fichier redevient valide et la valeur d’origine est partout', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    const { fichier } = await fichierDuDrive(env.drive, SMARTPHONE);
    env.drive.modifierDelaiALaMain(fichier.id, PUBLIER, '2027-06-30');
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    expect(valeurDe(await env.smartphone.restaurer.executer())).toBe('LANCEE');
    await env.echanger();
    const { contenu } = await fichierDuDrive(env.drive, SMARTPHONE);
    expect(
      contenu.registres.find((r) => r.cle.id === PUBLIER && r.cle.champ === 'delai')?.ecriture
        .valeur,
    ).toBe('2026-12-15');
    expect(await objectifsDe(env.smartphone)).toEqual(PUBLIE);
    expect(await objectifsDe(env.pc)).toEqual(PUBLIE);
    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBeUndefined();
  });

  it('UT-US-017-67 sans ERR-012, « Restaurer » est refusé (AucuneAlteration) et rien n’est écrit', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    const ecritures = env.drive.ecrituresPar(SMARTPHONE);
    expect(await env.smartphone.restaurer.executer()).toEqual(echec({ type: 'AucuneAlteration' }));
    expect((await metaDe(env.smartphone)).restaurationDemandee).not.toBe(true);
    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);
  });
});

describe('Restaurer hors ligne, annuler, abandonner (n° 9 ; S20b, S22c)', () => {
  it('UT-US-017-68 S20b : sans réseau, « Restaurer » est mémorisé et rien n’est écrit ; au retour du réseau, il est exécuté après les contrôles, puis oublié', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    env.drive.supprimerDonnees();
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    const ecritures = env.drive.ecrituresPar(SMARTPHONE);
    env.smartphone.reseau.changer(false);

    expect(valeurDe(await env.smartphone.restaurer.executer())).toBe('EN_ATTENTE_DU_RESEAU');
    expect((await metaDe(env.smartphone)).restaurationDemandee).toBe(true);
    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);
    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBe('DONNEES_ABSENTES');

    env.smartphone.reseau.changer(true);
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect((await metaDe(env.smartphone)).restaurationDemandee).toBe(false);
    expect((await manifestesDuDrive(env.drive))[0]?.contenu.restauration?.appareil).toBe(
      SMARTPHONE,
    );
    await env.echanger();
    expect(await objectifsDe(env.pc)).toEqual(PUBLIE);
  });

  it('UT-US-017-68 « Annuler la demande » : la demande est oubliée, ERR-012 demeure et rien n’est écrit au retour du réseau', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    env.drive.supprimerDonnees();
    await env.smartphone.cycle.synchroniserMaintenant();
    env.smartphone.reseau.changer(false);
    valeurDe(await env.smartphone.restaurer.executer());
    valeurDe(await env.smartphone.annulerRestauration.executer());
    expect((await metaDe(env.smartphone)).restaurationDemandee).toBe(false);
    const ecritures = env.drive.ecrituresPar(SMARTPHONE);
    env.smartphone.reseau.changer(true);
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);
  });

  it('UT-US-017-68 S22c : « Restaurer » mémorisé sur le PC et « Repartir de zéro » confirmé sur le smartphone → repartir l’emporte ; la modification en attente du PC est signalée (ALR-014), sa demande est abandonnée', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    env.drive.supprimerDonnees();
    expect(await env.pc.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    env.pc.reseau.changer(false);
    valeurDe(await renommerObjectif(env.pc, PUBLIER, 'Publier le guide pratique'));
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    expect(valeurDe(await env.pc.restaurer.executer())).toBe('EN_ATTENTE_DU_RESEAU');
    valeurDe(await env.smartphone.repartir.executer());
    const generation = (await metaDe(env.smartphone)).generation;
    expect(generation?.type).toBe('NOUVELLE');

    env.pc.reseau.changer(true);
    expect(await env.pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
    await env.echanger();

    expect((await objectifsDe(env.smartphone)).size).toBe(0);
    expect((await objectifsDe(env.pc)).size).toBe(0);
    const metaPc = await metaDe(env.pc);
    expect(metaPc.generation).toEqual(generation);
    expect(metaPc.restaurationDemandee).not.toBe(true);
    expect(env.pc.cycle.etatMoteur().actionRequise).toBeUndefined();
    const manifestes = await manifestesDuDrive(env.drive);
    expect(manifestes.map((m) => m.contenu.generation)).toEqual([generation]);
    expect(manifestes[0]?.contenu.restauration).toBeUndefined();
    const s = await signalementsDe(env.pc);
    const entrees = [...s.valeursEcartees.values()];
    expect(entrees).toHaveLength(1);
    expect(entrees[0]).toMatchObject({
      motif: 'DONNEES_EFFACEES',
      ecartee: {
        cle: { id: PUBLIER, champ: 'intitule' },
        ecriture: { valeur: 'Publier le guide pratique' },
      },
    });
    expect(compterALire(s.valeursEcartees, s.lectures)).toBe(0);
    const g = generation?.type === 'NOUVELLE' ? generation.hlc : undefined;
    const entree = entrees[0];
    expect(
      entree?.motif === 'DONNEES_EFFACEES' && g !== undefined && comparerHlc(entree.generation, g),
    ).toBe(0);
  });
});
