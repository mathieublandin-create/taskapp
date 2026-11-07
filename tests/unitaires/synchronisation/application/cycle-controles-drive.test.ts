/**
 * Cycle et contrôles du Drive (ST-US-017 v0.10 §6.7 n° 2 à n° 7, n° 12 ; RG-044 ; DAT §4.2.2) : qui affiche ERR-012
 * et rien n'est écrit (UT-US-017-65 ; US-017 S18, S19, S23, S32, S32b, S33), version du fichier propre (UT-US-017-66 ;
 * v0.10.1, condition C4 de Starck : égalité de chaînes seulement).
 */
import { describe, expect, it } from 'vitest';
import type {
  FichierAppareilDistant,
  TransportSynchro,
} from '@src/synchronisation/application/ports/transport-synchro';
import { CycleSynchronisation } from '@src/synchronisation/application/cycle-synchronisation';
import { succes } from '@src/commun/domaine/resultat';
import { HorlogeSimulee } from '@tests/doublures/horloge-simulee';
import { SourceAleatoireDeterministe } from '@tests/doublures/source-aleatoire-deterministe';
import { JournalEnMemoire } from '@tests/support/compte/doublures-compte';
import { appliquerModifications, valeurDe } from '@tests/support/environnement';
import { creationObjectif } from '@tests/support/modifications';
import {
  avecObjectifPublie,
  fichierDuDrive,
  metaDe,
  objectifsDe,
  preparerRestauration,
  PUBLIER,
} from '@tests/support/synchronisation/restauration';
import { date, idObjectif, PC, SMARTPHONE } from '@tests/support/valeurs';

const SEMI = idObjectif(2);

describe('Cycle : qui affiche ERR-012, et rien n’est écrit (ST-US-017 v0.10 §6.7 n° 4, n° 12)', () => {
  it('UT-US-017-65 S18 « supprimées » : ERR-012 sur l’appareil qui le constate, aucune écriture dans le Drive, données locales intactes, y compris après une saisie (S19)', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    env.drive.supprimerDonnees();
    const ecrituresAvant = env.drive.ecrituresPar(SMARTPHONE);
    const ecrituresPcAvant = env.drive.ecrituresPar(PC);

    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBe('DONNEES_ABSENTES');
    expect(await objectifsDe(env.smartphone)).toEqual(
      new Map([['Publier le guide', '2026-12-15']]),
    );

    // S19 : saisie locale, cycles suivants : toujours ERR-012, toujours rien d'écrit.
    valeurDe(
      await appliquerModifications(env.smartphone.service, (_etat, contexte) => [
        creationObjectif({ id: SEMI, intitule: 'Chapitre 1' }, contexte.instant),
      ]),
    );
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    expect(await env.smartphone.cycle.deposerMaintenant()).toBe('DONNEES_ALTEREES');
    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecrituresAvant);
    expect(env.drive.fichiers().filter((f) => !f.supprime && f.parent !== undefined)).toEqual([]);
    expect((await objectifsDe(env.smartphone)).size).toBe(2);
    // Tout appareil qui constate l'altération du manifeste affiche ERR-012.
    expect(await env.pc.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    expect(env.pc.cycle.etatMoteur().actionRequise).toBe('DONNEES_ABSENTES');
    expect(env.drive.ecrituresPar(PC)).toBe(ecrituresPcAvant);
  });

  it('UT-US-017-65 S18 « rendues illisibles » et dossier supprimé : ERR-012, aucun fichier réécrit, aucun dossier recréé', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    env.drive.rendreDonneesIllisibles();
    const octets = env.drive.fichiers().map((f) => f.octets);
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    expect(env.drive.fichiers().map((f) => f.octets)).toEqual(octets);

    const autre = preparerRestauration();
    await avecObjectifPublie(autre);
    autre.drive.supprimerDossiers();
    const ecritures = autre.drive.ecrituresPar(SMARTPHONE);
    expect(await autre.smartphone.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    expect(await autre.pc.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    expect(autre.drive.dossiers()).toEqual([]);
    expect(autre.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);
  });

  it('UT-US-017-65 S32, S32b : fichier du smartphone modifié à la main → ERR-012 sur le smartphone seulement ; le PC continue de déposer son propre fichier sans toucher au fichier altéré', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    const { fichier } = await fichierDuDrive(env.drive, SMARTPHONE);
    env.drive.modifierFichierALaMain(fichier.id);
    const altere = env.drive.fichierDe(SMARTPHONE);

    valeurDe(
      await appliquerModifications(env.pc.service, (_etat, contexte) => [
        creationObjectif({ id: SEMI, intitule: 'Courir un semi-marathon' }, contexte.instant),
      ]),
    );
    await env.echanger();

    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBe('DONNEES_ABSENTES');
    expect(env.pc.cycle.etatMoteur().actionRequise).toBeUndefined();
    const { contenu: duPc } = await fichierDuDrive(env.drive, PC);
    expect(duPc.registres.some((r) => r.cle.id === SEMI)).toBe(true);
    expect(env.drive.fichierDe(SMARTPHONE)).toEqual(altere);
    expect((await objectifsDe(env.pc)).get('Publier le guide')).toBe('2026-12-15');
  });

  it('UT-US-017-65 S33 : le contenu modifié à la main n’est jamais fusionné, ni par son propriétaire ni par l’autre appareil', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    const { fichier } = await fichierDuDrive(env.drive, SMARTPHONE);
    env.drive.modifierDelaiALaMain(fichier.id, PUBLIER, '2027-06-30');
    await env.echanger();
    expect((await objectifsDe(env.smartphone)).get('Publier le guide')).toBe('2026-12-15');
    expect((await objectifsDe(env.pc)).get('Publier le guide')).toBe('2026-12-15');
    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBe('DONNEES_ABSENTES');
    expect(env.pc.cycle.etatMoteur().actionRequise).toBeUndefined();
  });

  it('UT-US-017-65 S23 : une indisponibilité du Drive n’est jamais une altération ; le dépôt aboutit au retour', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    valeurDe(
      await appliquerModifications(env.smartphone.service, (_etat, contexte) => [
        creationObjectif(
          { id: SEMI, intitule: 'Chapitre 1', delai: date('2026-11-30') },
          contexte.instant,
        ),
      ]),
    );
    env.drive.indisponible('toujours');
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('ECHEC_TRANSITOIRE');
    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBeUndefined();
    expect(valeurDe(await env.smartphone.depot.lire()).enAttente.size).toBeGreaterThan(0);
    env.drive.retablir();
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBeUndefined();
    const { contenu } = await fichierDuDrive(env.drive, SMARTPHONE);
    expect(contenu.registres.some((r) => r.cle.id === SEMI)).toBe(true);
  });
});

describe('Cycle : version du fichier propre (ST-US-017 v0.10 §6.7 n° 5 ; §4.7)', () => {
  it('UT-US-017-66 le fichier propre n’est jamais relu après son propre dépôt ; modifié à la main (nouvelle version), il est relu une fois et ERR-012 s’affiche', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    valeurDe(
      await appliquerModifications(env.smartphone.service, (_etat, contexte) => [
        creationObjectif({ id: SEMI, intitule: 'Chapitre 1' }, contexte.instant),
      ]),
    );
    await env.echanger();
    await env.echanger();
    const { fichier } = await fichierDuDrive(env.drive, SMARTPHONE);
    expect(env.drive.lecturesDe(fichier.id, SMARTPHONE)).toBe(0);
    expect((await metaDe(env.smartphone)).versionFichierPropre).toBe(fichier.version);

    env.drive.modifierFichierALaMain(fichier.id);
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    expect(env.drive.lecturesDe(fichier.id, SMARTPHONE)).toBe(1);
  });

  it('UT-US-017-66 version absente du dépôt (adaptateur sans version) : le fichier propre est relu une fois au cycle suivant, puis sa version lue dans l’inventaire est mémorisée et il n’est plus relu', async () => {
    const env = preparerRestauration();
    const reel = env.drive.transportPour(SMARTPHONE, {
      reseau: env.smartphone.reseau,
      accesAccorde: () => true,
    });
    const sansVersion: TransportSynchro = {
      ...reel,
      deposerFichierAppareil: async (p) => {
        const depose = await reel.deposerFichierAppareil(p);
        return depose.ok ? succes({ id: depose.valeur.id }) : depose;
      },
    };
    const cycle = new CycleSynchronisation({
      depot: env.smartphone.depot,
      transport: sansVersion,
      acces: env.smartphone.acces,
      reseau: env.smartphone.reseau,
      planificateur: env.planificateur,
      aleatoire: new SourceAleatoireDeterministe([500]),
      horloge: new HorlogeSimulee(env.temps),
      journal: new JournalEnMemoire(),
      versionApplication: '0.1.0',
    });
    valeurDe(
      await appliquerModifications(env.smartphone.service, (_etat, contexte) => [
        creationObjectif({ id: PUBLIER, intitule: 'Publier le guide' }, contexte.instant),
      ]),
    );
    expect(await cycle.synchroniserMaintenant()).toBe('TERMINE');
    const { fichier } = await fichierDuDrive(env.drive, SMARTPHONE);
    for (let i = 0; i < 3; i += 1) expect(await cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.drive.lecturesDe(fichier.id, SMARTPHONE)).toBe(1);
    expect(cycle.etatMoteur().actionRequise).toBeUndefined();
    expect((await metaDe(env.smartphone)).versionFichierPropre).toBe(fichier.version);
    expect(env.drive.fichierDe(SMARTPHONE)?.version).toBe(fichier.version);
  });

  it('UT-US-017-66 condition C4 : la version Drive est comparée par égalité de chaînes, jamais par ordre ni par valeur numérique ; une version différente (même nombre écrit autrement, ou inférieure : renommage, métadonnées) fait relire le fichier une fois, sans effet, et la version relue est mémorisée', async () => {
    const env = preparerRestauration();
    const reel = env.drive.transportPour(SMARTPHONE, {
      reseau: env.smartphone.reseau,
      accesAccorde: () => true,
    });
    let versionAnnoncee = (version: string): string => version;
    const annoncer = (f: FichierAppareilDistant): FichierAppareilDistant =>
      f.appareil === SMARTPHONE && f.version !== undefined
        ? { ...f, version: versionAnnoncee(f.version) }
        : f;
    const transport: TransportSynchro = {
      ...reel,
      inventorierDossier: async (dossier) => {
        const r = await reel.inventorierDossier(dossier);
        return r.ok ? succes({ ...r.valeur, fichiers: r.valeur.fichiers.map(annoncer) }) : r;
      },
      listerFichiersAppareils: async (dossier) => {
        const r = await reel.listerFichiersAppareils(dossier);
        return r.ok ? succes({ ...r.valeur, fichiers: r.valeur.fichiers.map(annoncer) }) : r;
      },
      changements: async (dossier, jeton) => {
        const r = await reel.changements(dossier, jeton);
        return r.ok ? succes({ ...r.valeur, fichiers: r.valeur.fichiers.map(annoncer) }) : r;
      },
    };
    const cycle = new CycleSynchronisation({
      depot: env.smartphone.depot,
      transport,
      acces: env.smartphone.acces,
      reseau: env.smartphone.reseau,
      planificateur: env.planificateur,
      aleatoire: new SourceAleatoireDeterministe([500]),
      horloge: new HorlogeSimulee(env.temps),
      journal: new JournalEnMemoire(),
      versionApplication: '0.1.0',
    });
    valeurDe(
      await appliquerModifications(env.smartphone.service, (_etat, contexte) => [
        creationObjectif({ id: PUBLIER, intitule: 'Publier le guide' }, contexte.instant),
      ]),
    );
    expect(await cycle.synchroniserMaintenant()).toBe('TERMINE');
    const { fichier } = await fichierDuDrive(env.drive, SMARTPHONE);
    expect((await metaDe(env.smartphone)).versionFichierPropre).toBe(fichier.version);
    const ecritures = env.drive.ecrituresPar(SMARTPHONE);

    // Même nombre, autre chaîne : relu une fois, puis la chaîne relue est mémorisée.
    versionAnnoncee = (version) => `0${version}`;
    expect(await cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.drive.lecturesDe(fichier.id, SMARTPHONE)).toBe(1);
    expect((await metaDe(env.smartphone)).versionFichierPropre).toBe(`0${fichier.version}`);
    expect(await cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.drive.lecturesDe(fichier.id, SMARTPHONE)).toBe(1);

    // Version inférieure (aucun ordre n'est supposé) : relu aussi.
    versionAnnoncee = () => '1';
    expect(await cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.drive.lecturesDe(fichier.id, SMARTPHONE)).toBe(2);
    expect((await metaDe(env.smartphone)).versionFichierPropre).toBe('1');

    // Relectures sans effet : aucun dépôt, aucune écriture, aucune erreur.
    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);
    expect(cycle.etatMoteur().actionRequise).toBeUndefined();
  });
});
