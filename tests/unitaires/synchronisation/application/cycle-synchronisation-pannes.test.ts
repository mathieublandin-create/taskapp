/**
 * Balayage des pannes d'un cycle (ST-US-017 v0.10.2 §6.7 n° 8 à 14, §8) : pour chaque scénario de décision
 * (synchronisation, restauration demandée ou vue ailleurs, déménagement, adoption d'une génération, « Repartir de
 * zéro »), chaque appel du transport et du dépôt local échoue à son tour. Le cycle rend l'issue prévue par le §8 ;
 * rien n'est perdu ni dupliqué : après la reprise, les deux appareils retrouvent l'état du déroulement sans panne.
 * Compléments de couverture de Bruce (rang 10).
 */
import { isDeepStrictEqual } from 'node:util';
import { describe, expect, it } from 'vitest';
import type {
  CycleSynchronisation,
  IssueCycle,
} from '@src/synchronisation/application/cycle-synchronisation';
import type { ContenuManifeste } from '@src/synchronisation/domaine/contenu-fichier';
import type { ErreurTransport } from '@src/synchronisation/application/ports/transport-synchro';
import { appliquerModifications, valeurDe } from '@tests/support/environnement';
import { creationObjectif } from '@tests/support/modifications';
import {
  cycleEnPanne,
  METHODES_DEPOT,
  METHODES_TRANSPORT,
  type Appels,
  type Environnement,
  type MethodeTransport,
  type Panne,
} from '@tests/support/synchronisation/pannes-cycle';
import {
  avecObjectifPublie,
  DEPART,
  PUBLIER,
  renommerObjectif,
  metaDe,
  objectifsDe,
  preparerRestauration,
} from '@tests/support/synchronisation/restauration';
import type { JournalEnMemoire } from '@tests/support/compte/doublures-compte';
import type { AppareilCycle } from '@tests/support/synchronisation/appareil-cycle';
import { date, idObjectif, instant, PC, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

type Action = 'SYNCHRONISER' | 'REPARTIR' | 'DEPOSER';
type Preparation = {
  readonly env: Environnement;
  readonly acteur: AppareilCycle;
  readonly action: Action;
  /** Écriture d'un autre appareil au milieu du cycle de l'acteur. */
  readonly avant?: (methode: MethodeTransport, rang: number) => Promise<void>;
};
type Scenario = {
  readonly nom: string;
  /** Le smartphone déménage vers le dossier canonique (n° 14). */
  readonly demenage?: true;
  readonly preparer: () => Promise<Preparation>;
};

const ERREUR = (type: 'ServeurIndisponible'): ErreurTransport => ({ type });

/** « Restaurer » demandé hors ligne sur le smartphone, exécuté au retour du réseau (n° 9). */
const restaurationDemandee = async (): Promise<Preparation> => {
  const env = preparerRestauration();
  await avecObjectifPublie(env);
  env.drive.supprimerDonnees();
  await env.smartphone.cycle.synchroniserMaintenant();
  env.smartphone.reseau.changer(false);
  valeurDe(await env.smartphone.restaurer.executer());
  env.smartphone.reseau.changer(true);
  return { env, acteur: env.smartphone, action: 'SYNCHRONISER' };
};

/** Restauration faite par le smartphone, vue par le PC en ERR-012 (n° 8). */
const restaurationVue = async (): Promise<Preparation> => {
  const env = preparerRestauration();
  await avecObjectifPublie(env);
  env.drive.supprimerDonnees();
  await env.smartphone.cycle.synchroniserMaintenant();
  await env.pc.cycle.synchroniserMaintenant();
  valeurDe(await env.smartphone.restaurer.executer());
  return { env, acteur: env.pc, action: 'SYNCHRONISER' };
};

/** Dossier « Done Juan » en double : le smartphone déménage vers le plus ancien (n° 14). */
const demenagement = async (): Promise<Preparation> => {
  const env = preparerRestauration();
  await avecObjectifPublie(env);
  env.drive.ajouterDossier(PC, instant(DEPART) - 60_000);
  return { env, acteur: env.smartphone, action: 'SYNCHRONISER' };
};

/** Le PC repart de zéro : le smartphone adopte la nouvelle génération (n° 11 a). */
const adoption = async (): Promise<Preparation> => {
  const env = preparerRestauration();
  await avecObjectifPublie(env);
  env.drive.supprimerDonnees();
  await env.smartphone.cycle.synchroniserMaintenant();
  await env.pc.cycle.synchroniserMaintenant();
  valeurDe(await env.pc.repartir.executer());
  return { env, acteur: env.smartphone, action: 'SYNCHRONISER' };
};

/** « Repartir de zéro » interrompu après le manifeste : le cycle suivant du smartphone achève le choix (n° 11 b). */
const choixInterrompu = async (): Promise<Preparation> => {
  const env = preparerRestauration();
  await avecObjectifPublie(env);
  env.drive.supprimerDonnees();
  await env.smartphone.cycle.synchroniserMaintenant();
  const interrompu = cycleEnPanne(env, env.smartphone, {
    cible: 'depot',
    methode: 'appliquerSynchronisation',
    occurrence: 2,
  });
  expect(await interrompu.cycle.repartirDeZero()).toBe('ECHEC_TRANSITOIRE');
  return { env, acteur: env.smartphone, action: 'SYNCHRONISER' };
};

/** « Repartir de zéro » confirmé sur le smartphone en ERR-012 (n° 11 c). */
const repartir = async (): Promise<Preparation> => {
  const env = preparerRestauration();
  await avecObjectifPublie(env);
  env.drive.supprimerDonnees();
  await env.smartphone.cycle.synchroniserMaintenant();
  return { env, acteur: env.smartphone, action: 'REPARTIR' };
};

/** Première connexion du smartphone, avec un objectif créé hors ligne et un PC qui a déjà déposé (n° 2 à 7). */
const synchronisationOrdinaire = async (): Promise<Preparation> => {
  const env = preparerRestauration();
  await avecObjectifPublie(env);
  valeurDe(
    await appliquerModifications(env.smartphone.service, (_etat, contexte) => [
      creationObjectif(
        { id: idObjectif(2), intitule: 'Relire le guide', delai: date('2027-01-10') },
        contexte.instant,
      ),
    ]),
  );
  return { env, acteur: env.smartphone, action: 'SYNCHRONISER' };
};

/** « Restaurer » demandé hors ligne alors que le fichier du smartphone a été modifié à la main (S32, C7). */
const fichierModifieAlaMain = async (): Promise<Preparation> => {
  const env = preparerRestauration();
  await avecObjectifPublie(env);
  valeurDe(await renommerObjectif(env.pc, PUBLIER, 'Publier le guide pratique'));
  await env.pc.cycle.synchroniserMaintenant();
  const fichier = env.drive.fichierDe(SMARTPHONE);
  if (fichier === undefined) throw new Error('fichier du smartphone attendu');
  env.drive.modifierFichierALaMain(fichier.id);
  await env.smartphone.cycle.synchroniserMaintenant();
  env.smartphone.reseau.changer(false);
  valeurDe(await env.smartphone.restaurer.executer());
  env.smartphone.reseau.changer(true);
  return { env, acteur: env.smartphone, action: 'SYNCHRONISER' };
};

/** « Restaurer » demandé hors ligne alors que le dossier « Done Juan » a été supprimé (dossier recréé, n° 9). */
const dossierSupprime = async (): Promise<Preparation> => {
  const env = preparerRestauration();
  await avecObjectifPublie(env);
  env.drive.supprimerDossiers();
  await env.smartphone.cycle.synchroniserMaintenant();
  env.smartphone.reseau.changer(false);
  valeurDe(await env.smartphone.restaurer.executer());
  env.smartphone.reseau.changer(true);
  return { env, acteur: env.smartphone, action: 'SYNCHRONISER' };
};

/** Dépôt seul d'un nouvel appareil (troisième) : dossier retrouvé, manifeste du Drive mémorisé, puis dépôt (§6.5). */
const depotSeulNouvelAppareil = async (): Promise<Preparation> => {
  const env = preparerRestauration();
  await avecObjectifPublie(env);
  const acteur = env.creer(TROISIEME, '03');
  valeurDe(
    await appliquerModifications(acteur.service, (_etat, contexte) => [
      creationObjectif(
        { id: idObjectif(3), intitule: 'Relire le guide', delai: date('2027-01-10') },
        contexte.instant,
      ),
    ]),
  );
  return { env, acteur, action: 'DEPOSER' };
};

/** Dépôt seul sur un Drive sans manifeste : le manifeste est écrit (avec LISEZ-MOI) avant le dépôt (§6.3). */
const depotSeulSansManifeste = async (): Promise<Preparation> => {
  const env = preparerRestauration();
  valeurDe(
    await appliquerModifications(env.smartphone.service, (_etat, contexte) => [
      creationObjectif(
        { id: PUBLIER, intitule: 'Publier le guide', delai: date('2026-12-15') },
        contexte.instant,
      ),
    ]),
  );
  return { env, acteur: env.smartphone, action: 'DEPOSER' };
};

/** Dépôt seul d'un nouvel appareil devant un manifeste illisible : ignoré et journalisé (§6.3). */
const depotSeulManifesteIllisible = async (): Promise<Preparation> => {
  const env = preparerRestauration();
  await avecObjectifPublie(env);
  for (const f of env.drive.fichiers().filter((x) => x.appProperties['donejuan'] === 'manifeste')) {
    env.drive.modifierFichierALaMain(f.id);
  }
  const acteur = env.creer(TROISIEME, '03');
  valeurDe(
    await appliquerModifications(acteur.service, (_etat, contexte) => [
      creationObjectif(
        { id: idObjectif(3), intitule: 'Relire le guide', delai: date('2027-01-10') },
        contexte.instant,
      ),
    ]),
  );
  return { env, acteur, action: 'DEPOSER' };
};

/** Un cycle du smartphone qui n'a rien écrit (dossier mémorisé, ni manifeste ni fichier propre), dossiers supprimés. */
const dossierMemoriseSeul = async (): Promise<Preparation> => {
  const env = preparerRestauration();
  const interrompu = cycleEnPanne(env, env.smartphone, {
    cible: 'transport',
    methode: 'ecrireManifeste',
    occurrence: 1,
    erreur: { type: 'ServeurIndisponible' },
  });
  expect(await interrompu.cycle.synchroniserMaintenant()).toBe('ECHEC_TRANSITOIRE');
  expect((await metaDe(env.smartphone)).dossier).toBeDefined();
  env.drive.supprimerDossiers();
  return { env, acteur: env.smartphone, action: 'SYNCHRONISER' };
};

/** Pendant l'adoption d'une génération, le PC en repart une seconde : une seule relance, la suite au cycle suivant. */
const secondeGeneration = async (): Promise<Preparation> => {
  const { env, acteur, action } = await adoption();
  return {
    env,
    acteur,
    action,
    avant: async (methode, rang) => {
      if (methode === 'listerDossiers' && rang === 2) await env.pc.cycle.repartirDeZero();
    },
  };
};

const SCENARIOS: ReadonlyArray<Scenario> = [
  { nom: 'restauration demandée', preparer: restaurationDemandee },
  { nom: 'restauration vue ailleurs', preparer: restaurationVue },
  { nom: 'déménagement vers le dossier canonique', demenage: true, preparer: demenagement },
  { nom: 'adoption d’une génération', preparer: adoption },
  { nom: 'choix interrompu achevé', preparer: choixInterrompu },
  { nom: '« Repartir de zéro »', preparer: repartir },
  { nom: 'synchronisation ordinaire', preparer: synchronisationOrdinaire },
  { nom: 'restauration après modification à la main', preparer: fichierModifieAlaMain },
  { nom: 'restauration après suppression du dossier', preparer: dossierSupprime },
  { nom: 'dossier mémorisé seul puis supprimé', preparer: dossierMemoriseSeul },
  { nom: 'seconde génération pendant l’adoption', preparer: secondeGeneration },
  { nom: 'dépôt seul d’un nouvel appareil', preparer: depotSeulNouvelAppareil },
  { nom: 'dépôt seul sans manifeste', preparer: depotSeulSansManifeste },
  { nom: 'dépôt seul devant un manifeste illisible', preparer: depotSeulManifesteIllisible },
];

/** État observable des deux appareils et du Drive après la reprise. */
const bilan = async (env: Environnement, acteur: AppareilCycle) => ({
  acteur: [...(await objectifsDe(acteur))],
  smartphone: [...(await objectifsDe(env.smartphone))],
  pc: [...(await objectifsDe(env.pc))],
  generation: [
    (await metaDe(env.smartphone)).generation?.type,
    (await metaDe(env.pc)).generation?.type,
  ],
  manifestes: env.drive
    .fichiers()
    .filter((f) => !f.supprime && f.appProperties['donejuan'] === 'manifeste').length,
  dossiers: env.drive.dossiers().filter((d) => !d.supprime).length,
});

const executer = (cycle: CycleSynchronisation, action: Action): Promise<IssueCycle> => {
  if (action === 'REPARTIR') return cycle.repartirDeZero();
  if (action === 'DEPOSER') return cycle.deposerMaintenant();
  return cycle.synchroniserMaintenant();
};

const lancer = async (
  scenario: Scenario,
  panne?: Panne,
): Promise<{
  readonly issue: IssueCycle;
  readonly appels: Appels;
  readonly env: Environnement;
  readonly action: Action;
  readonly acteur: AppareilCycle;
  readonly journal: JournalEnMemoire;
  readonly ecritures: number;
}> => {
  const { env, acteur, action, avant } = await scenario.preparer();
  const ecrituresAvant = env.drive.ecrituresPar(acteur.appareilId);
  const { cycle, appels, journal } = cycleEnPanne(env, acteur, panne, avant);
  const issue = await executer(cycle, action);
  const ecritures = env.drive.ecrituresPar(acteur.appareilId) - ecrituresAvant;
  return { issue, appels, env, action, acteur, journal, ecritures };
};

/** Reprise après la panne : le choix de « Repartir de zéro » est redemandé, puis les appareils s'échangent. */
const reprendre = async (
  env: Environnement,
  action: Action,
  acteur: AppareilCycle,
): Promise<void> => {
  if (action !== 'SYNCHRONISER') await executer(cycleEnPanne(env, acteur).cycle, action);
  await env.echanger();
};

/** Écarts constatés au fil d'un balayage : chaque cas de panne est nommé, le test échoue sur la liste complète. */
class Constats {
  readonly ecarts: Array<{
    readonly cas: string;
    readonly attendu: unknown;
    readonly obtenu: unknown;
  }> = [];
  egal(cas: string, attendu: unknown, obtenu: unknown): void {
    if (!isDeepStrictEqual(attendu, obtenu)) this.ecarts.push({ cas, attendu, obtenu });
  }
}

/** Appels différés sans changer l'issue : la corbeille, et le dernier inventaire du dossier quitté (n° 14). */
const estDiffere = (scenario: Scenario, methode: MethodeTransport, rang: number, total: number) =>
  methode === 'supprimerFichier' ||
  (scenario.demenage === true && methode === 'inventorierDossier' && rang === total);

/** Un fichier resté dans le dossier quitté (non observé ensuite) laisse ce dossier et son manifeste en place. */
const sansDossiers = ({
  dossiers: _d,
  manifestes: _m,
  ...reste
}: Awaited<ReturnType<typeof bilan>>) => reste;

describe('Pannes d’un cycle, appel par appel (ST-US-017 v0.10.2 §6.7, §8)', () => {
  it.each(SCENARIOS)(
    'UT-COMP-US-017-3-109 $nom : tout appel du transport en 5xx, tour à tour, laisse un échec transitoire (ou un cycle terminé si l’appel est différable) et la reprise converge vers le même état',
    async (scenario) => {
      const sansPanne = await lancer(scenario);
      expect(sansPanne.issue).toBe('TERMINE');
      await reprendre(sansPanne.env, sansPanne.action, sansPanne.acteur);
      const attendu = await bilan(sansPanne.env, sansPanne.acteur);
      const constats = new Constats();

      for (const methode of METHODES_TRANSPORT) {
        const total = sansPanne.appels[methode] ?? 0;
        for (let occurrence = 1; occurrence <= total; occurrence += 1) {
          const cas = `${methode} n°${String(occurrence)}`;
          const erreur = ERREUR('ServeurIndisponible');
          const { issue, env, action, acteur, journal } = await lancer(scenario, {
            cible: 'transport',
            methode,
            occurrence,
            erreur,
          });
          const differe = estDiffere(scenario, methode, occurrence, total);
          constats.egal(`${cas} : issue`, differe ? 'TERMINE' : 'ECHEC_TRANSITOIRE', issue);
          const evenement =
            methode === 'supprimerFichier' ? 'MiseALaCorbeilleDifferee' : 'DossierQuitteConserve';
          constats.egal(
            `${cas} : journal`,
            differe,
            journal.entrees.some((e) => e.evenement === evenement),
          );
          await reprendre(env, action, acteur);
          const apres = await bilan(env, acteur);
          constats.egal(`${cas} : état`, sansDossiers(attendu), sansDossiers(apres));
          if (!differe) constats.egal(`${cas} : dossiers`, attendu, apres);
        }
      }

      expect(constats.ecarts).toEqual([]);
    },
    120_000,
  );

  it.each(SCENARIOS)(
    'UT-COMP-US-017-3-110 $nom : toute lecture ou écriture du dépôt local impossible, tour à tour, laisse un échec transitoire et la reprise converge vers le même état',
    async (scenario) => {
      const sansPanne = await lancer(scenario);
      await reprendre(sansPanne.env, sansPanne.action, sansPanne.acteur);
      const attendu = await bilan(sansPanne.env, sansPanne.acteur);
      const constats = new Constats();

      for (const methode of METHODES_DEPOT) {
        for (let occurrence = 1; occurrence <= (sansPanne.appels[methode] ?? 0); occurrence += 1) {
          const cas = `${methode} n°${String(occurrence)}`;
          const { issue, env, action, acteur } = await lancer(scenario, {
            cible: 'depot',
            methode,
            occurrence,
          });
          constats.egal(`${cas} : issue`, 'ECHEC_TRANSITOIRE', issue);
          await reprendre(env, action, acteur);
          constats.egal(`${cas} : état`, attendu, await bilan(env, acteur));
        }
      }

      expect(constats.ecarts).toEqual([]);
    },
    120_000,
  );

  it('UT-COMP-US-017-3-111 manifeste d’une version plus récente que celle de l’application (RG-058) : cycle et dépôt seul rendent FORMAT_PLUS_RECENT sans rien écrire, action requise mémorisée', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    const { dossier } = await metaDe(env.smartphone);
    if (dossier === undefined) throw new Error('dossier attendu');
    await env.drive.ajouterManifeste(
      PC,
      dossier,
      {
        schemaVersion: 2,
        generation: { type: 'INITIALE' },
      } as unknown as ContenuManifeste,
      instant(DEPART),
    );
    const ecritures = env.drive.ecrituresPar(SMARTPHONE);

    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('FORMAT_PLUS_RECENT');
    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBe('FORMAT_PLUS_RECENT');
    expect(await env.smartphone.cycle.deposerMaintenant()).toBe('FORMAT_PLUS_RECENT');

    expect(env.drive.ecrituresPar(SMARTPHONE)).toBe(ecritures);
  });

  it.each([
    { erreur: { type: 'NonAutorise' }, issue: 'ACCES_REFUSE' },
    { erreur: { type: 'EspaceDrivePlein' }, issue: 'DRIVE_PLEIN' },
    { erreur: { type: 'DriveIndisponible' }, issue: 'ECHEC_TRANSITOIRE' },
    { erreur: { type: 'ReseauIndisponible' }, issue: 'ECHEC_TRANSITOIRE' },
    { erreur: { type: 'JetonChangementsInvalide' }, issue: 'ECHEC_TRANSITOIRE' },
  ] as ReadonlyArray<{ readonly erreur: ErreurTransport; readonly issue: IssueCycle }>)(
    'UT-COMP-US-017-3-112 $erreur.type sur un appel du transport : issue $issue (le jeton refusé retombe sur l’inventaire complet : cycle terminé), la reprise converge vers le même état',
    async ({ erreur, issue: attendue }) => {
      const constats = new Constats();
      for (const scenario of SCENARIOS) {
        const sansPanne = await lancer(scenario);
        await reprendre(sansPanne.env, sansPanne.action, sansPanne.acteur);
        const attendu = await bilan(sansPanne.env, sansPanne.acteur);
        for (const methode of METHODES_TRANSPORT) {
          // Le jeton refusé n'a de sens que pour `changements` (repli sur l'inventaire complet, sans échec).
          if (erreur.type === 'JetonChangementsInvalide' && methode !== 'changements') continue;
          const total = sansPanne.appels[methode] ?? 0;
          for (let occurrence = 1; occurrence <= total; occurrence += 1) {
            const cas = `${scenario.nom} : ${methode} n°${String(occurrence)}`;
            const r = await lancer(scenario, { cible: 'transport', methode, occurrence, erreur });
            const termine =
              estDiffere(scenario, methode, occurrence, total) ||
              erreur.type === 'JetonChangementsInvalide';
            constats.egal(`${cas} : issue`, termine ? 'TERMINE' : attendue, r.issue);
            await reprendre(r.env, r.action, r.acteur);
            constats.egal(
              `${cas} : état`,
              sansDossiers(attendu),
              sansDossiers(await bilan(r.env, r.acteur)),
            );
          }
        }
      }
      expect(constats.ecarts).toEqual([]);
    },
    240_000,
  );

  it.each(SCENARIOS)(
    'UT-COMP-US-017-3-115 $nom : un fichier introuvable à sa lecture (RessourceIntrouvable) est omis à l’observation ; une altération qui en découle n’écrit rien, et dans une écriture monotone d’un manifeste c’est un échec transitoire',
    async (scenario) => {
      const sansPanne = await lancer(scenario);
      const constats = new Constats();
      const lectures = ['lireFichierAppareil', 'lireContenuManifeste', 'lireManifeste'] as const;
      for (const methode of lectures) {
        for (let occurrence = 1; occurrence <= (sansPanne.appels[methode] ?? 0); occurrence += 1) {
          const cas = `${methode} n°${String(occurrence)}`;
          const erreur: ErreurTransport = { type: 'RessourceIntrouvable' };
          const r = await lancer(scenario, { cible: 'transport', methode, occurrence, erreur });
          constats.egal(
            `${cas} : issue`,
            true,
            ['TERMINE', 'DONNEES_ALTEREES', 'ECHEC_TRANSITOIRE'].includes(r.issue),
          );
          if (r.issue === 'DONNEES_ALTEREES') constats.egal(`${cas} : écritures`, 0, r.ecritures);
        }
      }
      expect(constats.ecarts).toEqual([]);
    },
    120_000,
  );
});
