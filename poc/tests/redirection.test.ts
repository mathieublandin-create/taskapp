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
