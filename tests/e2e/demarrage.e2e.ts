// ST-US-018 v0.4 §6.1, §14 (rang 12, tranche D2) : démarrage du build de production en navigateur réel : fragment
// de redirection effacé avant le premier rendu (RED-02), service worker qui sert l'application hors ligne, accessibilité.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const BOUTON_CONNEXION = { name: /continuer avec google/i };

/** Page chargée, service worker installé et actif (le précache est alors complet). */
const attendreServiceWorkerActif = (page: Page): Promise<void> =>
  page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });

test.describe('Démarrage du build de production (ST-US-018 §14)', () => {
  test('RED-02 : le fragment de retour de redirection est effacé dès le premier rendu', async ({
    page,
  }) => {
    await page.goto('/#access_token=jeton-de-test&state=inconnu&token_type=Bearer&expires_in=3600');

    await expect(page.getByRole('button', BOUTON_CONNEXION)).toBeVisible();
    expect(await page.evaluate(() => location.hash)).toBe('');
    expect(page.url()).not.toContain('access_token');
  });

  test('après une première visite en ligne, le rechargement hors ligne affiche l’application (service worker)', async ({
    page,
    context,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('button', BOUTON_CONNEXION)).toBeVisible();
    await attendreServiceWorkerActif(page);
    await page.reload();
    expect(await page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);

    await context.setOffline(true);
    await page.reload();

    await expect(page.getByRole('button', BOUTON_CONNEXION)).toBeVisible();
    expect(await page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);
  });

  test('aucune violation d’accessibilité serious ou critical sur l’écran de connexion', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('button', BOUTON_CONNEXION)).toBeVisible();

    const { violations } = await new AxeBuilder({ page }).analyze();

    const graves = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(graves.map((v) => v.id)).toEqual([]);
  });
});
