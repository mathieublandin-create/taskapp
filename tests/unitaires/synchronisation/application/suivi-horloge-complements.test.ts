/**
 * Compléments de Bruce à UT-US-017-80 à 83 (ST-US-017 v0.11 §6.8 n° 1 à 3 et 5 ; rang 11, tranche H3) : échecs du
 * dépôt (jamais d'exception, journal), file des traitements, idempotence de `demarrer` et `arreter`, bornes du recul à
 * l'ouverture, et observateur de `ClientGoogle` qui ne change pas le résultat de la requête.
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { EchangeGoogle } from '@src/commun/application/ports/observateur-echanges-google';
import { echec } from '@src/commun/domaine/resultat';
import { ClientGoogle } from '@src/infrastructure-google/client-google';
import type { DependancesSuiviHorloge } from '@src/synchronisation/application/suivi-horloge';
import { SuiviHorloge } from '@src/synchronisation/application/suivi-horloge';
import { medianeCorrection } from '@src/synchronisation/domaine/correction-horloge';
import {
  NOMBRE_MESURES_HORLOGE,
  PERIODE_CONTROLE_SAUT_HORLOGE,
  SEUIL_SAUT_HORLOGE,
} from '@src/synchronisation/domaine/parametres-synchronisation';
import { HorlogeSimulee } from '@tests/doublures/horloge-simulee';
import { PlanificateurSimule } from '@tests/doublures/planificateur-simule';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { JournalEnMemoire } from '@tests/support/compte/doublures-compte';
import { creerEnvironnement, valeurDe, type Environnement } from '@tests/support/environnement';
import { planVide } from '@tests/support/plans';
import { ecart, HEURE, hlc, instant, MINUTE, SMARTPHONE } from '@tests/support/valeurs';

const DEPART = '2026-10-21T08:00:00.000Z';

type Depot = DependancesSuiviHorloge['depot'];

const dateHttp = (env: Environnement, decalageMs = 0): string =>
  new Date(Math.floor((env.temps.maintenant() + decalageMs) / 1000) * 1000).toUTCString();

const preparer = (adapter: (depot: Depot) => Depot = (d) => d) => {
  const env = creerEnvironnement(DEPART);
  const planificateur = new PlanificateurSimule(env.temps);
  const journal = new JournalEnMemoire();
  const suivi = new SuiviHorloge({
    depot: adapter(env.depot),
    horloge: env.horloge,
    planificateur,
    journal,
  });
  const echange = (decalageMs = 0): EchangeGoogle => ({
    envoiMonotone: env.horloge.monotone(),
    receptionMonotone: env.horloge.monotone(),
    envoiMurale: env.horloge.maintenant(),
    date: dateHttp(env, decalageMs),
  });
  const correction = async () => valeurDe(await env.depot.lire()).correctionHorloge;
  const mesures = async () => valeurDe(await env.depot.lireMeta()).mesuresHorloge ?? [];
  return { env, planificateur, journal, suivi, echange, correction, mesures };
};

const NON_ECRITE = (erreur: string) => ({
  niveau: 'avertissement',
  evenement: 'CorrectionHorlogeNonEcrite',
  champs: { erreur },
});

describe('SuiviHorloge — échecs du dépôt (n° 2)', () => {
  it('UT-COMP-US-017-4-31 transaction en échec : journal « avertissement » CorrectionHorlogeNonEcrite (type de l’erreur), correction inchangée, aucune exception ; le suivi continue', async () => {
    let echouer = true;
    const c = preparer((depot) => ({
      lire: () => depot.lire(),
      lireMeta: () => depot.lireMeta(),
      appliquerSynchronisation: (calcul) =>
        echouer
          ? Promise.resolve(echec({ type: 'EcritureLocaleImpossible' }))
          : depot.appliquerSynchronisation(calcul),
    }));
    c.env.horloge.dereglerDe(ecart(-HEURE));
    c.suivi.demarrer();
    c.suivi.surReponse(c.echange());
    await c.suivi.traitementsTermines();
    expect(c.journal.entrees).toEqual([NON_ECRITE('EcritureLocaleImpossible')]);
    expect(await c.correction()).toBe(0);
    expect(await c.mesures()).toEqual([]);

    echouer = false;
    c.suivi.surReponse(c.echange());
    await c.suivi.traitementsTermines();
    expect(await c.correction()).toBe(HEURE);
  });

  it('UT-COMP-US-017-4-32 dépôt qui lève (lecture à l’ouverture, transaction) : rien ne sort de surReponse, controlerSaut ni traitementsTermines ; journal, puis les traitements suivants s’exécutent', async () => {
    let lever = true;
    const c = preparer((depot) => ({
      lire: () => (lever ? Promise.reject(new TypeError('base fermée')) : depot.lire()),
      lireMeta: () => depot.lireMeta(),
      appliquerSynchronisation: (calcul) =>
        lever ? Promise.reject(new RangeError('panne')) : depot.appliquerSynchronisation(calcul),
    }));
    c.env.horloge.dereglerDe(ecart(-HEURE));
    c.suivi.demarrer();
    c.suivi.surReponse(c.echange());
    c.env.horloge.changerHeureMurale(ecart(-MINUTE));
    await expect(c.suivi.controlerSaut()).resolves.toBeUndefined();
    // Le saut est qualifié et consigné à l'appel ; les traitements de la file s'exécutent ensuite, dans l'ordre.
    expect(c.journal.entrees).toEqual([
      { niveau: 'info', evenement: 'SautHorloge', champs: { sens: 'RECUL', ecartMs: MINUTE } },
      NON_ECRITE('TypeError'),
      NON_ECRITE('RangeError'),
      NON_ECRITE('RangeError'),
    ]);

    lever = false;
    c.suivi.surReponse(c.echange());
    await c.suivi.traitementsTermines();
    expect(await c.mesures()).toEqual([HEURE + MINUTE]);
  });

  it('UT-COMP-US-017-4-37 lecture en échec à l’ouverture : rien de consigné ; rejet qui n’est pas une Error : erreur « inconnue »', async () => {
    const c = preparer((depot) => ({
      lire: () => Promise.resolve(echec({ type: 'DonneesLocalesIllisibles' })),
      lireMeta: () => depot.lireMeta(),
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- rejet hors Error simulé
      appliquerSynchronisation: () => Promise.reject('panne'),
    }));
    c.suivi.demarrer();
    await c.suivi.traitementsTermines();
    expect(c.journal.entrees).toEqual([]);
    c.suivi.surReponse(c.echange());
    await c.suivi.traitementsTermines();
    expect(c.journal.entrees).toEqual([NON_ECRITE('inconnue')]);
  });
});

describe('SuiviHorloge — file, cycle de vie, ouverture (n° 2, n° 3, n° 5)', () => {
  it('UT-COMP-US-017-4-33 propriété : des réponses reçues sans attendre sont écrites une à une, dans l’ordre d’arrivée (mesures = les 5 dernières, correction = leur médiane)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: -48, max: 48 }), { minLength: 1, maxLength: 12 }),
        async (heures) => {
          const c = preparer();
          c.suivi.demarrer();
          for (const h of heures) c.suivi.surReponse(c.echange(h * HEURE));
          await c.suivi.traitementsTermines();
          const attendues = heures.slice(-NOMBRE_MESURES_HORLOGE).map((h) => h * HEURE);
          expect(await c.mesures()).toEqual(attendues);
          expect(await c.correction()).toBe(medianeCorrection(attendues.map((m) => ecart(m))));
        },
      ),
      { numRuns: 15 },
    );
  });

  it('UT-COMP-US-017-4-34 demarrer et arreter idempotents : une seule période armée ; controlerSaut sans effet avant demarrer et après arreter ; redémarré, le repère repart du point courant', async () => {
    const c = preparer();
    c.env.horloge.changerHeureMurale(ecart(-HEURE));
    await c.suivi.controlerSaut();
    expect(c.journal.entrees).toEqual([]);

    c.suivi.demarrer();
    c.suivi.demarrer();
    c.env.horloge.changerHeureMurale(ecart(-10 * MINUTE));
    c.env.temps.avancer(PERIODE_CONTROLE_SAUT_HORLOGE);
    c.planificateur.executerEchus();
    await c.suivi.traitementsTermines();
    expect(c.journal.entrees).toHaveLength(1);
    expect(await c.correction()).toBe(10 * MINUTE);

    c.suivi.arreter();
    c.suivi.arreter();
    expect(c.planificateur.prochaineEcheance()).toBeUndefined();
    c.env.horloge.changerHeureMurale(ecart(-HEURE));
    await c.suivi.controlerSaut();
    expect(c.journal.entrees).toHaveLength(1);

    c.suivi.demarrer();
    await c.suivi.controlerSaut();
    expect(c.journal.entrees).toHaveLength(1);
    expect(await c.correction()).toBe(10 * MINUTE);
  });

  it('UT-COMP-US-017-4-35 recul à l’ouverture : rien à SEUIL_SAUT_HORLOGE exactement ni sans dernier HLC ; la correction compte (heure corrigée = maintenant + correction)', async () => {
    const ouvrir = async (p: { readonly hlcIso?: string; readonly correction: number }) => {
      const c = preparer();
      valeurDe(
        await c.env.depot.appliquerSynchronisation((etat) => ({
          plan: {
            ...planVide(etat),
            etatApres: {
              ...etat,
              correctionHorloge: ecart(p.correction),
              ...(p.hlcIso === undefined ? {} : { dernierHlc: hlc(p.hlcIso, 0, SMARTPHONE) }),
            },
          },
          meta: {},
        })),
      );
      c.suivi.demarrer();
      await c.suivi.traitementsTermines();
      return c.journal.entrees;
    };
    const auSeuil = new Date(instant(DEPART) + SEUIL_SAUT_HORLOGE).toISOString();
    const justeAuDela = new Date(instant(DEPART) + SEUIL_SAUT_HORLOGE + 1).toISOString();
    expect(await ouvrir({ correction: 0 })).toEqual([]);
    expect(await ouvrir({ hlcIso: auSeuil, correction: 0 })).toEqual([]);
    expect(await ouvrir({ hlcIso: justeAuDela, correction: 0 })).toEqual([
      {
        niveau: 'info',
        evenement: 'ReculHorlogeOuverture',
        champs: { ecartMs: SEUIL_SAUT_HORLOGE + 1 },
      },
    ]);
    expect(await ouvrir({ hlcIso: '2026-10-21T09:00:00.000Z', correction: HEURE })).toEqual([]);
  });
});

describe('ClientGoogle — observateur (n° 1)', () => {
  it('UT-COMP-US-017-4-36 horloge sans observateur, ou observateur sans horloge : aucune mesure, requête inchangée ; la réponse rendue ne dépend pas de l’observateur', async () => {
    const temps = new TempsSimule(instant(DEPART));
    const horloge = new HorlogeSimulee(temps);
    const recus: Array<EchangeGoogle> = [];
    const reponse = () =>
      Promise.resolve(
        new Response('{"id":"x"}', {
          status: 200,
          headers: { Date: 'Wed, 21 Oct 2026 08:00:00 GMT', 'Content-Type': 'application/json' },
        }),
      );
    const requete = { methode: 'GET', url: 'https://www.googleapis.com/drive/v3/about' } as const;
    const base = { lireJeton: () => 'jeton', fetch: reponse };
    const attendu = await new ClientGoogle(base).executer(requete);
    expect(await new ClientGoogle({ ...base, horloge }).executer(requete)).toEqual(attendu);
    expect(
      await new ClientGoogle({
        ...base,
        observateur: { surReponse: (e) => recus.push(e) },
      }).executer(requete),
    ).toEqual(attendu);
    expect(recus).toEqual([]);
    expect(
      await new ClientGoogle({
        ...base,
        horloge,
        observateur: { surReponse: (e) => recus.push(e) },
      }).executer(requete),
    ).toEqual(attendu);
    expect(recus).toHaveLength(1);

    const sansJeton = new ClientGoogle({
      ...base,
      lireJeton: () => undefined,
      horloge,
      observateur: { surReponse: (e) => recus.push(e) },
    });
    expect((await sansJeton.executer(requete)).ok).toBe(false);
    expect(recus).toHaveLength(1);
  });
});
