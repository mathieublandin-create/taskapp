/**
 * ST-US-018 v0.4 §6.4 n° 5, §6.5 (rang 12, tranche B2), tests complémentaires de Bruce : composition `test-ihm`.
 * Binding absent : erreur au démarrage, avant toute ouverture ; environnement imposé à `recette` ; Google simulé sans
 * redirection (pont `donejuanFauxGoogle`) et Drive par le pont `donejuanFauxDrive`, relié ici au `FauxDrive`.
 * UT-COMP-US-018-14 à 16.
 */
// IndexedDB de la page (base technique, espaces) : posée avant le chargement de Dexie, comme dans un navigateur.
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import { succes } from '@src/commun/domaine/resultat';
import type { AccesObtenu } from '@src/compte/application/ports/fournisseur-auth';
import { PORTEES_LOT_1 } from '@src/compte/domaine/portees';
import { decoderPont, encoderPont } from '@src/composition/test-ihm/codec-pont';
import type { PontGoogle } from '@src/composition/test-ihm/fournisseur-auth-test-ihm';
import type { PontDrive } from '@src/composition/test-ihm/transport-par-pont';
import { demarrerWeb } from '@src/composition/test-ihm';
import type { Navigateur } from '@src/composition/web';
import { FauxDrive } from '@tests/doublures/faux-drive';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { IDENTITE_A } from '@tests/support/compte/doublures-compte';
import { repondrePontDrive } from '@tests/support/ihm/repondre-pont-drive';
import { ReseauCommandable } from '@tests/support/synchronisation/appareil-cycle';
import { instant, SMARTPHONE } from '@tests/support/valeurs';

/** Variables de construction : `production` demandé, pour prouver que l'environnement est imposé. */
const VARIABLES = {
  VITE_ENV: 'production',
  VITE_BASE_PATH: '/',
  VITE_APP_ORIGIN: 'https://exemple.test',
  VITE_GOOGLE_WEB_CLIENT_ID: 'client-de-test',
};

const ACCES: AccesObtenu = { porteesAccordees: [...PORTEES_LOT_1], identite: IDENTITE_A };

type Bindings = { donejuanFauxDrive?: PontDrive; donejuanFauxGoogle?: PontGoogle };

/** Page simulée, en ligne : `window` porte les bindings donnés, `navigator.onLine` vrai. */
const preparerPage = (bindings: Bindings): void => {
  const page = new EventTarget();
  const fenetre = new EventTarget();
  vi.stubGlobal('document', {
    visibilityState: 'visible',
    addEventListener: page.addEventListener.bind(page),
  });
  vi.stubGlobal('window', {
    addEventListener: fenetre.addEventListener.bind(fenetre),
    removeEventListener: fenetre.removeEventListener.bind(fenetre),
    ...bindings,
  });
  vi.stubGlobal('navigator', { onLine: true });
};

const navigateur = (): Navigateur & {
  readonly recharger: Mock<() => void>;
  readonly arreterNavigation: Mock<() => void>;
  readonly persisted: Mock<() => Promise<boolean>>;
} => {
  const persisted = vi.fn(() => Promise.resolve(true));
  return {
    variables: VARIABLES,
    agent: 'Mozilla/5.0 (Linux; Android 14) Mobile',
    pointsTactiles: 5,
    recharger: vi.fn<() => void>(),
    arreterNavigation: vi.fn<() => void>(),
    ouvrirOnglet: vi.fn<(url: string) => void>(),
    conteneurServiceWorker: undefined,
    gestionnaireStockage: { persisted, persist: persisted },
    persisted,
  };
};

/** Google simulé : accès accordé au compte A ; chaque appel est noté (méthode, arguments décodés). */
const googleSimule = () => {
  const recus: Array<readonly [string, unknown]> = [];
  const pont: PontGoogle = (methode, argumentsJson) => {
    recus.push([methode, decoderPont(argumentsJson)]);
    return Promise.resolve(encoderPont(methode === 'oublier' ? null : succes(ACCES)));
  };
  return { pont, recus };
};

/** Drive simulé : le `FauxDrive` vu par le smartphone, derrière le pont ; chaque méthode appelée est notée. */
const driveSimule = () => {
  const drive = new FauxDrive(new TempsSimule(instant('2026-10-21T08:00:00.000Z')));
  const vu = drive.transportPour(SMARTPHONE, {
    reseau: new ReseauCommandable(),
    accesAccorde: () => true,
  });
  const methodes: Array<string> = [];
  const pont: PontDrive = (methode, argumentsJson) => {
    methodes.push(methode);
    return repondrePontDrive(vu, methode, argumentsJson);
  };
  return { drive, pont, methodes };
};

const nomsDesBases = async (): Promise<ReadonlyArray<string | undefined>> =>
  (await indexedDB.databases()).map((b) => b.name);

const effacerBases = async (): Promise<void> => {
  for (const nom of await nomsDesBases()) {
    if (nom === undefined) continue;
    await new Promise<void>((resoudre, rejeter) => {
      const requete = indexedDB.deleteDatabase(nom);
      requete.onsuccess = () => {
        resoudre();
      };
      requete.onerror = () => {
        rejeter(new Error('effacement impossible'));
      };
    });
  }
};

/** Attente d'une condition sur des tâches réelles (IndexedDB simulée). */
const attendreQue = async (condition: () => boolean): Promise<void> => {
  for (let essai = 0; essai < 300 && !condition(); essai += 1) {
    await new Promise((resoudre) => setTimeout(resoudre, 10));
  }
  expect(condition()).toBe(true);
};

beforeEach(effacerBases);

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('demarrerWeb de la composition test-ihm (ST-US-018 §6.4 n° 5, §6.5)', () => {
  it.each<[string, Bindings]>([
    ['donejuanFauxDrive', { donejuanFauxGoogle: googleSimule().pont }],
    ['donejuanFauxGoogle', { donejuanFauxDrive: driveSimule().pont }],
  ])(
    'UT-COMP-US-018-14 binding %s absent — ErreurProgrammation au démarrage, avant toute ouverture (aucune base, stockage non lu)',
    async (absent, bindings) => {
      preparerPage(bindings);
      const page = navigateur();

      expect(() => demarrerWeb({ type: 'AUCUN' }, page)).toThrow(
        new ErreurProgrammation(`Binding absent de la page test-ihm : window.${absent}`),
      );
      await new Promise((resoudre) => setTimeout(resoudre, 20));
      expect(await nomsDesBases()).toEqual([]);
      expect(page.persisted).not.toHaveBeenCalled();
    },
  );

  it('UT-COMP-US-018-15 environnement imposé — VITE_ENV « production » reçu, base technique de recette ouverte, jamais celle de production', async () => {
    preparerPage({
      donejuanFauxDrive: driveSimule().pont,
      donejuanFauxGoogle: googleSimule().pont,
    });
    const page = navigateur();

    demarrerWeb({ type: 'AUCUN' }, page);
    await attendreQue(() => page.persisted.mock.calls.length > 0);

    expect(await nomsDesBases()).toEqual(['donejuan-recette-technique']);
  });

  it('UT-COMP-US-018-16 « Continuer avec Google » — un seul appel au Google simulé (CONNEXION, portées du lot 1, sans indice), aucune navigation ; le Drive est joint par le pont (dossier préparé dans le FauxDrive)', async () => {
    const google = googleSimule();
    const drive = driveSimule();
    preparerPage({ donejuanFauxDrive: drive.pont, donejuanFauxGoogle: google.pont });
    const page = navigateur();

    const { controleur } = demarrerWeb({ type: 'AUCUN' }, page);
    await attendreQue(() => page.persisted.mock.calls.length > 0);
    await controleur.continuerAvecGoogle();
    await attendreQue(() => controleur.vue().indicateur?.code === 'SYN-OK');

    expect(google.recus).toEqual([
      ['demanderJeton', [{ mode: 'CONNEXION', portees: [...PORTEES_LOT_1] }]],
    ]);
    expect(page.recharger).not.toHaveBeenCalled();
    expect(page.arreterNavigation).not.toHaveBeenCalled();
    expect(drive.methodes[0]).toBe('preparerDossier');
    // Premier cycle complet à travers le pont : dossier, manifeste, LISEZ-MOI et fichier de l'appareil, dans le dossier.
    const fichiers = drive.drive.fichiers();
    const dossier = fichiers[0]?.id;
    expect(fichiers.map((f) => [f.appProperties['donejuan'], f.parent])).toEqual([
      ['dossier', undefined],
      ['manifeste', dossier],
      ['lisezmoi', dossier],
      ['appareil', dossier],
    ]);
  });
});
