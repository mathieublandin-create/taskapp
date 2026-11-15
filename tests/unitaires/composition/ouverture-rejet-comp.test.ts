/**
 * ST-CORR-E13B-LOT-001 §7.3 (tranche T6, ANO-004) : un rejet de l'ouverture (jamais attendu) ne laisse pas le cadre
 * neutre `OUVERTURE` affiché indéfiniment ; `demarrerWeb` conclut comme pour `ECRAN_CONNEXION` : écran de connexion.
 * Ajout de l'E13 du rang 14 (revue de T4 à T6, RC-CORR-7) : la branche de rejet de `suivreOuverture` n'avait aucun test
 * (`src/composition/` est exclu de la couverture). Rang 14 (`UT-ANO-004-\d+`).
 */
import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OuvrirApplication } from '@src/compte/application/cas-usage/ouvrir-application';
import { demarrerWeb } from '@src/composition/web';

const VARIABLES = {
  VITE_ENV: 'recette',
  VITE_BASE_PATH: '/',
  VITE_APP_ORIGIN: 'https://exemple.test',
  VITE_GOOGLE_WEB_CLIENT_ID: 'client-de-test',
};

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

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Rejet de l’ouverture (ANO-004, ST-CORR §7.3)', () => {
  it('UT-ANO-004-08 ouvrirApplication rejette : la vue passe de OUVERTURE à CONNEXION, sans toast ni rejet non géré', async () => {
    preparerPage();
    let rejeter: (raison: Error) => void = () => undefined;
    vi.spyOn(OuvrirApplication.prototype, 'executer').mockReturnValue(
      new Promise((_, r) => {
        rejeter = r;
      }),
    );
    const { controleur } = demarrerWeb(
      { type: 'AUCUN' },
      {
        variables: VARIABLES,
        agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        pointsTactiles: 0,
        recharger: vi.fn(),
        arreterNavigation: vi.fn(),
        ouvrirOnglet: vi.fn(),
        conteneurServiceWorker: undefined,
        gestionnaireStockage: {
          persisted: vi.fn(() => Promise.resolve(false)),
          persist: vi.fn(() => Promise.resolve(true)),
        },
      },
    );
    expect(controleur.vue().racine).toEqual({ ecran: 'OUVERTURE' });

    rejeter(new Error('ouverture impossible'));
    await vi.waitFor(() => {
      expect(controleur.vue().racine).toEqual({ ecran: 'CONNEXION' });
    });
    // Comme `ECRAN_CONNEXION`, pas comme `ESPACE_INACCESSIBLE` (qui afficherait TST-ERREUR-ENREGISTREMENT).
    expect(controleur.vue().toast).toBeUndefined();
  });
});
