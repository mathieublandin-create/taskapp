/**
 * Suivi de l'horloge d'un espace (ST-US-017 v0.11 §6.8 n° 1 à 5 ; DAT v0.11.3 §6.4 ; RL-LOT-001-A7) : mesures prises
 * sur les réponses de Google, médiane écrite dans l'état local (correctionHorloge) et la méta (mesuresHorloge), sauts
 * de l'horloge murale détectés chaque minute et au retour au premier plan. UT-US-017-80 à 82 (rang 11, tranche H3).
 */
import { describe, expect, it } from 'vitest';
import type { EchangeGoogle } from '@src/commun/application/ports/observateur-echanges-google';
import { SuiviHorloge } from '@src/synchronisation/application/suivi-horloge';
import { PERIODE_CONTROLE_SAUT_HORLOGE } from '@src/synchronisation/domaine/parametres-synchronisation';
import { PlanificateurSimule } from '@tests/doublures/planificateur-simule';
import { JournalEnMemoire } from '@tests/support/compte/doublures-compte';
import {
  appliquerModifications,
  creerEnvironnement,
  valeurDe,
  type Environnement,
} from '@tests/support/environnement';
import { creationObjectif } from '@tests/support/modifications';
import { planVide } from '@tests/support/plans';
import { ecart, HEURE, hlc, idObjectif, instant, MINUTE, SMARTPHONE } from '@tests/support/valeurs';

const DEPART = '2026-10-21T08:00:00.000Z';
const T = instant(DEPART);

/** En-tête `Date` de l'heure vraie du banc (à la seconde). */
const dateHttp = (env: Environnement): string =>
  new Date(Math.floor(env.temps.maintenant() / 1000) * 1000).toUTCString();

const preparer = () => {
  const env = creerEnvironnement(DEPART);
  const planificateur = new PlanificateurSimule(env.temps);
  const journal = new JournalEnMemoire();
  const suivi = new SuiviHorloge({
    depot: env.depot,
    horloge: env.horloge,
    planificateur,
    journal,
  });
  /** Réponse de Google reçue `aller` ms après l'envoi (temps du banc avancé d'autant). */
  const repondre = async (p: { readonly aller?: number; readonly date?: string | null } = {}) => {
    const envoi = { monotone: env.horloge.monotone(), murale: env.horloge.maintenant() };
    if ((p.aller ?? 0) > 0) env.temps.avancer(ecart(p.aller ?? 0));
    const echange: EchangeGoogle = {
      envoiMonotone: envoi.monotone,
      receptionMonotone: env.horloge.monotone(),
      envoiMurale: envoi.murale,
      date: p.date === null ? undefined : (p.date ?? dateHttp(env)),
    };
    suivi.surReponse(echange);
    await suivi.traitementsTermines();
  };
  const uneMinutePlusTard = async () => {
    env.temps.avancer(PERIODE_CONTROLE_SAUT_HORLOGE);
    planificateur.executerEchus();
    await suivi.traitementsTermines();
  };
  const correction = async () => valeurDe(await env.depot.lire()).correctionHorloge;
  const mesures = async () => valeurDe(await env.depot.lireMeta()).mesuresHorloge ?? [];
  const version = async () => valeurDe(await env.depot.lire()).version;
  return {
    env,
    planificateur,
    journal,
    suivi,
    repondre,
    uneMinutePlusTard,
    correction,
    mesures,
    version,
  };
};

describe('Mesures sur les réponses de Google (n° 1, n° 2)', () => {
  it('UT-US-017-80 une réponse datée à moins de 3 s d’aller-retour donne une mesure ; la médiane est écrite (version + 1, observateurs) ; sans Date lisible ou au-delà de 3 s, rien ; ignorée avant demarrer et après arreter', async () => {
    const c = preparer();
    c.env.horloge.dereglerDe(ecart(-25 * HEURE));
    let notifications = 0;
    c.env.depot.observer(() => {
      notifications += 1;
    });

    await c.repondre();
    expect(await c.mesures()).toEqual([]);
    expect(notifications).toBe(0);

    c.suivi.demarrer();
    await c.repondre({ date: null });
    await c.repondre({ date: 'pas une date' });
    await c.repondre({ aller: 3_000 });
    expect(await c.mesures()).toEqual([]);
    expect(await c.correction()).toBe(0);

    await c.repondre({ aller: 0 });
    expect(await c.mesures()).toEqual([25 * HEURE]);
    expect(await c.correction()).toBe(25 * HEURE);
    expect(await c.version()).toBe(1);
    expect(notifications).toBe(1);

    c.suivi.arreter();
    c.env.horloge.dereglerDe(ecart(10 * HEURE));
    await c.repondre();
    expect(await c.mesures()).toEqual([25 * HEURE]);
  });

  it('UT-US-017-80 lissage : seules les 5 dernières mesures comptent, une réponse retardée ne déplace pas la médiane ; une médiane inchangée ne change pas la version mais les mesures sont gardées', async () => {
    const c = preparer();
    c.suivi.demarrer();
    for (let i = 0; i < 5; i += 1) await c.repondre();
    expect(await c.mesures()).toEqual([0, 0, 0, 0, 0]);
    expect(await c.correction()).toBe(0);
    expect(await c.version()).toBe(0);

    // Réponse retardée : la date est celle de l'envoi, l'aller-retour de 2 s (mesure : −1 s).
    const envoi = { monotone: c.env.horloge.monotone(), murale: c.env.horloge.maintenant() };
    const dateEnvoi = dateHttp(c.env);
    c.env.temps.avancer(ecart(2_000));
    c.suivi.surReponse({
      envoiMonotone: envoi.monotone,
      receptionMonotone: c.env.horloge.monotone(),
      envoiMurale: envoi.murale,
      date: dateEnvoi,
    });
    await c.suivi.traitementsTermines();
    expect(await c.mesures()).toEqual([0, 0, 0, 0, -1_000]);
    expect(await c.correction()).toBe(0);

    c.env.horloge.dereglerDe(ecart(-25 * HEURE));
    await c.repondre();
    await c.repondre();
    expect(await c.correction()).toBe(0);
    await c.repondre();
    expect(await c.mesures()).toHaveLength(5);
    expect(await c.correction()).toBe(25 * HEURE);
  });
});

describe('Sauts de l’horloge murale (n° 3)', () => {
  it('UT-US-017-81 contrôle chaque minute : un recul est corrigé exactement (correction et mesures décalées, journal « info ») ; une avance n’est jamais corrigée (journal seulement) ; à 2 s près, rien', async () => {
    const c = preparer();
    c.suivi.demarrer();
    await c.repondre();
    await c.repondre();
    expect(await c.mesures()).toEqual([0, 0]);

    c.env.horloge.changerHeureMurale(ecart(-10 * MINUTE));
    await c.uneMinutePlusTard();
    expect(await c.correction()).toBe(10 * MINUTE);
    expect(await c.mesures()).toEqual([10 * MINUTE, 10 * MINUTE]);
    expect(c.journal.entrees).toContainEqual({
      niveau: 'info',
      evenement: 'SautHorloge',
      champs: { sens: 'RECUL', ecartMs: 10 * MINUTE },
    });

    c.env.horloge.changerHeureMurale(ecart(HEURE));
    await c.uneMinutePlusTard();
    expect(await c.correction()).toBe(10 * MINUTE);
    expect(await c.mesures()).toEqual([10 * MINUTE, 10 * MINUTE]);
    expect(c.journal.entrees).toContainEqual({
      niveau: 'info',
      evenement: 'SautHorloge',
      champs: { sens: 'AVANCE', ecartMs: HEURE },
    });

    const entrees = c.journal.entrees.length;
    c.env.horloge.changerHeureMurale(ecart(-2_000));
    await c.uneMinutePlusTard();
    expect(await c.correction()).toBe(10 * MINUTE);
    expect(c.journal.entrees).toHaveLength(entrees);
  });

  it('UT-US-017-81 retour au premier plan : controlerSaut détecte le recul sans attendre la minute ; arreter désarme la période', async () => {
    const c = preparer();
    c.suivi.demarrer();
    c.env.horloge.changerHeureMurale(ecart(-25 * HEURE));
    await c.suivi.controlerSaut();
    expect(await c.correction()).toBe(25 * HEURE);

    c.suivi.arreter();
    c.env.horloge.changerHeureMurale(ecart(-HEURE));
    await c.uneMinutePlusTard();
    expect(await c.correction()).toBe(25 * HEURE);
  });
});

describe('Effets de la correction (n° 4, n° 5)', () => {
  it('UT-US-017-82 l’HLC d’une écriture suit l’heure de Google une fois l’écart mesuré (appareil en retard de 25 h) ; un recul de l’horloge à l’ouverture est consigné', async () => {
    const c = preparer();
    c.env.horloge.dereglerDe(ecart(-25 * HEURE));
    c.suivi.demarrer();
    await c.repondre();
    valeurDe(
      await appliquerModifications(c.env.service, (_etat, contexte) => [
        creationObjectif({ id: idObjectif(1), intitule: 'Publier le guide' }, contexte.instant),
      ]),
    );
    expect(valeurDe(await c.env.depot.lire()).dernierHlc?.physique).toBe(T);

    // Ouverture d'un espace dont le dernier HLC est une heure dans le futur de l'heure corrigée.
    const d = preparer();
    valeurDe(
      await d.env.depot.appliquerSynchronisation((etat) => ({
        plan: {
          ...planVide(etat),
          etatApres: { ...etat, dernierHlc: hlc('2026-10-21T09:00:00.000Z', 0, SMARTPHONE) },
        },
        meta: {},
      })),
    );
    d.suivi.demarrer();
    await d.suivi.traitementsTermines();
    expect(d.journal.entrees).toContainEqual({
      niveau: 'info',
      evenement: 'ReculHorlogeOuverture',
      champs: { ecartMs: HEURE },
    });
  });
});
