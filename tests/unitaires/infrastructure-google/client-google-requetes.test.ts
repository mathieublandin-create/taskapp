import { describe, expect, it } from 'vitest';
import { echec, succes, type Resultat } from '@src/commun/domaine/resultat';
import { ClientGoogle, type ErreurGoogle } from '@src/infrastructure-google/client-google';
import { executerAvecReprise } from '@src/infrastructure-google/reprise';
import { PlanificateurSimule } from '@tests/doublures/planificateur-simule';
import { SourceAleatoireDeterministe } from '@tests/doublures/source-aleatoire-deterministe';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { instant } from '@tests/support/valeurs';

type Appel = { readonly url: string; readonly init: RequestInit | undefined };

const fetchSimule = (reponse: () => Response, appels: Array<Appel>): typeof fetch =>
  ((url: string, init?: RequestInit) => {
    appels.push({ url, init });
    return Promise.resolve(reponse());
  }) as typeof fetch;

describe('ClientGoogle.executer (ST-US-022 §6.8, conventions §9.2)', () => {
  it('UT-COMP-US-022-70 jeton dans l’en-tête Authorization, jamais dans l’URL ; corps et en-tête Date rendus', async () => {
    const appels: Array<Appel> = [];
    const client = new ClientGoogle({
      lireJeton: () => 'ya29.jeton',
      fetch: fetchSimule(
        () =>
          new Response(JSON.stringify({ id: 'f1' }), {
            status: 200,
            headers: { Date: 'Wed, 28 Oct 2026 08:00:00 GMT' },
          }),
        appels,
      ),
    });

    const r = await client.executer({
      methode: 'POST',
      url: 'https://www.googleapis.com/drive/v3/files',
      corps: '{}',
      typeContenu: 'application/json',
    });

    expect(r).toEqual(
      succes({ statut: 200, corps: { id: 'f1' }, date: 'Wed, 28 Oct 2026 08:00:00 GMT' }),
    );
    expect(appels[0]?.url).not.toContain('ya29');
    expect(appels[0]?.init?.headers).toEqual({
      Authorization: 'Bearer ya29.jeton',
      'Content-Type': 'application/json',
    });
  });

  it('UT-COMP-US-022-71 sans jeton : NonAutorise sans requête ; échec de fetch : ReseauIndisponible ; erreur HTTP traduite', async () => {
    const appels: Array<Appel> = [];
    const sansJeton = new ClientGoogle({
      lireJeton: () => undefined,
      fetch: fetchSimule(() => new Response(), appels),
    });
    expect(await sansJeton.executer({ methode: 'GET', url: 'https://x.test' })).toEqual(
      echec({ type: 'NonAutorise' }),
    );
    expect(appels).toEqual([]);

    const coupe = new ClientGoogle({
      lireJeton: () => 'j',
      fetch: () => Promise.reject(new TypeError('Failed to fetch')),
    });
    expect(await coupe.executer({ methode: 'GET', url: 'https://x.test' })).toEqual(
      echec({ type: 'ReseauIndisponible' }),
    );

    const plein = new ClientGoogle({
      lireJeton: () => 'j',
      fetch: fetchSimule(
        () =>
          new Response(
            JSON.stringify({ error: { errors: [{ reason: 'storageQuotaExceeded' }] } }),
            {
              status: 403,
            },
          ),
        [],
      ),
    });
    expect(await plein.executer({ methode: 'GET', url: 'https://x.test' })).toEqual(
      echec({ type: 'EspaceDrivePlein' }),
    );
    const vide = new ClientGoogle({
      lireJeton: () => 'j',
      fetch: fetchSimule(() => new Response('pas du json', { status: 500 }), []),
    });
    expect(await vide.executer({ methode: 'GET', url: 'https://x.test' })).toEqual(
      echec({ type: 'ErreurServeurDistant', statut: 500 }),
    );
  });
});

describe('executerAvecReprise (DAT §4.4.5)', () => {
  const preparer = (reponses: ReadonlyArray<Resultat<string, ErreurGoogle>>) => {
    const planificateur = new PlanificateurSimule(
      new TempsSimule(instant('2026-10-28T08:00:00.000Z')),
    );
    let appels = 0;
    const operation = () => {
      const reponse = reponses[Math.min(appels, reponses.length - 1)] ?? succes('');
      appels += 1;
      return Promise.resolve(reponse);
    };
    const lancer = () =>
      planificateur.executerJusquAuReglement(
        executerAvecReprise(operation, {
          planificateur,
          aleatoire: new SourceAleatoireDeterministe([999]),
        }),
      );
    return { lancer, planificateur, appels: () => appels };
  };

  it('UT-COMP-US-022-72 reprend les erreurs transitoires au plus 3 fois, avec gigue ; une erreur définitive est rendue aussitôt', async () => {
    const transitoire = preparer([echec({ type: 'QuotaDepasse' })]);
    expect(await transitoire.lancer()).toEqual(echec({ type: 'QuotaDepasse' }));
    expect(transitoire.appels()).toBe(3);
    expect(transitoire.planificateur.attentesDemandees()).toEqual([999, 1999]);

    const definitive = preparer([echec({ type: 'NonAutorise' })]);
    expect(await definitive.lancer()).toEqual(echec({ type: 'NonAutorise' }));
    expect(definitive.appels()).toBe(1);

    const reussie = preparer([echec({ type: 'ReseauIndisponible' }), succes('ok')]);
    expect(await reussie.lancer()).toEqual(succes('ok'));
  });
});
