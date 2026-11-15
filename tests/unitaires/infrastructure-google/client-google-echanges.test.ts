/**
 * Point de mesure de l'horloge (ST-US-017 v0.11 §6.8 n° 1 ; RL-LOT-001-A7) : `ClientGoogle` signale chaque réponse
 * HTTP de Google à l'observateur, avec les instants de l'appareil et l'en-tête `Date`. UT-US-017-83 (rang 11, H3).
 */
import { describe, expect, it } from 'vitest';
import type { EchangeGoogle } from '@src/commun/application/ports/observateur-echanges-google';
import { ClientGoogle } from '@src/infrastructure-google/client-google';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { HorlogeSimulee } from '@tests/doublures/horloge-simulee';
import { ecart, HEURE, instant } from '@tests/support/valeurs';

const DATE = 'Wed, 21 Oct 2026 08:00:01 GMT';

const preparer = (reponse: () => Response) => {
  const temps = new TempsSimule(instant('2026-10-21T08:00:00.000Z'));
  const horloge = new HorlogeSimulee(temps);
  horloge.dereglerDe(ecart(-25 * HEURE));
  const recus: Array<EchangeGoogle> = [];
  const fetchSimule = (): Promise<Response> => {
    temps.avancer(ecart(1_200));
    return Promise.resolve(reponse());
  };
  const client = new ClientGoogle({
    lireJeton: () => 'jeton',
    fetch: fetchSimule,
    horloge,
    observateur: {
      surReponse: (e) => {
        recus.push(e);
      },
    },
  });
  return { client, recus, horloge };
};

const requete = { methode: 'GET', url: 'https://www.googleapis.com/drive/v3/about' } as const;

describe('ClientGoogle — observateur des échanges (ST-US-017 v0.11 §6.8 n° 1)', () => {
  it('UT-US-017-83 réponse réussie ou en erreur : un échange signalé, instants d’envoi (murale, monotone) et de réception (monotone), en-tête Date tel quel ; requête sans réponse : rien ; sans observateur : inchangé', async () => {
    const ok = preparer(
      () =>
        new Response('{}', {
          status: 200,
          headers: { Date: DATE, 'Content-Type': 'application/json' },
        }),
    );
    const monotoneAvant = ok.horloge.monotone();
    const lu = await ok.client.executer(requete);
    expect(lu.ok).toBe(true);
    expect(ok.recus).toEqual([
      {
        envoiMonotone: monotoneAvant,
        receptionMonotone: monotoneAvant + 1_200,
        envoiMurale: instant('2026-10-20T07:00:00.000Z'),
        date: DATE,
      },
    ]);

    const erreur = preparer(() => new Response('{}', { status: 503, headers: { Date: DATE } }));
    expect((await erreur.client.executer(requete)).ok).toBe(false);
    expect(erreur.recus.map((e) => e.date)).toEqual([DATE]);

    const sansDate = preparer(() => new Response('{}', { status: 404 }));
    await sansDate.client.executer(requete);
    expect(sansDate.recus.map((e) => e.date)).toEqual([undefined]);

    const temps = new TempsSimule(instant('2026-10-21T08:00:00.000Z'));
    const recus: Array<EchangeGoogle> = [];
    const coupe = new ClientGoogle({
      lireJeton: () => 'jeton',
      fetch: () => Promise.reject(new TypeError('Failed to fetch')),
      horloge: new HorlogeSimulee(temps),
      observateur: { surReponse: (e) => recus.push(e) },
    });
    expect(await coupe.executer(requete)).toEqual({
      ok: false,
      erreur: { type: 'ReseauIndisponible' },
    });
    expect(recus).toEqual([]);

    const sansObservateur = new ClientGoogle({
      lireJeton: () => 'jeton',
      fetch: () => Promise.resolve(new Response('{}', { status: 200 })),
    });
    expect((await sansObservateur.executer(requete)).ok).toBe(true);
  });
});
