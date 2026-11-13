// ST-US-031 §14 (rang 13, tranche D2) : coordination entre deux onglets sur Chromium réel, build `test-ihm` (pas de
// Google réel : les ponts `donejuanFauxGoogle` et `donejuanFauxDrive` répondent depuis ce processus). Le verrou
// « meneur » est celui du navigateur (`VerrouOngletsWeb` sur `navigator.locks`) : l'onglet ouvert le premier est meneur,
// le second attend la main et affiche `SYN-FEUILLE-AUTRE-ONGLET` dans la feuille ; à la fermeture du premier, le
// navigateur rend le verrou, le second devient meneur et la mention disparaît, sans message.
// Le build est produit par `pnpm build:test-ihm` (étape `cucumber:ihm` du job `ihm`) ; il est servi par le `webServer`
// de playwright.config.ts, partagé avec les autres fichiers qui l'utilisent (ST-CORR-E13B-LOT-001 §9.2).
import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { ORIGINE_IHM } from '../steps-ihm/support/serveur-ihm';
import { exposerLesPonts } from '../support/e2e/outils-navigateur';

const DELAI_MS = 10_000;
const MENTION_AUTRE_ONGLET = '[data-etat="SYN-FEUILLE-AUTRE-ONGLET"]';
const INDICATEUR = 'div[role="status"][data-etat^="SYN-"]';
const SUFFIXE_VERROU_MENEUR = ':synchronisation-meneur';

type EtatVerrous = {
  readonly held: ReadonlyArray<{ name: string }>;
  readonly pending: ReadonlyArray<{ name: string }>;
};

const verrous = (page: Page): Promise<EtatVerrous> =>
  page.evaluate(() => navigator.locks.query() as Promise<EtatVerrous>);

const attendreSynchronisation = (page: Page) =>
  expect(page.locator(INDICATEUR).first()).toHaveAttribute('data-etat', 'SYN-OK', {
    timeout: DELAI_MS,
  });

/** Premier onglet connecté (meneur), puis second onglet ouvert sur la session partagée. */
const ouvrirDeuxOnglets = async (context: BrowserContext): Promise<readonly [Page, Page]> => {
  await exposerLesPonts(context, 'A');
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
    expect(avant.held.filter(({ name }) => name.endsWith(SUFFIXE_VERROU_MENEUR))).toHaveLength(1);
    expect(avant.pending.filter(({ name }) => name.endsWith(SUFFIXE_VERROU_MENEUR))).toHaveLength(
      1,
    );

    await premier.close();

    await expect(second.locator(MENTION_AUTRE_ONGLET)).toHaveCount(0, { timeout: DELAI_MS });
    const apres = await verrous(second);
    expect(apres.held.filter(({ name }) => name.endsWith(SUFFIXE_VERROU_MENEUR))).toHaveLength(1);
    expect(apres.pending).toEqual([]);
  });
});
