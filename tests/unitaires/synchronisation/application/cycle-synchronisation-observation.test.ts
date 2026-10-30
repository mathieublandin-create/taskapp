/**
 * ANO-001 (ST-US-017 v0.4.3 §6.9) : CycleSynchronisation notifie ses observateurs au début et à la fin de chaque
 * exécution, pour que l'indicateur et la feuille ECR-011 suivent un cycle mené sans geste (US-017 CA-3, CA-7).
 * UT-US-017-90 à 94, sur DepotLocalDexie (fake-indexeddb), FauxDrive et PlanificateurSimule.
 */
import { describe, expect, it } from 'vitest';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import { CycleSynchronisation } from '@src/synchronisation/application/cycle-synchronisation';
import type { EtatMoteur } from '@src/synchronisation/application/ports/suivi-cycle';
import type { TransportSynchro } from '@src/synchronisation/application/ports/transport-synchro';
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
import { ecart, idObjectif, instant, MINUTE, SMARTPHONE } from '@tests/support/valeurs';

const preparer = () => {
  const temps = new TempsSimule(instant('2026-10-21T08:00:00.000Z'));
  const planificateur = new PlanificateurSimule(temps);
  const drive = new FauxDrive(temps);
  const appareil = (appareilId: IdAppareil, prefixe: string) =>
    creerAppareilCycle({ appareilId, prefixe, drive, temps, planificateur });
  const avancer = async (ms: number, a: AppareilCycle) => {
    temps.avancer(ecart(ms));
    planificateur.executerEchus();
    await (a.cycle.cycleEnCours() ?? Promise.resolve(undefined));
  };
  return { temps, planificateur, drive, appareil, avancer };
};

type Notification = EtatMoteur & { readonly enCours: boolean };

/** Enregistre, à chaque notification, l'état du moteur et la présence d'un cycle en cours, lus à cet instant. */
const espionner = (cycle: CycleSynchronisation) => {
  const notifications: Array<Notification> = [];
  const annuler = cycle.observer(() => {
    notifications.push({ ...cycle.etatMoteur(), enCours: cycle.cycleEnCours() !== undefined });
  });
  return { notifications, annuler };
};

const creer = (a: AppareilCycle, n: number) =>
  appliquerModifications(a.service, (_etat, contexte) => [
    creationObjectif({ id: idObjectif(n), intitule: `Objectif ${String(n)}` }, contexte.instant),
  ]);
const enAttente = async (a: AppareilCycle) =>
  valeurDe(await a.service.lireDecompteEnAttente()).nombre;

describe('CycleSynchronisation.observer (ANO-001, ST-US-017 v0.4.3 §6.9)', () => {
  it('UT-US-017-90 synchroniserMaintenant réussi — deux notifications : EN_COURS au début, REPOS à la fin, cycle terminé et dépôt fait', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    await creer(smartphone, 1);
    const { notifications } = espionner(smartphone.cycle);
    let attenteALaFin: Promise<number> | undefined;
    smartphone.cycle.observer(() => {
      if (smartphone.cycle.cycleEnCours() === undefined) attenteALaFin = enAttente(smartphone);
    });

    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');

    expect(notifications).toEqual([
      { cycle: 'EN_COURS', aLire: 0, enCours: true },
      { cycle: 'REPOS', aLire: 0, enCours: false },
    ]);
    expect(await attenteALaFin).toBe(0);
  });

  it('UT-US-017-91 demande pendant un cycle — DEJA_EN_COURS ne notifie pas ; la relance appartient à la même exécution : deux notifications en tout', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    await creer(smartphone, 1);
    const { notifications } = espionner(smartphone.cycle);

    const premier = smartphone.cycle.synchroniserMaintenant();
    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('DEJA_EN_COURS');
    expect(await premier).toBe('TERMINE');

    expect(notifications.map((n) => n.cycle)).toEqual(['EN_COURS', 'REPOS']);
    expect(notifications.at(-1)?.enCours).toBe(false);
  });

  it('UT-US-017-92 échecs — la fin est notifiée avec l’état final : RETENTATIVE, ECHEC_PERSISTANT, DRIVE_PLEIN, refus d’accès, exception', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    await creer(smartphone, 1);
    const { notifications } = espionner(smartphone.cycle);

    env.drive.indisponible('toujours');
    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('ECHEC_TRANSITOIRE');
    expect(notifications.at(-1)).toEqual({ cycle: 'RETENTATIVE', aLire: 0, enCours: false });
    // Reprises programmées (sans geste) : chacune notifie sa fin ; la 3e porte l'action requise.
    for (let i = 0; i < 3; i += 1) await env.avancer(5 * MINUTE, smartphone);
    expect(notifications.at(-1)).toMatchObject({
      actionRequise: 'ECHEC_PERSISTANT',
      enCours: false,
    });
    env.drive.retablir();
    smartphone.cycle.arreter();

    env.drive.plein();
    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('DRIVE_PLEIN');
    expect(notifications.at(-1)).toEqual({
      cycle: 'REPOS',
      actionRequise: 'DRIVE_PLEIN',
      aLire: 0,
      enCours: false,
    });
    env.drive.liberer();

    smartphone.autorisationGoogle.accordee = false;
    const avantRefus = notifications.length;
    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('ACCES_REFUSE');
    expect(notifications.length).toBe(avantRefus + 2);
    expect(notifications.at(-1)).toMatchObject({ cycle: 'REPOS', enCours: false });
  });

  it('UT-US-017-92 exception levée pendant le cycle — la fin est notifiée (REPOS) avant la propagation de l’exception', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    const panne = new Error('panne inattendue');
    const transport: TransportSynchro = {
      ...env.drive.transportPour(SMARTPHONE, {
        reseau: smartphone.reseau,
        accesAccorde: () => true,
      }),
      preparerDossier: () => Promise.reject(panne),
    };
    const cycle = new CycleSynchronisation({
      depot: smartphone.depot,
      transport,
      acces: new AccesCommandable(),
      reseau: new ReseauCommandable(),
      planificateur: env.planificateur,
      aleatoire: new SourceAleatoireDeterministe([500]),
      horloge: new HorlogeSimulee(env.temps),
      journal: new JournalEnMemoire(),
      versionApplication: '0.1.0',
    });
    const { notifications } = espionner(cycle);

    await expect(cycle.synchroniserMaintenant()).rejects.toBe(panne);

    expect(notifications).toEqual([
      { cycle: 'EN_COURS', aLire: 0, enCours: true },
      { cycle: 'REPOS', aLire: 0, enCours: false },
    ]);
  });

  it('UT-US-017-93 sans exécution, pas de notification (hors ligne, sans accès) ; deposerMaintenant notifie ; plusieurs observateurs ; annulation', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    await creer(smartphone, 1);
    const premier = espionner(smartphone.cycle);
    const second = espionner(smartphone.cycle);

    smartphone.reseau.changer(false);
    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('NON_LANCE_HORS_LIGNE');
    smartphone.reseau.changer(true);
    smartphone.acces.changer('A_RENOUVELER');
    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('NON_LANCE_SANS_ACCES');
    smartphone.acces.changer('VALIDE');
    expect(premier.notifications).toEqual([]);

    expect(await smartphone.cycle.deposerMaintenant()).toBe('TERMINE');
    expect(premier.notifications.map((n) => n.cycle)).toEqual(['EN_COURS', 'REPOS']);
    expect(second.notifications).toEqual(premier.notifications);

    premier.annuler();
    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(premier.notifications).toHaveLength(2);
    expect(second.notifications).toHaveLength(4);
  });

  it('UT-US-017-94 cycles sans geste (5 s après une modification, toutes les 2 min) — leur fin est notifiée, modification déposée', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    const { notifications } = espionner(smartphone.cycle);
    smartphone.cycle.demarrer();

    await creer(smartphone, 1);
    await env.avancer(5_000, smartphone);
    expect(notifications.map((n) => n.cycle)).toEqual(['EN_COURS', 'REPOS']);
    expect(await enAttente(smartphone)).toBe(0);

    await env.avancer(2 * MINUTE, smartphone);
    expect(notifications.map((n) => n.cycle)).toEqual(['EN_COURS', 'REPOS', 'EN_COURS', 'REPOS']);
    expect(notifications.at(-1)?.enCours).toBe(false);
  });
});
