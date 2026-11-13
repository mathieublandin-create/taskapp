import { describe, expect, it } from 'vitest';
import { echec, succes, type Resultat } from '@src/commun/domaine/resultat';
import type { DemandeJeton, RetourGoogle } from '@src/compte/application/ports/fournisseur-auth';
import {
  REPRISE_ACCUEIL,
  type DepartMemorise,
} from '@src/compte/application/ports/memoire-redirection';
import { PORTEES_LOT_1 } from '@src/compte/domaine/portees';
import { CoffreJetonsMemoire } from '@src/compte/infrastructure/coffre-jetons-memoire';
import {
  erreurDuRetour,
  FournisseurAuthWeb,
} from '@src/compte/infrastructure/auth/fournisseur-auth-web';
import type { ReponseGis } from '@src/compte/infrastructure/auth/passerelle-gis';
import type { ErreurGis, Plateforme } from '@src/compte/infrastructure/auth/strategie-geste';
import { SourceAleatoireDeterministe } from '@tests/doublures/source-aleatoire-deterministe';
import {
  IDENTITE_A,
  IDENTITE_B,
  JournalEnMemoire,
  MemoireRedirectionEnMemoire,
  ReseauFixe,
} from '@tests/support/compte/doublures-compte';
import { horlogeSur } from '@tests/support/horloge';

const JETON_A = 'ya29.jeton-de-test-A';

const preparer = (
  options: {
    plateforme?: Plateforme;
    reponseGis?: Resultat<ReponseGis, ErreurGis>;
    connecte?: boolean;
    memoireIndisponible?: boolean;
  } = {},
) => {
  const memoireRedirection = new MemoireRedirectionEnMemoire();
  if (options.memoireIndisponible === true) {
    memoireRedirection.memoriser = () =>
      Promise.resolve(echec({ type: 'MemoireTechniqueIndisponible' }));
  }
  const navigations: Array<string> = [];
  const appelsGis: Array<string | undefined> = [];
  const coffre = new CoffreJetonsMemoire();
  const journal = new JournalEnMemoire();
  const horloge = horlogeSur('2026-10-28T08:00:00.000Z');
  const fournisseur = new FournisseurAuthWeb({
    configuration: {
      clientId: 'client.apps.googleusercontent.com',
      redirectUri: 'https://exemple.test/taskapp/',
      plateforme: options.plateforme ?? 'web',
    },
    passerelle: {
      demanderJeton: (d) => {
        appelsGis.push(d.indice);
        return Promise.resolve(
          options.reponseGis ??
            succes({ jeton: JETON_A, expireEnSecondes: 100, portees: PORTEES_LOT_1 }),
        );
      },
    },
    lireIdentite: (jeton) =>
      Promise.resolve(
        jeton === JETON_A ? succes(IDENTITE_A) : echec({ type: 'SessionARenouveler', code: 'x' }),
      ),
    navigation: { aller: (url) => navigations.push(url) },
    memoireRedirection,
    coffre,
    horloge,
    aleatoire: new SourceAleatoireDeterministe([0]),
    reseau: new ReseauFixe(options.connecte ?? true),
    journal,
    compteDeLaSession: () => IDENTITE_A.compte,
  });
  return { fournisseur, memoireRedirection, navigations, appelsGis, coffre, journal, horloge };
};

const geste = (options: Partial<DemandeJeton> = {}): DemandeJeton => ({
  mode: 'RENOUVELLEMENT_GESTE',
  portees: PORTEES_LOT_1,
  indice: IDENTITE_A.adresse,
  reprise: REPRISE_ACCUEIL,
  redirectionPermise: true,
  ...options,
});

const CONNEXION: DemandeJeton = {
  mode: 'CONNEXION',
  portees: PORTEES_LOT_1,
  reprise: REPRISE_ACCUEIL,
  redirectionPermise: false,
};

describe('FournisseurAuthWeb (ST-US-022 §6.4, §14)', () => {
  it.each<readonly [string, ErreurGis]>([
    ['script indisponible avec réseau', { type: 'SCRIPT_INDISPONIBLE' }],
    ['popup_failed_to_open', { type: 'POPUP_FAILED_TO_OPEN' }],
    ['erreur inconnue', { type: 'INCONNUE', code: 'unknown' }],
  ])(
    'UT-COMP-US-022-01 geste — %s : une seule redirection interactive, sans prompt, avec login_hint (REPLI_GESTE)',
    async (_cas, erreur) => {
      const env = preparer({ reponseGis: echec(erreur) });

      expect(await env.fournisseur.demanderJeton(geste())).toEqual(
        succes({ type: 'REDIRECTION_LANCEE' }),
      );

      expect(env.navigations).toHaveLength(1);
      const url = new URL(env.navigations[0] ?? '');
      expect(url.searchParams.has('prompt')).toBe(false);
      expect(url.searchParams.get('login_hint')).toBe(IDENTITE_A.adresse);
      expect(env.memoireRedirection.depart?.mode).toBe('REPLI_GESTE');
      expect(env.memoireRedirection.depart?.state).toBe(url.searchParams.get('state'));
    },
  );

  it.each<readonly [string, ErreurGis, boolean, string]>([
    ['popup_closed', { type: 'POPUP_CLOSED' }, true, 'ConnexionAnnulee'],
    ['access_denied', { type: 'ACCESS_DENIED' }, true, 'AccesGoogleRevoque'],
    [
      'script indisponible hors ligne',
      { type: 'SCRIPT_INDISPONIBLE' },
      false,
      'ReseauIndisponible',
    ],
  ])(
    'UT-COMP-US-022-02 geste — %s : aucun repli, aucune navigation',
    async (_cas, erreur, connecte, attendu) => {
      const env = preparer({ reponseGis: echec(erreur), connecte });

      expect(await env.fournisseur.demanderJeton(geste())).toEqual(echec({ type: attendu }));
      expect(env.navigations).toEqual([]);
      expect(env.memoireRedirection.depart).toBeUndefined();
    },
  );

  it('UT-COMP-US-022-03 geste — redirectionPermise faux : RedirectionNonPermise, aucune navigation ni départ', async () => {
    const env = preparer({ reponseGis: echec({ type: 'POPUP_FAILED_TO_OPEN' }) });

    expect(await env.fournisseur.demanderJeton(geste({ redirectionPermise: false }))).toEqual(
      echec({ type: 'RedirectionNonPermise' }),
    );
    expect(env.navigations).toEqual([]);
    expect(env.memoireRedirection.depart).toBeUndefined();
  });

  it('UT-COMP-US-022-04 geste sur web-ios — redirection interactive d’emblée, GIS jamais appelé', async () => {
    const env = preparer({ plateforme: 'web-ios' });

    expect(await env.fournisseur.demanderJeton(geste({ mode: 'RECONNEXION_GESTE' }))).toEqual(
      succes({ type: 'REDIRECTION_LANCEE' }),
    );
    expect(env.appelsGis).toEqual([]);
    expect(env.navigations).toHaveLength(1);
  });

  it('UT-COMP-US-022-05 geste GIS réussi — login_hint transmis ; jeton placé dans le coffre avec son échéance monotone', async () => {
    const env = preparer();

    const r = await env.fournisseur.demanderJeton(geste());

    expect(r).toEqual(
      succes({
        type: 'ACCES_OBTENU',
        acces: { porteesAccordees: PORTEES_LOT_1, identite: IDENTITE_A },
      }),
    );
    expect(env.appelsGis).toEqual([IDENTITE_A.adresse]);
    expect(env.coffre.lire()).toEqual({
      jeton: JETON_A,
      echeance: env.horloge.monotone() + 100_000,
    });
    expect(JSON.stringify(env.journal.entrees)).not.toContain(JETON_A);
  });

  it('UT-COMP-US-022-06 connexion — GIS sans login_hint ; un refus vaut une annulation ; jamais de redirection', async () => {
    const ok = preparer();
    await ok.fournisseur.demanderJeton(CONNEXION);
    expect(ok.appelsGis).toEqual([undefined]);

    const refus = preparer({ reponseGis: echec({ type: 'ACCESS_DENIED' }) });
    expect(await refus.fournisseur.demanderJeton(CONNEXION)).toEqual(
      echec({ type: 'ConnexionAnnulee' }),
    );
    const panne = preparer({ reponseGis: echec({ type: 'POPUP_FAILED_TO_OPEN' }) });
    expect(await panne.fournisseur.demanderJeton(CONNEXION)).toEqual(
      echec({ type: 'ReseauIndisponible' }),
    );
    expect(panne.navigations).toEqual([]);
  });

  it('UT-COMP-US-022-07 ouverture — mémoire technique indisponible : MemoireTechniqueIndisponible, aucune navigation (§5.1)', async () => {
    const env = preparer({ memoireIndisponible: true });

    expect(
      await env.fournisseur.demanderJeton(geste({ mode: 'RENOUVELLEMENT_OUVERTURE' })),
    ).toEqual(echec({ type: 'MemoireTechniqueIndisponible' }));
    expect(env.navigations).toEqual([]);
  });

  it('UT-COMP-US-022-08 ouverture — state de 128 bits en base64url, prompt=none, départ expirant 10 min après', async () => {
    const env = preparer();

    await env.fournisseur.demanderJeton(geste({ mode: 'RENOUVELLEMENT_OUVERTURE' }));

    const url = new URL(env.navigations[0] ?? '');
    expect(url.searchParams.get('prompt')).toBe('none');
    expect(url.searchParams.get('state')).toMatch(/^[A-Za-z0-9_-]{22}$/);
    const depart = env.memoireRedirection.depart;
    expect(depart && depart.expireA - depart.lanceA).toBe(600_000);
  });

  it('UT-COMP-US-022-09 recevoirRetour — jeton d’un autre compte : CompteDifferent, coffre vide ; portées partielles : PorteeInsuffisante', async () => {
    const env = preparer();
    const depart: DepartMemorise = {
      state: 's',
      lanceA: env.horloge.maintenant(),
      expireA: env.horloge.maintenant(),
      mode: 'RENOUVELLEMENT_OUVERTURE',
      reprise: REPRISE_ACCUEIL,
    };
    const retour = (portees: ReadonlyArray<string>): RetourGoogle => ({
      type: 'JETON',
      jeton: JETON_A,
      portees,
      state: 's',
    });

    expect(
      await env.fournisseur.recevoirRetour({
        retour: retour(PORTEES_LOT_1),
        depart,
        compteAttendu: IDENTITE_B.compte,
      }),
    ).toEqual(echec({ type: 'CompteDifferent' }));
    expect(env.coffre.lire()).toBeUndefined();
    expect(
      await env.fournisseur.recevoirRetour({
        retour: retour(['openid', 'email']),
        depart,
        compteAttendu: IDENTITE_A.compte,
      }),
    ).toEqual(
      echec({
        type: 'PorteeInsuffisante',
        manquantes: ['https://www.googleapis.com/auth/drive.file'],
      }),
    );
    expect(
      await env.fournisseur.recevoirRetour({
        retour: { type: 'ERREUR', code: 'login_required', state: 's' },
        depart,
        compteAttendu: IDENTITE_A.compte,
      }),
    ).toEqual(echec({ type: 'SessionARenouveler', code: 'login_required' }));
  });

  it('UT-COMP-US-022-10 erreurDuRetour — access_denied perd l’accès après un repli de geste seulement ; codes de configuration', () => {
    expect(erreurDuRetour('access_denied', 'REPLI_GESTE')).toEqual({ type: 'AccesGoogleRevoque' });
    expect(erreurDuRetour('access_denied', 'RENOUVELLEMENT_OUVERTURE')).toEqual({
      type: 'SessionARenouveler',
      code: 'access_denied',
    });
    expect(erreurDuRetour('redirect_uri_mismatch', 'RENOUVELLEMENT_OUVERTURE')).toEqual({
      type: 'ConfigurationOAuthInvalide',
      code: 'redirect_uri_mismatch',
    });
    expect(erreurDuRetour('server_error', 'REPLI_GESTE')).toEqual({
      type: 'SessionARenouveler',
      code: 'server_error',
    });
  });

  it('UT-COMP-US-022-11 oublier — vide le coffre et consomme le départ mémorisé', async () => {
    const env = preparer();
    await env.fournisseur.demanderJeton(geste());
    await env.fournisseur.demanderJeton(geste({ mode: 'RENOUVELLEMENT_OUVERTURE' }));

    env.fournisseur.oublier();

    expect(env.coffre.lire()).toBeUndefined();
    expect(await env.memoireRedirection.consommer()).toBeUndefined();
  });
});
