/**
 * CycleSynchronisation (ST-US-017 §6.2 à §6.4, DAT §4.3), sur DepotLocalDexie (fake-indexeddb), FauxDrive et
 * PlanificateurSimule. UT-US-017-17 à 32 (32 : RL-LOT-001-A3, E11).
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import type { IdObjectif } from '@src/commun/domaine/identifiants';
import type { Modification } from '@src/synchronisation/domaine/modification';
import { decoderFichierAppareil } from '@src/synchronisation/infrastructure/drive/format-v1';
import { FauxDrive } from '@tests/doublures/faux-drive';
import { PlanificateurSimule } from '@tests/doublures/planificateur-simule';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { appliquerModifications, valeurDe } from '@tests/support/environnement';
import { creationObjectif } from '@tests/support/modifications';
import {
  creerAppareilCycle,
  type AppareilCycle,
} from '@tests/support/synchronisation/appareil-cycle';
import { ecart, idObjectif, instant, MINUTE, PC, SMARTPHONE } from '@tests/support/valeurs';

const DEPART = '2026-10-21T08:00:00.000Z';

const preparer = () => {
  const temps = new TempsSimule(instant(DEPART));
  const planificateur = new PlanificateurSimule(temps);
  const drive = new FauxDrive(temps);
  const appareil = (appareilId: IdAppareil, prefixe: string) =>
    creerAppareilCycle({ appareilId, prefixe, drive, temps, planificateur });
  const avancer = async (ms: number, appareils: ReadonlyArray<AppareilCycle>) => {
    temps.avancer(ecart(ms));
    planificateur.executerEchus();
    await Promise.all(appareils.map((a) => a.cycle.cycleEnCours() ?? Promise.resolve(undefined)));
  };
  return { temps, planificateur, drive, appareil, avancer };
};

const creerObjectif = (a: AppareilCycle, id: IdObjectif, intitule: string) =>
  appliquerModifications(a.service, (_etat, contexte) => [
    creationObjectif({ id, intitule }, contexte.instant),
  ]);
const renommer = (a: AppareilCycle, id: IdObjectif, intitule: string) =>
  appliquerModifications(a.service, (): ReadonlyArray<Modification> => [
    { type: 'ECRIRE_OBJECTIF', id, ecriture: { champ: 'intitule', valeur: intitule } },
  ]);
const intitules = async (a: AppareilCycle) =>
  [...valeurDe(await a.service.lire()).objectifs.values()]
    .filter((o) => !o.supprime)
    .map((o) => o.intitule)
    .sort();
const enAttente = async (a: AppareilCycle) =>
  valeurDe(await a.service.lireDecompteEnAttente()).nombre;
const fichiersDe = (drive: FauxDrive, appareil: IdAppareil) =>
  drive.fichiers().filter((f) => f.appProperties['appareil'] === appareil && !f.supprime);

describe('CycleSynchronisation (ST-US-017 §6)', () => {
  it('UT-US-017-17 synchroniserMaintenant — premier cycle : manifeste, LISEZ-MOI, fichier propre déposé, méta mémorisée, index vidé', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    await creerObjectif(smartphone, idObjectif(1), 'Publier le guide');

    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');

    const noms = env.drive
      .fichiers()
      .map((f) => f.nom)
      .sort();
    expect(noms).toEqual(
      ['Done Juan', 'LISEZ-MOI.txt', `${SMARTPHONE}.etat.json.gz`, 'manifeste.json'].sort(),
    );
    const meta = valeurDe(await smartphone.depot.lireMeta());
    const etat = valeurDe(await smartphone.depot.lire());
    expect(meta.fichierPropre).toBeDefined();
    expect(meta.deposeJusquA).toEqual(etat.dernierHlc);
    expect(await enAttente(smartphone)).toBe(0);
    const propre = fichiersDe(env.drive, SMARTPHONE)[0];
    expect(
      propre && valeurDe(await decoderFichierAppareil(propre.octets)).registres.length,
    ).toBeGreaterThan(0);
  });

  it('UT-US-017-18 synchroniserMaintenant — intègre le fichier de l’autre appareil (S04)', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    const pc = env.appareil(PC, '02');
    await creerObjectif(smartphone, idObjectif(1), 'Publier le guide');
    await smartphone.cycle.synchroniserMaintenant();

    expect(await pc.cycle.synchroniserMaintenant()).toBe('TERMINE');

    expect(await intitules(pc)).toEqual(['Publier le guide']);
    expect(await enAttente(pc)).toBe(0);
  });

  it('UT-US-017-32 synchroniserMaintenant — jeton de changements refusé : oublié, inventaire complet dans le même cycle, sans tentative comptée (DAT v0.11.4 §4.3, RL-LOT-001-A3)', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    const pc = env.appareil(PC, '02');
    await pc.cycle.synchroniserMaintenant();
    const jetonAvant = valeurDe(await pc.depot.lireMeta()).pageToken;
    await creerObjectif(smartphone, idObjectif(1), 'Publier le guide');
    await smartphone.cycle.synchroniserMaintenant();
    env.drive.invaliderJetons();

    expect(await pc.cycle.synchroniserMaintenant()).toBe('TERMINE');

    expect(await intitules(pc)).toEqual(['Publier le guide']);
    expect(pc.cycle.etatMoteur()).toEqual({ cycle: 'REPOS', aLire: 0 });
    const jetonApres = valeurDe(await pc.depot.lireMeta()).pageToken;
    expect(jetonApres).toBeDefined();
    expect(jetonApres).not.toEqual(jetonAvant);
  });

  it('UT-US-017-19 deposerMaintenant — réponse du dépôt perdue : deposeJusquA inchangé, entrée gardée, puis un seul fichier après la reprise (ENF-T-07)', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    await creerObjectif(smartphone, idObjectif(1), 'Publier le guide');
    env.drive.perdreReponseDuProchainDepot();

    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('ECHEC_TRANSITOIRE');
    expect(valeurDe(await smartphone.depot.lireMeta()).deposeJusquA).toBeUndefined();
    expect(await enAttente(smartphone)).toBe(1);

    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(fichiersDe(env.drive, SMARTPHONE)).toHaveLength(1);
    expect(await enAttente(smartphone)).toBe(0);
  });

  it('UT-US-017-20 synchroniserMaintenant — réseau coupé : non lancé, rien d’écrit, modification conservée (RG-021)', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    smartphone.reseau.changer(false);
    await creerObjectif(smartphone, idObjectif(1), 'Publier le guide');

    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('NON_LANCE_HORS_LIGNE');

    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(0);
    expect(await enAttente(smartphone)).toBe(1);
  });

  it('UT-US-017-21 demarrer — une modification locale est déposée 5 s après, pas avant (DAT §4.3)', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    smartphone.cycle.demarrer();
    await creerObjectif(smartphone, idObjectif(1), 'Publier le guide');

    await env.avancer(4_999, [smartphone]);
    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(0);
    await env.avancer(1, [smartphone]);
    expect(await enAttente(smartphone)).toBe(0);
  });

  it('UT-US-017-22 demarrer — synchronise toutes les 2 min au premier plan : la modification du PC arrive sans action (S02)', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    const pc = env.appareil(PC, '02');
    await smartphone.cycle.synchroniserMaintenant();
    smartphone.cycle.demarrer();
    await creerObjectif(pc, idObjectif(1), 'Publier le guide');
    await pc.cycle.synchroniserMaintenant();

    await env.avancer(2 * MINUTE, [smartphone]);

    expect(await intitules(smartphone)).toEqual(['Publier le guide']);
  });

  it('UT-US-017-23 demarrer — le retour du réseau déclenche un cycle (US-018 S06)', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    smartphone.reseau.changer(false);
    smartphone.cycle.demarrer();
    await creerObjectif(smartphone, idObjectif(1), 'Publier le guide');

    smartphone.reseau.changer(true);
    await smartphone.cycle.cycleEnCours();

    expect(await enAttente(smartphone)).toBe(0);
  });

  it('UT-US-017-24 synchroniserMaintenant — une écriture faite pendant le dépôt reste en attente (DAT §4.1.5 bis)', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    await creerObjectif(smartphone, idObjectif(1), 'Publier le guide');
    env.drive.avantReponseDuProchainDepot(async () => {
      await renommer(smartphone, idObjectif(1), 'Publier le guide pratique');
    });

    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');

    expect(await enAttente(smartphone)).toBe(1);
  });

  it('UT-US-017-25 demarrer — sans accès, rien n’est lancé ; le retour du jeton déclenche le cycle (US-022 S23b)', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    smartphone.acces.changer('A_RENOUVELER');
    await creerObjectif(smartphone, idObjectif(1), 'Publier le guide');

    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('NON_LANCE_SANS_ACCES');
    smartphone.cycle.demarrer();
    smartphone.acces.changer('VALIDE');
    await smartphone.cycle.cycleEnCours();

    expect(await enAttente(smartphone)).toBe(0);
  });

  it('UT-US-017-26 synchroniserMaintenant — un 401 est signalé à l’accès Google, sans nouvelle tentative (DAT §4.1.6 bis)', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    smartphone.autorisationGoogle.accordee = false;

    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('ACCES_REFUSE');

    expect(smartphone.acces.refusSignales).toEqual(['VALIDE']);
    expect(smartphone.cycle.etatMoteur().cycle).toBe('REPOS');
  });

  it('UT-US-017-27 synchroniserMaintenant — Drive plein : action requise, modification conservée, effacée au dépôt suivant réussi (S29)', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    await creerObjectif(smartphone, idObjectif(1), 'Publier le guide');
    env.drive.plein();

    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('DRIVE_PLEIN');
    expect(smartphone.cycle.etatMoteur().actionRequise).toBe('DRIVE_PLEIN');
    expect(await enAttente(smartphone)).toBe(1);

    env.drive.liberer();
    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(smartphone.cycle.etatMoteur().actionRequise).toBeUndefined();
  });

  it('UT-US-017-28 synchroniserMaintenant — erreurs serveur : nouvelle tentative, action requise après 3, tentatives poursuivies (DAT §4.3)', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    await creerObjectif(smartphone, idObjectif(1), 'Publier le guide');
    env.drive.indisponible('toujours');

    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('ECHEC_TRANSITOIRE');
    expect(smartphone.cycle.etatMoteur().cycle).toBe('RETENTATIVE');
    for (let i = 0; i < 3; i += 1) await env.avancer(5 * MINUTE, [smartphone]);
    expect(smartphone.cycle.etatMoteur().actionRequise).toBe('ECHEC_PERSISTANT');

    env.drive.retablir();
    await env.avancer(5 * MINUTE, [smartphone]);
    expect(smartphone.cycle.etatMoteur()).toEqual({ cycle: 'REPOS', aLire: 0 });
    expect(await enAttente(smartphone)).toBe(0);
  });

  describe('Propriétés du banc à deux appareils (conventions §11.11)', () => {
    type Action =
      | { readonly type: 'CREER'; readonly appareil: 0 | 1; readonly n: number }
      | {
          readonly type: 'RENOMMER';
          readonly appareil: 0 | 1;
          readonly n: number;
          readonly texte: string;
        }
      | { readonly type: 'SYNCHRONISER'; readonly appareil: 0 | 1 }
      | { readonly type: 'COUPER'; readonly appareil: 0 | 1 }
      | { readonly type: 'RETABLIR'; readonly appareil: 0 | 1 }
      | { readonly type: 'AVANCER' };
    const appareilAleatoire = fc.constantFrom<0 | 1>(0, 1);
    const action: fc.Arbitrary<Action> = fc.oneof(
      fc.record({
        type: fc.constant('CREER' as const),
        appareil: appareilAleatoire,
        n: fc.integer({ min: 1, max: 3 }),
      }),
      fc.record({
        type: fc.constant('RENOMMER' as const),
        appareil: appareilAleatoire,
        n: fc.integer({ min: 1, max: 3 }),
        texte: fc.constantFrom('A', 'B', 'C'),
      }),
      fc.record({ type: fc.constant('SYNCHRONISER' as const), appareil: appareilAleatoire }),
      fc.record({ type: fc.constant('COUPER' as const), appareil: appareilAleatoire }),
      fc.record({ type: fc.constant('RETABLIR' as const), appareil: appareilAleatoire }),
      fc.constant({ type: 'AVANCER' as const }),
    );

    /** Joue les actions ; une création ou un renommage d'un objectif inexistant ou déjà créé est sauté. */
    const jouer = async (actions: ReadonlyArray<Action>) => {
      const env = preparer();
      const appareils = [env.appareil(SMARTPHONE, '01'), env.appareil(PC, '02')] as const;
      const crees = new Set<number>();
      for (const a of actions) {
        if (a.type === 'AVANCER') {
          await env.avancer(MINUTE, appareils);
          continue;
        }
        const cible = appareils[a.appareil];
        if (a.type === 'CREER' && !crees.has(a.n)) {
          crees.add(a.n);
          await creerObjectif(cible, idObjectif(a.n), `Objectif ${String(a.n)}`);
        }
        if (a.type === 'RENOMMER' && (await intitules(cible)).includes(`Objectif ${String(a.n)}`)) {
          await renommer(cible, idObjectif(a.n), a.texte);
        }
        if (a.type === 'SYNCHRONISER') await cible.cycle.synchroniserMaintenant();
        if (a.type === 'COUPER') cible.reseau.changer(false);
        if (a.type === 'RETABLIR') cible.reseau.changer(true);
      }
      return { env, appareils };
    };
    const jusquAuRepos = async (appareils: ReadonlyArray<AppareilCycle>) => {
      for (const a of appareils) a.reseau.changer(true);
      for (let tour = 0; tour < 3; tour += 1) {
        for (const a of appareils) await a.cycle.synchroniserMaintenant();
      }
    };

    it('UT-US-017-29 cycle — convergence : après synchronisation jusqu’au repos, les deux appareils ont les mêmes données', async () => {
      await fc.assert(
        fc.asyncProperty(fc.array(action, { maxLength: 12 }), async (actions) => {
          const { appareils } = await jouer(actions);
          await jusquAuRepos(appareils);
          expect(await intitules(appareils[0])).toEqual(await intitules(appareils[1]));
          expect(await enAttente(appareils[0])).toBe(0);
          expect(await enAttente(appareils[1])).toBe(0);
        }),
        { numRuns: 25 },
      );
    });

    it('UT-US-017-30 cycle — idempotence : un tour de plus, au repos, n’écrit rien dans le Drive et ne change rien', async () => {
      await fc.assert(
        fc.asyncProperty(fc.array(action, { maxLength: 12 }), async (actions) => {
          const { env, appareils } = await jouer(actions);
          await jusquAuRepos(appareils);
          const ecritures = [env.drive.ecrituresPar(SMARTPHONE), env.drive.ecrituresPar(PC)];
          const avant = await intitules(appareils[0]);
          await jusquAuRepos(appareils);
          expect([env.drive.ecrituresPar(SMARTPHONE), env.drive.ecrituresPar(PC)]).toEqual(
            ecritures,
          );
          expect(await intitules(appareils[0])).toEqual(avant);
        }),
        { numRuns: 25 },
      );
    });

    it('UT-US-017-31 cycle — reprise : un arrêt brutal après un dépôt sans réponse ne perd rien (PT-13)', async () => {
      await fc.assert(
        fc.asyncProperty(fc.array(action, { maxLength: 10 }), async (actions) => {
          const { env, appareils } = await jouer(actions);
          const [smartphone, pc] = appareils;
          smartphone.reseau.changer(true);
          await creerObjectif(smartphone, idObjectif(9), 'Dernier');
          env.drive.perdreReponseDuProchainDepot();
          await smartphone.cycle.synchroniserMaintenant();
          // Arrêt brutal : nouvelle instance sur la même base.
          const relance = creerAppareilCycle({
            appareilId: SMARTPHONE,
            prefixe: '01',
            drive: env.drive,
            temps: env.temps,
            planificateur: env.planificateur,
            fabrique: smartphone.fabrique,
          });
          await jusquAuRepos([relance, pc]);
          expect(await intitules(pc)).toContain('Dernier');
          expect(await intitules(relance)).toEqual(await intitules(pc));
          expect(fichiersDe(env.drive, SMARTPHONE)).toHaveLength(1);
        }),
        { numRuns: 15 },
      );
    });
  });
});
