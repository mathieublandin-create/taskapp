/**
 * « Repartir de zéro » et nouvelle génération (ST-US-017 v0.10 §6.7 n° 10, n° 11 ; RG-044 b ; DAT §4.2.2 ;
 * DEC-030) : sur l'appareil qui choisit (UT-US-017-69 ; US-017 S21, S22, S22b), sur l'autre appareil
 * (UT-US-017-70 ; US-017 S21, S22d).
 */
import { describe, expect, it } from 'vitest';
import { echec } from '@src/commun/domaine/resultat';
import { compterALire } from '@src/synchronisation/domaine/lectures';
import { decompterModificationsEnAttente } from '@src/synchronisation/domaine/index-en-attente';
import { valeurDe, appliquerModifications } from '@tests/support/environnement';
import { creationObjectif } from '@tests/support/modifications';
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
import { registre } from '@tests/support/fabriques/etat-local';
import { date, hlc, idObjectif, instant, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

describe('« Repartir de zéro » sur l’appareil qui choisit (ST-US-017 v0.10 §6.7 n° 11)', () => {
  it('UT-US-017-69 S22b : sans réseau, « Repartir de zéro » est refusé (évaluer et exécuter), rien n’est écrit ni effacé ; sans ERR-012, il est refusé (AucuneAlteration)', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    expect(await env.smartphone.repartir.evaluer()).toEqual(echec({ type: 'AucuneAlteration' }));
    env.drive.supprimerDonnees();
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    const ecritures = env.drive.ecrituresPar(SMARTPHONE);
    env.smartphone.reseau.changer(false);
    expect(await env.smartphone.repartir.evaluer()).toEqual(echec({ type: 'ReseauIndisponible' }));
    expect(await env.smartphone.repartir.executer()).toEqual(echec({ type: 'ReseauIndisponible' }));
    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);
    expect((await objectifsDe(env.smartphone)).size).toBe(1);
  });

  it('UT-US-017-69 S22 : évaluer annonce le nombre de modifications en attente ; renoncer (ne pas exécuter) ne change rien', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    env.drive.supprimerDonnees();
    valeurDe(await renommerObjectif(env.smartphone, PUBLIER, 'Publier le guide pratique'));
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    const etat = valeurDe(await env.smartphone.depot.lire());
    expect(valeurDe(await env.smartphone.repartir.evaluer())).toEqual({
      n: decompterModificationsEnAttente(etat.enAttente),
    });
    expect(decompterModificationsEnAttente(etat.enAttente)).toBe(1);
    expect(valeurDe(await env.smartphone.depot.lire())).toEqual(etat);
    expect(env.drive.fichiers().filter((f) => !f.supprime && f.parent !== undefined)).toEqual([]);
  });

  it('UT-US-017-69 S21 : après confirmation, manifeste de génération NOUVELLE(h), fichier propre vide de cette génération, espace local vidé sans ALR-014 ; plus rien à déposer ensuite', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    env.drive.supprimerDonnees();
    valeurDe(await renommerObjectif(env.smartphone, PUBLIER, 'Publier le guide pratique'));
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');

    expect(await env.smartphone.repartir.executer()).toEqual({ ok: true, valeur: undefined });
    expect((await objectifsDe(env.smartphone)).size).toBe(0);
    const etat = valeurDe(await env.smartphone.depot.lire());
    expect(etat.registres.size + etat.journal.size + etat.enAttente.size).toBe(0);
    const s = await signalementsDe(env.smartphone);
    expect(s.valeursEcartees.size + s.lectures.size).toBe(0);
    const meta = await metaDe(env.smartphone);
    const generation = meta.generation;
    if (generation?.type !== 'NOUVELLE') throw new Error('génération attendue NOUVELLE');
    expect(generation.hlc.appareil).toBe(SMARTPHONE);
    expect(etat.dernierHlc).toEqual(generation.hlc);
    expect(meta.deposeJusquA).toEqual(generation.hlc);
    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBeUndefined();

    const manifestes = await manifestesDuDrive(env.drive);
    expect(manifestes.map((m) => m.contenu)).toEqual([{ schemaVersion: 1, generation }]);
    const { contenu } = await fichierDuDrive(env.drive, SMARTPHONE);
    expect(contenu.generation).toEqual(generation);
    expect(contenu.registres).toEqual([]);
    expect(contenu.journal).toEqual([]);

    const ecritures = env.drive.ecrituresPar(SMARTPHONE);
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);
  });
});

describe('Nouvelle génération sur l’autre appareil (ST-US-017 v0.10 §6.7 n° 10, n° 12 ; RG-044 b)', () => {
  it('UT-US-017-70 S21 : le PC, hors ligne pendant le choix, efface ses données sans question, signale sa modification en attente (ALR-014, non comptée « à lire ») et dépose son fichier dans la nouvelle génération', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    env.drive.supprimerDonnees();
    env.pc.reseau.changer(false);
    valeurDe(await renommerObjectif(env.pc, PUBLIER, 'Publier le guide pratique'));
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    valeurDe(await env.smartphone.repartir.executer());
    const generation = (await metaDe(env.smartphone)).generation;

    env.pc.reseau.changer(true);
    expect(await env.pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.pc.cycle.etatMoteur().actionRequise).toBeUndefined();
    expect((await objectifsDe(env.pc)).size).toBe(0);
    const metaPc = await metaDe(env.pc);
    expect(metaPc.generation).toEqual(generation);
    const s = await signalementsDe(env.pc);
    const [entree, ...autres] = [...s.valeursEcartees.values()];
    expect(autres).toEqual([]);
    expect(entree).toMatchObject({
      motif: 'DONNEES_EFFACEES',
      intituleElement: 'Publier le guide pratique',
      ecartee: { cle: { type: 'OBJECTIF', id: PUBLIER, champ: 'intitule' } },
    });
    expect(compterALire(s.valeursEcartees, s.lectures)).toBe(0);
    const { contenu } = await fichierDuDrive(env.drive, env.pc.appareilId);
    expect(contenu.generation).toEqual(generation);
    expect(contenu.registres).toEqual([]);
    // Signalement synchronisé avec le fichier (DAT §4.2) ; seul le PC le détaille (UT-US-017-73).
    expect((contenu.valeursEcartees ?? []).map((v) => v.id)).toEqual(
      entree === undefined ? [] : [entree.id],
    );
    await env.echanger();
    expect((await objectifsDe(env.smartphone)).size).toBe(0);
    expect((await objectifsDe(env.pc)).size).toBe(0);
  });

  it('UT-US-017-70 S22d : la question laissée en attente sur le PC (ERR-012, « Décider plus tard ») disparaît d’elle-même ; les fichiers de l’ancienne génération ne sont plus jamais fusionnés', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    env.drive.supprimerDonnees();
    expect(await env.pc.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('DONNEES_ALTEREES');
    valeurDe(await env.smartphone.repartir.executer());
    await env.echanger();
    expect(env.pc.cycle.etatMoteur().actionRequise).toBeUndefined();
    expect((await objectifsDe(env.pc)).size).toBe(0);
    expect([...(await signalementsDe(env.pc)).valeursEcartees.values()]).toEqual([]);

    // Un troisième appareil dépose un fichier de l'ancienne génération (INITIALE) : jamais fusionné.
    const dossier = (await metaDe(env.pc)).dossier;
    if (dossier === undefined) throw new Error('dossier attendu');
    const tiers = env.drive.transportPour(TROISIEME, {
      reseau: env.pc.reseau,
      accesAccorde: () => true,
    });
    valeurDe(
      await tiers.deposerFichierAppareil({
        dossier,
        contenu: {
          schemaVersion: 1,
          versionApplication: '0.1.0',
          generation: { type: 'INITIALE' },
          appareil: TROISIEME,
          registres: [
            registre(
              { type: 'OBJECTIF', id: idObjectif(7), champ: 'creation' },
              { creeLe: instant('2026-10-21T08:30:00.000Z') },
              hlc('2026-10-21T08:30:00.000Z', 0, TROISIEME),
            ),
            registre(
              { type: 'OBJECTIF', id: idObjectif(7), champ: 'intitule' },
              'Ancien',
              hlc('2026-10-21T08:30:00.000Z', 1, TROISIEME),
            ),
          ],
          journal: [],
        },
      }),
    );
    await env.echanger();
    expect((await objectifsDe(env.pc)).size).toBe(0);
    expect((await objectifsDe(env.smartphone)).size).toBe(0);
    expect(env.pc.cycle.etatMoteur().actionRequise).toBeUndefined();
  });

  it('UT-US-017-70 après la nouvelle génération, les deux appareils synchronisent normalement leurs nouvelles saisies', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    env.drive.supprimerDonnees();
    await env.smartphone.cycle.synchroniserMaintenant();
    valeurDe(await env.smartphone.repartir.executer());
    await env.echanger();
    valeurDe(
      await appliquerModifications(env.pc.service, (_etat, contexte) => [
        creationObjectif(
          { id: idObjectif(3), intitule: 'Recommencer', delai: date('2027-01-15') },
          contexte.instant,
        ),
      ]),
    );
    await env.echanger();
    expect(await objectifsDe(env.smartphone)).toEqual(new Map([['Recommencer', '2027-01-15']]));
  });
});
