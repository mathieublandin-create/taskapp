/**
 * ST-US-031 v0.4 §6.4, §6.5 n° 9, §14 (rang 13, tranche B2), tests complémentaires de Bruce : câblage de la fin de
 * session dans `demarrerWeb`. L'avis `SESSION_FERMEE` d'un autre onglet (BroadcastChannel réel de Node) et la fermeture
 * imposée (`versionchange` de la base technique) passent par une même sortie `quitter` : un seul rechargement, même si
 * les deux arrivent ; avec un espace ouvert (session mémorisée, ouverture hors ligne), la coordination de l'espace est
 * arrêtée avant le rechargement. UT-COMP-US-031-15 à 18.
 */
// IndexedDB de la page (base technique, espaces) : posée avant le chargement de Dexie, comme dans un navigateur.
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nomCanalSession } from '@src/compte/infrastructure/avis-onglets-broadcast';
import { BaseTechnique, MemoireSessionDexie } from '@src/compte/infrastructure/base-technique';
import { nomEspace } from '@src/compte/infrastructure/espaces/nom-espace';
import { ControleurInterface } from '@src/composition/controleur-interface';
import { demarrerWeb } from '@src/composition/web';
import { CoordinationOnglets } from '@src/synchronisation/application/coordination-onglets';
import { IDENTITE_A } from '@tests/support/compte/doublures-compte';

const VARIABLES = {
  VITE_ENV: 'recette',
  VITE_BASE_PATH: '/',
  VITE_APP_ORIGIN: 'https://exemple.test',
  VITE_GOOGLE_WEB_CLIENT_ID: 'client-de-test',
};

const BASE_TECHNIQUE = 'donejuan-recette-technique';

const canaux: Array<BroadcastChannel> = [];

/** Page simulée sans réseau (aucun appel Google) ; écouteurs de `document` et `window` inertes. */
const preparerPage = (): void => {
  const page = new EventTarget();
  const fenetre = new EventTarget();
  vi.stubGlobal('document', {
    visibilityState: 'visible',
    addEventListener: page.addEventListener.bind(page),
  });
  vi.stubGlobal('window', {
    addEventListener: fenetre.addEventListener.bind(fenetre),
    removeEventListener: fenetre.removeEventListener.bind(fenetre),
  });
  vi.stubGlobal('navigator', { onLine: false });
};

const attendreQue = async (condition: () => boolean): Promise<void> => {
  for (let essai = 0; essai < 200 && !condition(); essai += 1) {
    await new Promise((resoudre) => setTimeout(resoudre, 10));
  }
  expect(condition()).toBe(true);
};

/** Démarre la page et attend la fin de l'ouverture (base technique ouverte, vue calculée). */
const demarrer = async () => {
  const recharger = vi.fn();
  const rafraichir = vi.spyOn(ControleurInterface.prototype, 'rafraichir');
  const stockage = {
    persisted: vi.fn(() => Promise.resolve(false)),
    persist: vi.fn(() => Promise.resolve(true)),
  };
  demarrerWeb(
    { type: 'AUCUN' },
    {
      variables: VARIABLES,
      agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      pointsTactiles: 0,
      recharger,
      arreterNavigation: vi.fn(),
      ouvrirOnglet: vi.fn(),
      conteneurServiceWorker: undefined,
      gestionnaireStockage: stockage,
    },
  );
  await attendreQue(
    () => stockage.persist.mock.calls.length > 0 && rafraichir.mock.calls.length > 0,
  );
  return { recharger };
};

/** Un autre onglet du profil diffuse un avis sur le canal de session. */
const autreOngletDiffuse = (message: unknown): void => {
  const canal = new BroadcastChannel(nomCanalSession('recette'));
  canaux.push(canal);
  canal.postMessage(message);
};

/** Une autre connexion supprime la base : `versionchange` sur la connexion de la page. */
const supprimerBase = (nom: string): Promise<void> =>
  new Promise((resoudre, rejeter) => {
    const requete = indexedDB.deleteDatabase(nom);
    requete.onsuccess = () => {
      resoudre();
    };
    requete.onerror = () => {
      rejeter(new Error('suppression impossible'));
    };
  });

const supprimerBaseTechnique = (): Promise<void> => supprimerBase(BASE_TECHNIQUE);

/** Session du compte A mémorisée par une ouverture précédente : la page s'ouvrira hors ligne sur son espace. */
const memoriserSession = async (): Promise<void> => {
  const base = new BaseTechnique({ env: 'recette' });
  const ecriture = await new MemoireSessionDexie(base).ecrire({
    identite: IDENTITE_A,
    accesPerdu: false,
  });
  expect(ecriture.ok).toBe(true);
  base.fermer();
};

/** Page ouverte hors ligne sur l'espace du compte A ; espions de la coordination (implémentation conservée). */
const demarrerSurEspace = async () => {
  await memoriserSession();
  const demarrerCoordination = vi.spyOn(CoordinationOnglets.prototype, 'demarrer');
  const arreterCoordination = vi.spyOn(CoordinationOnglets.prototype, 'arreter');
  const { recharger } = await demarrer();
  await attendreQue(() => demarrerCoordination.mock.calls.length > 0);
  expect(arreterCoordination).not.toHaveBeenCalled();
  return { recharger, arreterCoordination };
};

/** L'arrêt de la coordination précède le rechargement, une fois chacun. */
const verifierArretPuisRechargement = (
  arreter: { mock: { invocationCallOrder: ReadonlyArray<number> } },
  recharger: { mock: { invocationCallOrder: ReadonlyArray<number> } },
): void => {
  expect(arreter.mock.invocationCallOrder).toHaveLength(1);
  expect(recharger.mock.invocationCallOrder).toHaveLength(1);
  expect(arreter.mock.invocationCallOrder[0]).toBeLessThan(
    recharger.mock.invocationCallOrder[0] ?? 0,
  );
};

beforeEach(async () => {
  await supprimerBaseTechnique();
  await supprimerBase(await nomEspace('recette', IDENTITE_A.compte));
});

afterEach(() => {
  canaux.splice(0).forEach((canal) => {
    canal.close();
  });
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('demarrerWeb — fin de session dans un autre onglet (ST-US-031 §6.4, §6.5 n° 9)', () => {
  it('UT-COMP-US-031-15 avis SESSION_FERMEE reçu deux fois — un seul rechargement ; un message inconnu ne recharge pas', async () => {
    preparerPage();
    const { recharger } = await demarrer();

    autreOngletDiffuse('AUTRE_CHOSE');
    await new Promise((resoudre) => setTimeout(resoudre, 30));
    expect(recharger).not.toHaveBeenCalled();

    autreOngletDiffuse('SESSION_FERMEE');
    await attendreQue(() => recharger.mock.calls.length > 0);
    autreOngletDiffuse('SESSION_FERMEE');
    await new Promise((resoudre) => setTimeout(resoudre, 30));

    expect(recharger).toHaveBeenCalledTimes(1);
  });

  it('UT-COMP-US-031-16 versionchange de la base technique puis avis — même sortie : un seul rechargement', async () => {
    preparerPage();
    const { recharger } = await demarrer();

    await supprimerBaseTechnique();
    await attendreQue(() => recharger.mock.calls.length > 0);
    autreOngletDiffuse('SESSION_FERMEE');
    await new Promise((resoudre) => setTimeout(resoudre, 30));

    expect(recharger).toHaveBeenCalledTimes(1);
  });

  it('UT-COMP-US-031-17 espace ouvert, avis SESSION_FERMEE — coordination de l’espace arrêtée, puis page rechargée, une fois', async () => {
    preparerPage();
    const { recharger, arreterCoordination } = await demarrerSurEspace();

    autreOngletDiffuse('SESSION_FERMEE');
    await attendreQue(() => recharger.mock.calls.length > 0);
    autreOngletDiffuse('SESSION_FERMEE');
    await new Promise((resoudre) => setTimeout(resoudre, 30));

    verifierArretPuisRechargement(arreterCoordination, recharger);
  });

  it('UT-COMP-US-031-18 espace ouvert, versionchange de l’espace (suppression depuis un autre onglet) — coordination arrêtée, puis page rechargée, une fois', async () => {
    preparerPage();
    const { recharger, arreterCoordination } = await demarrerSurEspace();

    await supprimerBase(await nomEspace('recette', IDENTITE_A.compte));
    await attendreQue(() => recharger.mock.calls.length > 0);
    autreOngletDiffuse('SESSION_FERMEE');
    await new Promise((resoudre) => setTimeout(resoudre, 30));

    verifierArretPuisRechargement(arreterCoordination, recharger);
  });
});
