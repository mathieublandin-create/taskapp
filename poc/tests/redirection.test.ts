import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  analyserFragment,
  classerErreur,
  construireUrlRedirection,
  consommerContexte,
  demarrerContexte,
} from '../src/auth/redirection';
import { FournisseurJetonWeb } from '../src/auth/auth-web';
import { modeAffichage, plateformeWeb } from '../src/appareil';
import { lireConfig } from '../src/config';
import { Diagnostic, type Navigation } from '../src/diagnostic';
import { ClientDrive } from '../src/drive/client-drive';
import { exporterCsv, exporterJson } from '../src/journal/export';
import { Journal } from '../src/journal/journal';
import { StockageMemoire } from '../src/journal/stockage';
import { MarqueurIndexedDb } from '../src/storage/marqueur';

const JETON = 'SENTINELLE-REDIRECTION-0123456789';
const config = lireConfig({ VITE_GOOGLE_WEB_CLIENT_ID: 'client-test' });

describe('classerErreur', () => {
  it.each([
    ['interaction_required', 'interaction_requise'],
    ['login_required', 'interaction_requise'],
    ['consent_required', 'interaction_requise'],
    ['access_denied', 'interaction_requise'],
    ['invalid_grant', 'acces_revoque'],
    ['redirect_uri_mismatch', 'configuration'],
    ['invalid_request', 'configuration'],
    ['truc_inconnu', 'inconnue'],
  ])('%s -> %s', (code, attendu) => expect(classerErreur(code)).toBe(attendu));
});

describe('analyserFragment', () => {
  it('extrait le jeton, la durée, les scopes et le state', () => {
    const r = analyserFragment(
      `#state=s1&access_token=${JETON}&token_type=Bearer&expires_in=3599&scope=openid%20email`,
    );
    expect(r).toEqual({
      type: 'jeton',
      jeton: JETON,
      dureeSecondes: 3599,
      scopes: ['openid', 'email'],
      state: 's1',
    });
  });
  it('classe une erreur', () => {
    expect(analyserFragment('#error=login_required&state=s1')).toEqual({
      type: 'erreur',
      code: 'login_required',
      categorie: 'interaction_requise',
      state: 's1',
    });
  });
  it('durée absente ou invalide : null', () => {
    const r = analyserFragment('access_token=abc&expires_in=xx');
    expect(r.type === 'jeton' && r.dureeSecondes).toBeNull();
  });
  it.each(['', '#', '#foo=bar', '#access_token='])('sans résultat : %j', (f) => {
    expect(analyserFragment(f)).toEqual({ type: 'aucun' });
  });
});

describe('construireUrlRedirection', () => {
  it('contient prompt=none, le flux implicite et le login_hint éventuel', () => {
    const base = {
      clientId: 'c',
      redirectUri: 'https://x.test/p/',
      scopes: ['openid', 'email'],
      state: 's',
    };
    const url = new URL(construireUrlRedirection({ ...base, loginHint: 'a@b.test' }));
    expect(url.searchParams.get('response_type')).toBe('token');
    expect(url.searchParams.get('prompt')).toBe('none');
    expect(url.searchParams.get('login_hint')).toBe('a@b.test');
    expect(url.searchParams.get('scope')).toBe('openid email');
    expect(new URL(construireUrlRedirection(base)).searchParams.has('login_hint')).toBe(false);
  });
});

describe('contexte de redirection', () => {
  beforeEach(() => localStorage.clear());
  it('compte les redirections et ne se consomme qu’une fois', () => {
    expect(demarrerContexte(localStorage, 'a', 10).numero).toBe(1);
    expect(consommerContexte(localStorage)).toMatchObject({ state: 'a', debutMs: 10 });
    expect(consommerContexte(localStorage)).toBeNull();
    expect(demarrerContexte(localStorage, 'b', 20).numero).toBe(2);
  });
});

function monter(fragment: string) {
  const journal = new Journal(new StockageMemoire(), 'pc');
  const aller: string[] = [];
  let efface = false;
  const navigation: Navigation = {
    redirectUri: 'https://x.test/p/',
    fragment: () => fragment,
    effacerFragment: () => (efface = true),
    aller: (u) => aller.push(u),
  };
  const auth = new FournisseurJetonWeb('client-test', fetch, async () => undefined);
  let t = 1000;
  const diagnostic = new Diagnostic({
    auth,
    drive: new ClientDrive(auth, config),
    journal,
    config,
    appareil: 'pc',
    stockage: localStorage,
    navigation,
    marqueur: new MarqueurIndexedDb('test-marqueur'),
    maintenant: () => (t += 500),
  });
  return { journal, diagnostic, aller, auth, estEfface: () => efface };
}

describe('retour de redirection', () => {
  beforeEach(() => localStorage.clear());

  it('succès : durée, numéro, durée de vie ; le jeton n’est jamais journalisé', async () => {
    const m = monter('');
    await m.diagnostic.jetonParRedirection();
    const state = new URL(m.aller[0] ?? '').searchParams.get('state');
    const retour = monter(`#state=${state}&access_token=${JETON}&expires_in=3599&scope=openid`);
    await retour.diagnostic.traiterRetourRedirection();
    const entrees = await retour.journal.lire();
    expect(entrees[0]?.resultat).toBe('JetonObtenu');
    expect(entrees[0]?.detail).toContain('3599 s');
    expect(entrees[0]?.detail).toContain('redirection n° 1');
    expect(retour.estEfface()).toBe(true);
    expect(await retour.auth.valeurJeton()).toBe(JETON);
    expect(exporterJson(entrees)).not.toContain(JETON);
    expect(exporterCsv(entrees)).not.toContain(JETON);
  });

  it('erreur interaction_required : journalisée et classée', async () => {
    const m = monter('');
    await m.diagnostic.jetonParRedirection();
    const state = new URL(m.aller[0] ?? '').searchParams.get('state');
    const retour = monter(`#error=interaction_required&state=${state}`);
    await retour.diagnostic.traiterRetourRedirection();
    const e = (await retour.journal.lire())[0];
    expect(e?.codeErreur).toBe('interaction_required');
    expect(e?.detail).toContain('interaction_requise');
  });

  it('state différent : retour rejeté, jeton non adopté ni journalisé', async () => {
    await monter('').diagnostic.jetonParRedirection();
    const retour = monter(`#state=autre&access_token=${JETON}&expires_in=3599`);
    await retour.diagnostic.traiterRetourRedirection();
    const entrees = await retour.journal.lire();
    expect(entrees[0]?.resultat).toBe('Retour rejeté');
    expect(await retour.auth.valeurJeton()).toBeNull();
    expect(exporterJson(entrees)).not.toContain(JETON);
  });

  it('sans fragment : rien n’est journalisé', async () => {
    const m = monter('');
    await m.diagnostic.traiterRetourRedirection();
    expect(await m.journal.lire()).toHaveLength(0);
  });
});

describe('marqueur IndexedDB', () => {
  it('se pose puis se relit avec son horodatage', async () => {
    const marqueur = new MarqueurIndexedDb('test-marqueur-2');
    expect(await marqueur.lire()).toBeNull();
    const pose = await marqueur.poser(new Date('2026-10-22T10:00:00Z'));
    expect(await marqueur.lire()).toEqual(pose);
    expect(pose.poseLe).toBe('2026-10-22T10:00:00.000Z');
  });
  it('journalise présence et absence', async () => {
    const m = monter('');
    await m.diagnostic.lireMarqueur();
    await m.diagnostic.poserMarqueur();
    await m.diagnostic.lireMarqueur();
    const r = (await m.journal.lire()).map((e) => e.resultat);
    expect(r).toContain('Marqueur présent');
  });
});

describe('durabilité stricte du marqueur', () => {
  it('passe durability: strict à la transaction d’écriture et résout à complete', async () => {
    const evenements: string[] = [];
    const original = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function (
      this: IDBDatabase,
      ...args: Parameters<IDBDatabase['transaction']>
    ) {
      const t = original.apply(this, args);
      if (args[1] === 'readwrite') {
        evenements.push(`options:${JSON.stringify(args[2])}`);
        t.addEventListener('complete', () => evenements.push('complete'));
      }
      return t;
    } as IDBDatabase['transaction'];
    try {
      const marqueur = new MarqueurIndexedDb('test-marqueur-strict');
      await marqueur.poser(new Date());
      evenements.push('poser résolu');
    } finally {
      IDBDatabase.prototype.transaction = original;
    }
    expect(evenements).toEqual(['options:{"durability":"strict"}', 'complete', 'poser résolu']);
  });
});

describe('contexte d’exécution (mode d’affichage, plateforme)', () => {
  beforeEach(() => localStorage.clear());

  it.each([
    ['Mozilla/5.0 (Linux; Android 15; Pixel 9) Chrome/130 Mobile', 0, 'web-android'],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari', 5, 'web-ios'],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari', 5, 'web-ios'],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome', 0, 'web-pc'],
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome', 0, 'web-pc'],
  ])('%s -> %s', (agent, tactile, attendu) => {
    expect(plateformeWeb(agent, tactile)).toBe(attendu);
  });

  it('modeAffichage distingue standalone et navigateur', () => {
    expect(modeAffichage(() => ({ matches: true }))).toBe('standalone');
    expect(modeAffichage(() => ({ matches: false }))).toBe('navigateur');
  });

  it('les entrées Redirection et R15 portent le contexte', async () => {
    const journal = new Journal(new StockageMemoire(), 'pc');
    const auth = new FournisseurJetonWeb('client-test', fetch, async () => undefined);
    const diagnostic = new Diagnostic({
      auth,
      drive: new ClientDrive(auth, config),
      journal,
      config,
      appareil: 'pc',
      stockage: localStorage,
      marqueur: new MarqueurIndexedDb('test-marqueur-ctx'),
      navigation: {
        redirectUri: 'https://x.test/',
        fragment: () => '',
        effacerFragment: () => undefined,
        aller: () => undefined,
      },
      contexteExecution: () => 'mode d’affichage : standalone ; plateforme : web-android',
    });
    await diagnostic.jetonParRedirection();
    await diagnostic.poserMarqueur();
    await diagnostic.lireMarqueur();
    const entrees = await journal.lire();
    expect(entrees).toHaveLength(3);
    for (const e of entrees) expect(e.detail).toContain('standalone ; plateforme : web-android');
  });

  it('les exports portent le contexte en en-tête', () => {
    const contexte = 'mode d’affichage : standalone ; plateforme : web-android';
    expect(JSON.parse(exporterJson([], contexte))).toEqual({ contexte, entrees: [] });
    expect(exporterCsv([], contexte).split('\n')[0]).toBe(`# contexte : ${contexte}`);
    expect(JSON.parse(exporterJson([]))).toEqual([]);
  });
});

describe('redirection automatique à l’ouverture (§13.3)', () => {
  beforeEach(() => localStorage.clear());

  /** L'identité en cache est lue à la construction du fournisseur : elle doit précéder `monter`. */
  function monterAvecIdentite() {
    localStorage.setItem('poc.identite', JSON.stringify({ email: 'a@b.test', nom: 'A' }));
    const m = monter('');
    m.diagnostic.reglerRedirectionAutomatique(true);
    return m;
  }

  it('option inactive : rien ne part et rien n’est journalisé', async () => {
    const m = monter('');
    expect(await m.diagnostic.ouvertureAutomatique(false, true)).toBe(false);
    expect(m.aller).toHaveLength(0);
    expect(await m.journal.lire()).toHaveLength(0);
  });

  it('option active, identité, réseau : une redirection prompt=none est lancée et journalisée', async () => {
    const m = monterAvecIdentite();
    expect(await m.diagnostic.ouvertureAutomatique(false, true)).toBe(true);
    expect(m.aller).toHaveLength(1);
    const url = new URL(m.aller[0] ?? '');
    expect(url.searchParams.get('prompt')).toBe('none');
    expect(url.searchParams.get('login_hint')).toBe('a@b.test');
    const e = (await m.journal.lire())[0];
    expect(e?.mesure).toBe('Redirection');
    expect(e?.operation).toContain('automatique');
  });

  it.each([
    ['retour de Google', true, true, 'revient de Google'],
    ['réseau indisponible', false, false, 'réseau indisponible'],
  ])('refus : %s', async (_nom, retourTraite, enLigne, motif) => {
    const m = monterAvecIdentite();
    expect(await m.diagnostic.ouvertureAutomatique(retourTraite, enLigne)).toBe(false);
    expect(m.aller).toHaveLength(0);
    expect((await m.journal.lire())[0]?.detail).toContain(motif);
  });

  it('refus : aucune identité en cache', async () => {
    const m = monter('');
    m.diagnostic.reglerRedirectionAutomatique(true);
    expect(await m.diagnostic.ouvertureAutomatique(false, true)).toBe(false);
    expect((await m.journal.lire())[0]?.detail).toContain('aucune identité');
  });

  it('refus : un départ est déjà en attente, donc une seule tentative', async () => {
    const m = monterAvecIdentite();
    expect(await m.diagnostic.ouvertureAutomatique(false, true)).toBe(true);
    expect(await m.diagnostic.ouvertureAutomatique(false, true)).toBe(false);
    expect(m.aller).toHaveLength(1);
  });

  it('traiterRetourRedirection signale si la page revenait de Google', async () => {
    expect(await monter('').diagnostic.traiterRetourRedirection()).toBe(false);
    expect(
      await monter('#error=login_required&state=x').diagnostic.traiterRetourRedirection(),
    ).toBe(true);
  });
});
