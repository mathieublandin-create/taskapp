// ST-US-031 §14 (rang 13, tranche D2) : coordination entre deux onglets sur Chromium réel, build `test-ihm` (pas de
// Google réel : les ponts `donejuanFauxGoogle` et `donejuanFauxDrive` répondent depuis ce processus). Le verrou
// « meneur » est celui du navigateur (`VerrouOngletsWeb` sur `navigator.locks`) : l'onglet ouvert le premier est meneur,
// le second attend la main et affiche `SYN-FEUILLE-AUTRE-ONGLET` dans la feuille ; à la fermeture du premier, le
// navigateur rend le verrou, le second devient meneur et la mention disparaît, sans message.
// Le build est produit par `pnpm build:test-ihm` (étape `cucumber:ihm` du job `ihm`) ; ce fichier ne le construit pas.
import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { BancSynchro } from '../support/banc/banc-synchro';
import { IDENTIFIANTS_APPAREILS } from '../support/banc/appareil-simule';
import { PontFauxDrive } from '../steps-ihm/support/pont-faux-drive';
import { PontFauxGoogle } from '../steps-ihm/support/pont-faux-google';
import { demarrerServeurIhm, ORIGINE_IHM, type ServeurIhm } from '../steps-ihm/support/serveur-ihm';

const COMPTE = 'A';
const DELAI_MS = 10_000;
const MENTION_AUTRE_ONGLET = '[data-etat="SYN-FEUILLE-AUTRE-ONGLET"]';
const INDICATEUR = 'div[role="status"][data-etat^="SYN-"]';
const VERROU_MENEUR = /:synchronisation-meneur$/;

type EtatVerrous = {
  readonly held: ReadonlyArray<{ name: string }>;
  readonly pending: ReadonlyArray<{ name: string }>;
};

let serveur: ServeurIhm;

test.beforeAll(async () => {
  serveur = await demarrerServeurIhm();
});

test.afterAll(async () => {
  await serveur.arreter();
});

/** Ponts Google et Drive du processus de test, sur un compte connecté à Google qui a accordé l'accès. */
const exposerLesPonts = async (context: BrowserContext): Promise<void> => {
  const banc = new BancSynchro();
  const google = new PontFauxGoogle(banc.google, banc.temps);
  google.ouvrirSession(COMPTE);
  const drive = new PontFauxDrive({
    google: banc.google,
    appareil: () => IDENTIFIANTS_APPAREILS.pc,
    compte: () => google.compteConnecte(),
  });
  await context.clock.setFixedTime(new Date(banc.temps.maintenant()));
  await context.exposeBinding('donejuanFauxGoogle', (_source, methode: string, json: string) =>
    google.repondre(methode, json),
  );
  await context.exposeBinding('donejuanFauxDrive', (_source, methode: string, json: string) =>
    drive.repondre(methode, json),
  );
};

const verrous = (page: Page): Promise<EtatVerrous> =>
  page.evaluate(() => navigator.locks.query() as Promise<EtatVerrous>);

const attendreSynchronisation = (page: Page) =>
  expect(page.locator(INDICATEUR).first()).toHaveAttribute('data-etat', 'SYN-OK', {
    timeout: DELAI_MS,
  });

/** Premier onglet connecté (meneur), puis second onglet ouvert sur la session partagée. */
const ouvrirDeuxOnglets = async (context: BrowserContext): Promise<readonly [Page, Page]> => {
  await exposerLesPonts(context);
  const premier = await context.newPage();
  await premier.goto(ORIGINE_IHM);
  await premier.getByRole('button', { name: /continuer avec google/i }).click();
  await attendreSynchronisation(premier);
  const second = await context.newPage();
  await second.goto(ORIGINE_IHM);
  await attendreSynchronisation(second);
  return [premier, second];
};

test.describe('Deux onglets, navigateur réel (ST-US-031 §14)', () => {
  test('le second onglet attend la main et affiche la mention « un autre onglet synchronise » ; à la fermeture du premier, il devient meneur et la mention disparaît', async ({
    context,
  }) => {
    const [premier, second] = await ouvrirDeuxOnglets(context);

    await expect(second.locator(MENTION_AUTRE_ONGLET)).toHaveCount(1, { timeout: DELAI_MS });
    await expect(premier.locator(MENTION_AUTRE_ONGLET)).toHaveCount(0);
    const avant = await verrous(second);
    expect(avant.held.filter(({ name }) => VERROU_MENEUR.test(name))).toHaveLength(1);
    expect(avant.pending.filter(({ name }) => VERROU_MENEUR.test(name))).toHaveLength(1);

    await premier.close();

    await expect(second.locator(MENTION_AUTRE_ONGLET)).toHaveCount(0, { timeout: DELAI_MS });
    const apres = await verrous(second);
    expect(apres.held.filter(({ name }) => VERROU_MENEUR.test(name))).toHaveLength(1);
    expect(apres.pending).toEqual([]);
  });
});
