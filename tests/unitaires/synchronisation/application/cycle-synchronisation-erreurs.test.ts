/**
 * Chemins d'erreur de CycleSynchronisation qui protègent le jeton de changements et le dépôt (ST-US-017 §6.3,
 * RC-R3-2) : panne ciblée d'une méthode du transport, sur FauxDrive et DepotLocalDexie réels.
 */
import { describe, expect, it } from 'vitest';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
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
import {
  ecart,
  idObjectif,
  instant,
  MINUTE,
  PC,
  SMARTPHONE,
  TROISIEME,
} from '@tests/support/valeurs';

type MethodeEnPanne =
  | 'preparerDossier'
  | 'listerFichiersAppareils'
  | 'changements'
  | 'lireFichierAppareil'
  | 'lireManifeste';

/** Transport qui rend, une fois, l'erreur programmée pour une méthode ; compte les lectures de fichier. */
const transportAvecPannes = (reel: TransportSynchro) => {
  const pannes = new Map<MethodeEnPanne, ErreurTransport>();
  const lectures: Array<string> = [];
  const panne = <T>(
    methode: MethodeEnPanne,
    appel: () => Promise<Resultat<T, ErreurTransport>>,
  ): Promise<Resultat<T, ErreurTransport>> => {
    const erreur = pannes.get(methode);
    if (erreur === undefined) return appel();
    pannes.delete(methode);
    return Promise.resolve(echec(erreur));
  };
  const transport: TransportSynchro = {
    preparerDossier: () => panne('preparerDossier', () => reel.preparerDossier()),
    listerFichiersAppareils: (dossier) =>
      panne('listerFichiersAppareils', () => reel.listerFichiersAppareils(dossier)),
    changements: (dossier, jeton) => panne('changements', () => reel.changements(dossier, jeton)),
    lireFichierAppareil: (id) => {
      lectures.push(id);
      return panne('lireFichierAppareil', () => reel.lireFichierAppareil(id));
    },
    deposerFichierAppareil: (p) => reel.deposerFichierAppareil(p),
    lireManifeste: (dossier) => panne('lireManifeste', () => reel.lireManifeste(dossier)),
    ecrireManifeste: (p) => reel.ecrireManifeste(p),
  };
  return { transport, pannes, lectures };
};

type MethodeDepot = 'lire' | 'lireMeta' | 'appliquerSynchronisation';
const ECRITURE_IMPOSSIBLE = echec<ErreurDepotLocal>({ type: 'EcritureLocaleImpossible' });

/** Dépôt local réel dont les appels numérotés (à partir de 1, par méthode) échouent. */
const depotAvecPannes = (
  reel: DepotLocal,
  pannes: Partial<Record<MethodeDepot, ReadonlyArray<number>>>,
): DepotLocal => {
  const appels: Record<MethodeDepot, number> = {
    lire: 0,
    lireMeta: 0,
    appliquerSynchronisation: 0,
  };
  const enPanne = (methode: MethodeDepot): boolean => {
    appels[methode] += 1;
    return pannes[methode]?.includes(appels[methode]) ?? false;
  };
  return {
    lire: () => (enPanne('lire') ? Promise.resolve(ECRITURE_IMPOSSIBLE) : reel.lire()),
    appliquer: (calcul) => reel.appliquer(calcul),
    observer: (rappel) => reel.observer(rappel),
    lireMeta: () => (enPanne('lireMeta') ? Promise.resolve(ECRITURE_IMPOSSIBLE) : reel.lireMeta()),
    appliquerSynchronisation: (calcul) =>
      enPanne('appliquerSynchronisation')
        ? Promise.resolve(ECRITURE_IMPOSSIBLE)
        : reel.appliquerSynchronisation(calcul),
  };
};

const preparer = () => {
  const temps = new TempsSimule(instant('2026-10-21T08:00:00.000Z'));
  const planificateur = new PlanificateurSimule(temps);
  const drive = new FauxDrive(temps);
  const appareil = (appareilId: IdAppareil, prefixe: string) =>
    creerAppareilCycle({ appareilId, prefixe, drive, temps, planificateur });
  /** Cycle de l'appareil `a` (même dépôt local) sur un transport à pannes programmables. */
  const cycleEnPanne = (a: AppareilCycle, depot: DepotLocal = a.depot) => {
    const reseau = new ReseauCommandable();
    const pilote = transportAvecPannes(
      drive.transportPour(a.appareilId, { reseau, accesAccorde: () => true }),
    );
    const journal = new JournalEnMemoire();
    const cycle = new CycleSynchronisation({
      depot,
      transport: pilote.transport,
      acces: new AccesCommandable(),
      reseau,
      planificateur,
      aleatoire: new SourceAleatoireDeterministe([500]),
      horloge: new HorlogeSimulee(temps),
      journal,
      versionApplication: '0.1.0',
    });
    return { cycle, reseau, journal, ...pilote };
  };
  /** Exécute les échéances dues après `ms` et attend le cycle qu'elles ont lancé. */
  const avancer = async (ms: number, cycle: CycleSynchronisation) => {
    temps.avancer(ecart(ms));
    planificateur.executerEchus();
    await (cycle.cycleEnCours() ?? Promise.resolve(undefined));
  };
  return { temps, planificateur, drive, appareil, cycleEnPanne, avancer };
};

const creer = (a: AppareilCycle, n: number) =>
  appliquerModifications(a.service, (_etat, contexte) => [
    creationObjectif({ id: idObjectif(n), intitule: `Objectif ${String(n)}` }, contexte.instant),
  ]);
const objectifs = async (a: AppareilCycle) => valeurDe(await a.service.lire()).objectifs.size;
const meta = async (a: AppareilCycle) => valeurDe(await a.depot.lireMeta());
const enAttente = async (a: AppareilCycle) =>
  valeurDe(await a.service.lireDecompteEnAttente()).nombre;
const avertissements = (journal: JournalEnMemoire) =>
  journal.entrees.filter((e) => e.niveau === 'avertissement').map((e) => e.evenement);

/** Smartphone synchronisé une fois (jeton mémorisé), puis PC qui dépose un objectif nouveau. */
const smartphoneAvecJetonPuisDepotDuPc = async (env: ReturnType<typeof preparer>) => {
  const smartphone = env.appareil(SMARTPHONE, '01');
  const pc = env.appareil(PC, '02');
  const enPanne = env.cycleEnPanne(smartphone);
  expect(await enPanne.cycle.synchroniserMaintenant()).toBe('TERMINE');
  const jeton = (await meta(smartphone)).pageToken;
  expect(jeton).toBeDefined();
  await creer(pc, 1);
  expect(await pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
  return { smartphone, pc, enPanne, jeton };
};

describe('CycleSynchronisation, chemins d’erreur (ST-US-017 §6.3, RC-R3-2)', () => {
  it('UT-COMP-US-017-35 lecture d’un fichier d’appareil en 5xx : cycle interrompu, jeton inchangé, aucun dépôt, reprise programmée qui relit et fusionne le fichier', async () => {
    const env = preparer();
    const { smartphone, enPanne, jeton } = await smartphoneAvecJetonPuisDepotDuPc(env);
    await creer(smartphone, 2);
    const ecritures = env.drive.ecrituresPar(SMARTPHONE);
    enPanne.pannes.set('lireFichierAppareil', { type: 'ServeurIndisponible' });

    expect(await enPanne.cycle.synchroniserMaintenant()).toBe('ECHEC_TRANSITOIRE');

    expect(enPanne.cycle.etatMoteur()).toEqual({ cycle: 'RETENTATIVE', aLire: 0 });
    expect((await meta(smartphone)).pageToken).toBe(jeton);
    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);
    expect(await enAttente(smartphone)).toBe(1);
    expect(await objectifs(smartphone)).toBe(1);
    expect(env.planificateur.prochaineEcheance()).toBeDefined();
    const lecturesAvant = enPanne.lectures.length;

    await env.avancer(MINUTE, enPanne.cycle);

    expect(enPanne.lectures.length).toBe(lecturesAvant + 1);
    expect(await objectifs(smartphone)).toBe(2);
    expect((await meta(smartphone)).pageToken).not.toBe(jeton);
    expect(await enAttente(smartphone)).toBe(0);
    expect(enPanne.cycle.etatMoteur()).toEqual({ cycle: 'REPOS', aLire: 0 });
  });

  it('UT-COMP-US-017-36 lecture d’un fichier d’appareil interrompue par le réseau : jeton inchangé, aucun dépôt ; le cycle suivant relit le fichier', async () => {
    const env = preparer();
    const { smartphone, enPanne, jeton } = await smartphoneAvecJetonPuisDepotDuPc(env);
    const ecritures = env.drive.ecrituresPar(SMARTPHONE);
    enPanne.pannes.set('lireFichierAppareil', { type: 'ReseauIndisponible' });

    expect(await enPanne.cycle.synchroniserMaintenant()).toBe('ECHEC_TRANSITOIRE');

    expect(enPanne.cycle.etatMoteur()).toEqual({ cycle: 'REPOS', aLire: 0 });
    expect((await meta(smartphone)).pageToken).toBe(jeton);
    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);
    expect(env.planificateur.prochaineEcheance()).toBeUndefined();
    expect(avertissements(enPanne.journal)).toEqual([]);

    expect(await enPanne.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(await objectifs(smartphone)).toBe(1);
    expect((await meta(smartphone)).pageToken).not.toBe(jeton);
  });

  it('UT-COMP-US-017-37 fichier supprimé entre l’inventaire et la lecture (RessourceIntrouvable) : ignoré et journalisé, le cycle se termine et dépose', async () => {
    const env = preparer();
    const { smartphone, enPanne, jeton } = await smartphoneAvecJetonPuisDepotDuPc(env);
    await creer(smartphone, 2);
    enPanne.pannes.set('lireFichierAppareil', { type: 'RessourceIntrouvable' });

    expect(await enPanne.cycle.synchroniserMaintenant()).toBe('TERMINE');

    expect(avertissements(enPanne.journal)).toEqual(['FichierAppareilIgnore']);
    expect(enPanne.journal.entrees).toContainEqual({
      niveau: 'avertissement',
      evenement: 'FichierAppareilIgnore',
      champs: { cause: 'RessourceIntrouvable' },
    });
    expect(await objectifs(smartphone)).toBe(1);
    expect(await enAttente(smartphone)).toBe(0);
    expect((await meta(smartphone)).pageToken).not.toBe(jeton);
  });

  it.each([
    ['changements', true],
    ['listerFichiersAppareils', false],
  ] as const)(
    'UT-COMP-US-017-38 inventaire (%s) en 5xx : cycle interrompu sans lecture ni dépôt, jeton inchangé ; la reprise fusionne et dépose',
    async (methode, avecJeton) => {
      const env = preparer();
      const smartphone = env.appareil(SMARTPHONE, '01');
      const enPanne = env.cycleEnPanne(smartphone);
      // Avec jeton : un premier cycle, avant le dépôt du PC, le mémorise.
      const premier = avecJeton ? await enPanne.cycle.synchroniserMaintenant() : 'TERMINE';
      expect(premier).toBe('TERMINE');
      const pc = env.appareil(PC, '02');
      await creer(pc, 1);
      expect(await pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
      const jeton = (await meta(smartphone)).pageToken;
      expect(jeton !== undefined).toBe(avecJeton);
      await creer(smartphone, 2);
      const ecritures = env.drive.ecrituresPar(SMARTPHONE);
      const lectures = enPanne.lectures.length;
      enPanne.pannes.set(methode, { type: 'ServeurIndisponible' });

      expect(await enPanne.cycle.synchroniserMaintenant()).toBe('ECHEC_TRANSITOIRE');

      expect(enPanne.lectures.length).toBe(lectures);
      expect((await meta(smartphone)).pageToken).toBe(jeton);
      expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);
      expect(await enAttente(smartphone)).toBe(1);
      expect(enPanne.cycle.etatMoteur().cycle).toBe('RETENTATIVE');

      await env.avancer(MINUTE, enPanne.cycle);

      expect(await objectifs(smartphone)).toBe(2);
      expect((await meta(smartphone)).pageToken).toBeDefined();
      expect((await meta(smartphone)).pageToken).not.toBe(jeton);
      expect(await enAttente(smartphone)).toBe(0);
    },
  );

  it('UT-COMP-US-017-39 lecture du manifeste en 5xx : aucun dépôt ni manifeste mémorisé, fusions conservées (jeton mémorisé après elles, §6.3 v0.3.1) ; la reprise mémorise le manifeste et dépose', async () => {
    const env = preparer();
    const pc = env.appareil(PC, '02');
    await creer(pc, 1);
    expect(await pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
    const smartphone = env.appareil(SMARTPHONE, '01');
    const enPanne = env.cycleEnPanne(smartphone);
    await creer(smartphone, 2);
    enPanne.pannes.set('lireManifeste', { type: 'ServeurIndisponible' });

    expect(await enPanne.cycle.synchroniserMaintenant()).toBe('ECHEC_TRANSITOIRE');

    const apresEchec = await meta(smartphone);
    expect(apresEchec.manifeste).toBeUndefined();
    expect(apresEchec.fichierPropre).toBeUndefined();
    expect(apresEchec.fusionNonDeposee).toBe(true);
    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(0);
    expect(await objectifs(smartphone)).toBe(2);
    expect(await enAttente(smartphone)).toBe(1);

    await env.avancer(MINUTE, enPanne.cycle);

    const apresReprise = await meta(smartphone);
    expect(apresReprise.manifeste).toBeDefined();
    expect(apresReprise.fichierPropre).toBeDefined();
    expect(apresReprise.fusionNonDeposee).toBe(false);
    expect(await enAttente(smartphone)).toBe(0);
  });

  it('UT-COMP-US-017-43 identifiant du dossier non mémorisé (écriture locale impossible) : cycle interrompu sans inventaire ; le cycle suivant retrouve le même dossier', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    const depot = depotAvecPannes(smartphone.depot, { appliquerSynchronisation: [1] });
    const enPanne = env.cycleEnPanne(smartphone, depot);
    await creer(smartphone, 1);

    expect(await enPanne.cycle.synchroniserMaintenant()).toBe('ECHEC_TRANSITOIRE');

    expect((await meta(smartphone)).dossier).toBeUndefined();
    expect(env.drive.fichiers().map((f) => f.appProperties['donejuan'])).toEqual(['dossier']);
    expect(enPanne.lectures).toEqual([]);
    expect(avertissements(enPanne.journal)).toEqual(['SynchronisationEchec']);

    expect(await enPanne.cycle.synchroniserMaintenant()).toBe('TERMINE');
    const dossiers = env.drive.fichiers().filter((f) => f.appProperties['donejuan'] === 'dossier');
    expect(dossiers).toHaveLength(1);
    expect((await meta(smartphone)).dossier).toBe(dossiers[0]?.id);
    expect(await enAttente(smartphone)).toBe(0);
  });

  it('UT-COMP-US-017-44 deux fichiers portant la même information : la seconde fusion, vide dans sa transaction, n’écrit rien et ne duplique aucune entrée du journal', async () => {
    const env = preparer();
    const pc = env.appareil(PC, '02');
    await creer(pc, 1);
    expect(await pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
    const troisieme = env.appareil(TROISIEME, '03');
    expect(await troisieme.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(await objectifs(troisieme)).toBe(1);
    const smartphone = env.appareil(SMARTPHONE, '01');
    let transactionsEcrites = 0;
    smartphone.depot.observer(() => {
      transactionsEcrites += 1;
    });

    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');

    expect(await objectifs(smartphone)).toBe(1);
    expect(valeurDe(await smartphone.depot.lire()).journal.size).toBe(1);
    expect(transactionsEcrites).toBe(1);
    expect(await enAttente(smartphone)).toBe(0);
  });

  it('UT-COMP-US-017-45 deposerMaintenant pendant un cycle qui lève une exception : l’exception n’est pas propagée, le dépôt de sortie est tenté et aboutit', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    const reel = env.drive.transportPour(SMARTPHONE, {
      reseau: smartphone.reseau,
      accesAccorde: () => true,
    });
    let lever = true;
    const transport: TransportSynchro = {
      ...reel,
      preparerDossier: () => {
        if (!lever) return reel.preparerDossier();
        lever = false;
        return Promise.reject(new Error('panne'));
      },
    };
    const cycle = new CycleSynchronisation({
      depot: smartphone.depot,
      transport,
      acces: new AccesCommandable(),
      reseau: smartphone.reseau,
      planificateur: env.planificateur,
      aleatoire: new SourceAleatoireDeterministe([500]),
      horloge: new HorlogeSimulee(env.temps),
      journal: new JournalEnMemoire(),
      versionApplication: '0.1.0',
    });
    await creer(smartphone, 1);

    const enCours = cycle.synchroniserMaintenant();
    const sortie = cycle.deposerMaintenant();

    await expect(enCours).rejects.toThrow('panne');
    expect(await sortie).toBe('TERMINE');
    expect(await enAttente(smartphone)).toBe(0);
  });

  it('UT-COMP-US-017-46 transaction de fusion refusée par le dépôt local : cycle interrompu, jeton inchangé, aucun dépôt ; le cycle suivant relit et fusionne', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    const jeton = (await meta(smartphone)).pageToken;
    const pc = env.appareil(PC, '02');
    await creer(pc, 1);
    expect(await pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
    const enPanne = env.cycleEnPanne(
      smartphone,
      depotAvecPannes(smartphone.depot, { appliquerSynchronisation: [1] }),
    );
    const ecritures = env.drive.ecrituresPar(SMARTPHONE);

    expect(await enPanne.cycle.synchroniserMaintenant()).toBe('ECHEC_TRANSITOIRE');

    expect((await meta(smartphone)).pageToken).toBe(jeton);
    expect(await objectifs(smartphone)).toBe(0);
    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);
    expect(avertissements(enPanne.journal)).toEqual(['SynchronisationEchec']);

    expect(await enPanne.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(enPanne.lectures).toHaveLength(2);
    expect(await objectifs(smartphone)).toBe(1);
    expect((await meta(smartphone)).pageToken).not.toBe(jeton);
  });

  it('UT-COMP-US-017-47 jeton non mémorisé après les fusions (écriture locale impossible) : fusion conservée, aucun dépôt ; le cycle suivant relit sans effet, mémorise le jeton et dépose', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    const jeton = (await meta(smartphone)).pageToken;
    const pc = env.appareil(PC, '02');
    await creer(pc, 1);
    expect(await pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
    const enPanne = env.cycleEnPanne(
      smartphone,
      depotAvecPannes(smartphone.depot, { appliquerSynchronisation: [2] }),
    );
    const ecritures = env.drive.ecrituresPar(SMARTPHONE);

    expect(await enPanne.cycle.synchroniserMaintenant()).toBe('ECHEC_TRANSITOIRE');

    expect((await meta(smartphone)).pageToken).toBe(jeton);
    expect((await meta(smartphone)).fusionNonDeposee).toBe(true);
    expect(await objectifs(smartphone)).toBe(1);
    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);

    expect(await enPanne.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(enPanne.lectures).toHaveLength(2);
    expect(await objectifs(smartphone)).toBe(1);
    expect((await meta(smartphone)).pageToken).not.toBe(jeton);
    expect((await meta(smartphone)).fusionNonDeposee).toBe(false);
    expect(env.drive.ecrituresPar(SMARTPHONE)).toBeGreaterThan(ecritures);
  });

  it('UT-COMP-US-017-48 lecture locale impossible (état, méta, relecture avant dépôt) : cycle interrompu sans dépôt, l’entrée reste en attente', async () => {
    const env = preparer();
    const pc = env.appareil(PC, '02');
    await creer(pc, 1);
    expect(await pc.cycle.synchroniserMaintenant()).toBe('TERMINE');
    const smartphone = env.appareil(SMARTPHONE, '01');
    await creer(smartphone, 2);
    const cas: ReadonlyArray<Partial<Record<MethodeDepot, ReadonlyArray<number>>>> = [
      { lire: [1] },
      { lireMeta: [1] },
      // Une fusion a écrit : l'état est relu avant le dépôt (deuxième lecture).
      { lire: [2] },
    ];
    for (const pannes of cas) {
      const enPanne = env.cycleEnPanne(smartphone, depotAvecPannes(smartphone.depot, pannes));
      expect(await enPanne.cycle.synchroniserMaintenant()).toBe('ECHEC_TRANSITOIRE');
    }

    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(0);
    expect(await enAttente(smartphone)).toBe(1);
  });

  it('UT-COMP-US-017-49 dépôt seul — lecture locale, dossier ou manifeste en échec : aucun dépôt ; une fois le service rétabli, le dépôt aboutit', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    await creer(smartphone, 1);
    const sansLecture = env.cycleEnPanne(
      smartphone,
      depotAvecPannes(smartphone.depot, { lire: [1] }),
    );
    expect(await sansLecture.cycle.deposerMaintenant()).toBe('ECHEC_TRANSITOIRE');
    const enPanne = env.cycleEnPanne(smartphone);
    enPanne.pannes.set('preparerDossier', { type: 'ServeurIndisponible' });
    expect(await enPanne.cycle.deposerMaintenant()).toBe('ECHEC_TRANSITOIRE');
    enPanne.pannes.set('lireManifeste', { type: 'ServeurIndisponible' });
    expect(await enPanne.cycle.deposerMaintenant()).toBe('ECHEC_TRANSITOIRE');

    expect((await meta(smartphone)).manifeste).toBeUndefined();
    expect(env.drive.fichiers().map((f) => f.appProperties['donejuan'])).toEqual(['dossier']);
    expect(await enAttente(smartphone)).toBe(1);

    expect(await enPanne.cycle.deposerMaintenant()).toBe('TERMINE');
    expect(await enAttente(smartphone)).toBe(0);
  });

  it('UT-COMP-US-017-51 page masquée avant le démarrage : aucune période installée ; exception non Error d’un déclencheur consignée « inconnue »', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    smartphone.cycle.definirPremierPlan(false);
    smartphone.cycle.demarrer();
    expect(env.planificateur.prochaineEcheance()).toBeUndefined();

    const reel = env.drive.transportPour(SMARTPHONE, {
      reseau: smartphone.reseau,
      accesAccorde: () => true,
    });
    const reseau = new ReseauCommandable(false);
    const journal = new JournalEnMemoire();
    const cycle = new CycleSynchronisation({
      depot: smartphone.depot,
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- cas étudié : rejet sans Error
      transport: { ...reel, preparerDossier: () => Promise.reject('panne') },
      acces: new AccesCommandable(),
      reseau,
      planificateur: env.planificateur,
      aleatoire: new SourceAleatoireDeterministe([500]),
      horloge: new HorlogeSimulee(env.temps),
      journal,
      versionApplication: '0.1.0',
    });
    cycle.demarrer();
    reseau.changer(true);
    await expect(cycle.cycleEnCours()).rejects.toBe('panne');
    await Promise.resolve();

    expect(journal.entrees).toContainEqual({
      niveau: 'erreur',
      evenement: 'SynchronisationInterrompue',
      champs: { erreur: 'inconnue' },
    });
  });
});
