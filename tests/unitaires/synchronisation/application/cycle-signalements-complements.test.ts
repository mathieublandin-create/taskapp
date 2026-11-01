/**
 * Tests complémentaires de la tranche B3 (ST-US-017 v0.7 §6.2, §6.3, §6.6 n° 6, §8 n° 9 et 11), au-delà de
 * UT-US-017-54 à 56 et 108 à 110 : erreurs de lecture des signalements, transaction d'intégration en échec (rien
 * journalisé), « Compris » sur des identifiants répétés et avec une correction d'horloge, `aLire` absent de l'attente.
 */
import { describe, expect, it } from 'vitest';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import { echec, succes } from '@src/commun/domaine/resultat';
import { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import { MarquerCommeLue } from '@src/synchronisation/application/cas-usage/marquer-comme-lue';
import { CycleSynchronisation } from '@src/synchronisation/application/cycle-synchronisation';
import { MasquageRappel } from '@src/synchronisation/application/masquage-rappel';
import type { DepotLocal } from '@src/synchronisation/application/ports/depot-local';
import { consulterEtatSynchronisation } from '@src/synchronisation/application/requetes/consulter-etat-synchronisation';
import { consulterModificationsNonRetenues } from '@src/synchronisation/application/requetes/consulter-modifications-non-retenues';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import type { ValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import { FauxDrive } from '@tests/doublures/faux-drive';
import { HorlogeSimulee } from '@tests/doublures/horloge-simulee';
import { PlanificateurSimule } from '@tests/doublures/planificateur-simule';
import { SourceAleatoireDeterministe } from '@tests/doublures/source-aleatoire-deterministe';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { JournalEnMemoire, ReseauFixe } from '@tests/support/compte/doublures-compte';
import { creerEnvironnement, valeurDe } from '@tests/support/environnement';
import { planVide } from '@tests/support/plans';
import {
  AccesCommandable,
  creerAppareilCycle,
  ReseauCommandable,
  type AppareilCycle,
} from '@tests/support/synchronisation/appareil-cycle';
import {
  deplaceSous,
  h,
  idArbitraire,
  intituleTache,
  objectifCree,
  parentObjectif,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { hlc, idObjectif, idTache, instant, PC, SMARTPHONE } from '@tests/support/valeurs';

const DEPART = '2026-10-21T12:00:00.000Z';
const ILLISIBLE = echec({ type: 'DonneesLocalesIllisibles' } as const);
const IMPOSSIBLE = echec({ type: 'EcritureLocaleImpossible' } as const);

const preparer = () => {
  const temps = new TempsSimule(instant(DEPART));
  const planificateur = new PlanificateurSimule(temps);
  const drive = new FauxDrive(temps);
  const appareil = (appareilId: IdAppareil, prefixe: string) =>
    creerAppareilCycle({ appareilId, prefixe, drive, temps, planificateur });
  /** Cycle de l'appareil `a` sur un dépôt instrumenté qui partage sa base. */
  const cycleSur = (a: AppareilCycle, depot: DepotLocal) => {
    const reseau = new ReseauCommandable();
    const journal = new JournalEnMemoire();
    const cycle = new CycleSynchronisation({
      depot,
      transport: drive.transportPour(a.appareilId, { reseau, accesAccorde: () => true }),
      acces: new AccesCommandable(),
      reseau,
      planificateur,
      aleatoire: new SourceAleatoireDeterministe([500]),
      horloge: new HorlogeSimulee(temps),
      journal,
      versionApplication: '0.1.0',
    });
    return { cycle, journal };
  };
  return { drive, appareil, cycleSur };
};

/** Dépôt qui délègue à `a.depot`, sauf les méthodes remplacées. */
const instrumenter = (a: AppareilCycle, remplace: Partial<DepotLocal>): DepotLocal => ({
  lire: () => a.depot.lire(),
  appliquer: (calcul) => a.depot.appliquer(calcul),
  observer: (rappel) => a.depot.observer(rappel),
  lireMeta: () => a.depot.lireMeta(),
  appliquerSynchronisation: (calcul) => a.depot.appliquerSynchronisation(calcul),
  lireSignalements: () => a.depot.lireSignalements(),
  ...remplace,
});

/** Fichier incohérent du PC (UT-US-017-109) : deux déplacements en cycle, sans entrée de journal. */
const deposerFichierIncoherent = async (drive: FauxDrive) => {
  const transport = drive.transportPour(PC, {
    reseau: new ReseauCommandable(),
    accesAccorde: () => true,
  });
  const dossier = valeurDe(await transport.preparerDossier());
  const alpha = idObjectif(1);
  const beta = idObjectif(2);
  const contenu: ContenuFichierAppareil = {
    schemaVersion: 1,
    versionApplication: '0.1.0',
    generation: { type: 'INITIALE' },
    appareil: PC,
    registres: [
      ...objectifCree(alpha, 'Alpha', h(0, PC)),
      ...objectifCree(beta, 'Bêta', h(0, PC, 1)),
      parentObjectif(alpha, deplaceSous(beta, h(1, PC)), h(1, PC)),
      parentObjectif(beta, deplaceSous(alpha, h(2, PC)), h(2, PC)),
    ],
    journal: [],
  };
  valeurDe(await transport.deposerFichierAppareil({ dossier, contenu }));
};

const T1 = idTache(1);
const entree = (n: number): ValeurEcartee => ({
  id: idArbitraire(n),
  motif: 'CONFLIT',
  ecartee: intituleTache(T1, 'A', h(1, PC)),
  gagnante: intituleTache(T1, 'B', h(2, SMARTPHONE), { [PC]: h(0, PC) }),
});

describe('Tranche B3, compléments (ST-US-017 v0.7)', () => {
  it('UT-COMP-US-017-2-30 signalements illisibles au début du cycle : échec transitoire consigné, rien déposé', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    const { cycle, journal } = env.cycleSur(
      smartphone,
      instrumenter(smartphone, { lireSignalements: () => Promise.resolve(ILLISIBLE) }),
    );

    expect(await cycle.synchroniserMaintenant()).toBe('ECHEC_TRANSITOIRE');
    expect(journal.entrees).toEqual([
      {
        niveau: 'avertissement',
        evenement: 'SynchronisationEchec',
        champs: { cause: 'DonneesLocalesIllisibles' },
      },
    ]);
    expect(env.drive.fichiers().filter((f) => f.appProperties['donejuan'] === 'appareil')).toEqual(
      [],
    );
  });

  it('UT-COMP-US-017-2-31 transaction d’intégration en échec (§8 n° 11) : erreur rendue, aucune entrée « ReparationSansEntreeDeplacement »', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    await deposerFichierIncoherent(env.drive);
    let tentatives = 0;
    const { cycle, journal } = env.cycleSur(
      smartphone,
      instrumenter(smartphone, {
        appliquerSynchronisation: (calcul) => {
          // La méta du dossier est mémorisée (1re transaction) ; l'intégration échoue (2e).
          tentatives += 1;
          return tentatives === 1
            ? smartphone.depot.appliquerSynchronisation(calcul)
            : Promise.resolve(IMPOSSIBLE);
        },
      }),
    );

    expect(await cycle.synchroniserMaintenant()).toBe('ECHEC_TRANSITOIRE');
    expect(tentatives).toBe(2);
    expect(journal.entrees.map((e) => e.evenement)).toEqual(['SynchronisationEchec']);
    // Rien n'a été intégré : la hiérarchie locale ne connaît pas les objectifs du PC.
    expect(valeurDe(await smartphone.service.lire()).objectifs.size).toBe(0);
  });

  it('UT-COMP-US-017-2-32 consulterModificationsNonRetenues : signalements illisibles, erreur rendue telle quelle', async () => {
    const env = creerEnvironnement(DEPART);
    const etat = valeurDe(await env.depot.lire());
    expect(
      await consulterModificationsNonRetenues({
        lire: () => Promise.resolve(succes(etat)),
        lireSignalements: () => Promise.resolve(ILLISIBLE),
      }),
    ).toEqual(ILLISIBLE);
  });

  it('UT-COMP-US-017-2-33 MarquerCommeLue : identifiant répété, une seule lecture ; HLC daté de l’heure corrigée de l’écart avec Google', async () => {
    const env = creerEnvironnement(DEPART);
    const correction = EcartTemps.depuisMillisecondes(5_000);
    valeurDe(
      await env.depot.appliquerSynchronisation((etat) => ({
        plan: { ...planVide(etat), etatApres: { ...etat, correctionHorloge: correction } },
        meta: {},
        signalements: { valeursEcartees: [entree(1)], lectures: [] },
      })),
    );
    const marquer = new MarquerCommeLue({
      depot: env.depot,
      horloge: new HorlogeSimulee(env.temps),
    });

    valeurDe(await marquer.executer([idArbitraire(1), idArbitraire(1)]));

    const attendu = hlc('2026-10-21T12:00:05.000Z', 0, SMARTPHONE);
    expect([...valeurDe(await env.depot.lireSignalements()).lectures.values()]).toEqual([
      { id: idArbitraire(1), hlc: attendu },
    ]);
    expect(valeurDe(await env.depot.lire()).dernierHlc).toEqual(attendu);
  });

  it('UT-COMP-US-017-2-34 consulterEtatSynchronisation : aLire absent de l’attente ≡ 0, l’état du moteur n’en est plus la source (DT-025) ; action requise recopiée', async () => {
    const lu = await consulterEtatSynchronisation({
      reseau: new ReseauFixe(true),
      acces: {
        etat: () => 'VALIDE',
        signalerRefus: () => Promise.resolve('VALIDE'),
        observer: () => () => undefined,
      },
      suivi: {
        etatMoteur: () => ({ cycle: 'REPOS', actionRequise: 'DRIVE_PLEIN', aLire: 7 }),
      },
      masquage: new MasquageRappel(),
      attente: () => Promise.resolve({ enAttente: 0 }),
    });
    expect(lu).toMatchObject({ aLire: 0, actionRequise: 'DRIVE_PLEIN' });
  });
});
