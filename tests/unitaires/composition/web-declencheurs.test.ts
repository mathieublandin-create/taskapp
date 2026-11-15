/**
 * ST-US-018 v0.4 §6.2, §6.3 n° 3 (rang 12, tranche B1), tests complémentaires de Bruce : câblage de `demarrerWeb`.
 * La persistance est demandée une fois après l'ouverture, même sans compte ; la vue est recalculée chaque minute
 * (RG-057) et au retour au premier plan, jamais quand la page passe au second plan. UT-COMP-US-018-10 à 12.
 */
// IndexedDB de la page (base technique, espaces) : posée avant le chargement de Dexie, comme dans un navigateur.
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ControleurInterface } from '@src/composition/controleur-interface';
import { demarrerWeb } from '@src/composition/web';

const VARIABLES = {
  VITE_ENV: 'recette',
  VITE_BASE_PATH: '/',
  VITE_APP_ORIGIN: 'https://exemple.test',
  VITE_GOOGLE_WEB_CLIENT_ID: 'client-de-test',
};

/** Page simulée : écouteurs de `document` et de `window`, visibilité réglable, réseau coupé (aucun appel Google). */
const preparerPage = () => {
  const page = new EventTarget();
  const fenetre = new EventTarget();
  const etat = { visibilite: 'visible' };
  vi.stubGlobal('document', {
    get visibilityState() {
      return etat.visibilite;
    },
    addEventListener: page.addEventListener.bind(page),
  });
  vi.stubGlobal('window', {
    addEventListener: fenetre.addEventListener.bind(fenetre),
    removeEventListener: fenetre.removeEventListener.bind(fenetre),
  });
  vi.stubGlobal('navigator', { onLine: false });
  const changerVisibilite = (visibilite: 'visible' | 'hidden'): void => {
    etat.visibilite = visibilite;
    page.dispatchEvent(new Event('visibilitychange'));
  };
  return { changerVisibilite };
};

const demarrer = () => {
  const stockage = {
    persisted: vi.fn(() => Promise.resolve(false)),
    persist: vi.fn(() => Promise.resolve(true)),
  };
  const rafraichir = vi.spyOn(ControleurInterface.prototype, 'rafraichir');
  demarrerWeb(
    { type: 'AUCUN' },
    {
      variables: VARIABLES,
      agent: 'Mozilla/5.0 (Linux; Android 14) Mobile',
      pointsTactiles: 5,
      recharger: vi.fn(),
      arreterNavigation: vi.fn(),
      ouvrirOnglet: vi.fn(),
      conteneurServiceWorker: undefined,
      gestionnaireStockage: stockage,
    },
  );
  return { stockage, rafraichir };
};

/**
 * Attente d'une condition sur des tâches réelles (IndexedDB simulée). `vi.waitFor` n'est pas utilisé : il avance les
 * minuteries simulées, donc l'intervalle de RG-057, que ces tests mesurent.
 */
const attendreQue = async (condition: () => boolean): Promise<void> => {
  for (let essai = 0; essai < 200 && !condition(); essai += 1) {
    await new Promise((resoudre) => setTimeout(resoudre, 10));
  }
  expect(condition()).toBe(true);
};

/** Ouverture terminée : persistance demandée et vue recalculée par `apresOuverture` (son dernier geste). */
const ouvertureTerminee = (
  stockage: { persist: { mock: { calls: ReadonlyArray<unknown> } } },
  rafraichir: { mock: { calls: ReadonlyArray<unknown> } },
): Promise<void> =>
  attendreQue(() => stockage.persist.mock.calls.length > 0 && rafraichir.mock.calls.length > 0);

/** Base technique effacée : chaque test est un premier lancement (les connexions des tests précédents se ferment). */
const effacerBaseTechnique = (): Promise<void> =>
  new Promise((resoudre, rejeter) => {
    const requete = indexedDB.deleteDatabase('donejuan-recette-technique');
    requete.onsuccess = () => {
      resoudre();
    };
    requete.onerror = () => {
      rejeter(new Error('effacement impossible'));
    };
  });

beforeEach(async () => {
  await effacerBaseTechnique();
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('demarrerWeb — déclencheurs de B1 (ST-US-018 §6.2, §6.3 n° 3)', () => {
  it('UT-COMP-US-018-10 après l’ouverture, sans compte — persist() demandé une fois, persisted() jamais', async () => {
    preparerPage();
    const { stockage, rafraichir } = demarrer();

    await ouvertureTerminee(stockage, rafraichir);

    expect(stockage.persist).toHaveBeenCalledTimes(1);
    expect(stockage.persisted).not.toHaveBeenCalled();
  });

  it('UT-COMP-US-018-11 RG-057 — vue recalculée à 60 s puis à 120 s, pas avant', async () => {
    preparerPage();
    const { stockage, rafraichir } = demarrer();
    await ouvertureTerminee(stockage, rafraichir);
    rafraichir.mockClear();

    vi.advanceTimersByTime(59_999);
    expect(rafraichir).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(rafraichir).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(60_000);
    expect(rafraichir).toHaveBeenCalledTimes(2);
  });

  it('UT-COMP-US-018-12 visibilité — retour au premier plan : vue recalculée ; passage au second plan : non', async () => {
    const { changerVisibilite } = preparerPage();
    const { stockage, rafraichir } = demarrer();
    await ouvertureTerminee(stockage, rafraichir);
    rafraichir.mockClear();

    changerVisibilite('hidden');
    await new Promise((resoudre) => setTimeout(resoudre, 50));
    expect(rafraichir).not.toHaveBeenCalled();

    changerVisibilite('visible');
    await attendreQue(() => rafraichir.mock.calls.length > 0);
    await new Promise((resoudre) => setTimeout(resoudre, 50));
    expect(rafraichir).toHaveBeenCalledTimes(1);
  });
});
