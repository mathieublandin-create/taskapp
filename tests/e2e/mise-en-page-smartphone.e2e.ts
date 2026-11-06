// ANO-002 (issue #30) et ANO-003 (issue #31) : mise en page de l'écran connecté à la largeur d'un smartphone, sur le
// harnais tests/support/harnais/ (session simulée). Guide d'ergonomie §2.2 et §4.14 : barre d'onglets en bas, « + » dans
// la zone du pouce, contenu défilant dans la hauteur de l'écran.
import { expect, test, type Page } from '@playwright/test';

const HAUTEUR = 844;
const HARNAIS = 'http://localhost:4174/tests/support/harnais/ecran-connecte.html';

test.use({ viewport: { width: 390, height: HAUTEUR }, hasTouch: true });

const ouvrirObjectifs = async (page: Page): Promise<void> => {
  await page.goto(HARNAIS);
  await page.getByRole('button', { name: 'Objectifs' }).click();
};

const etatLocal = (page: Page) =>
  page.evaluate(() => (window as unknown as { __etatLocal: () => Promise<unknown> }).__etatLocal());

test.describe('Écran connecté à 390 × 844 (ANO-002, ANO-003)', () => {
  test('la barre d’onglets est en bas, l’onglet actif est indiqué', async ({ page }) => {
    await page.goto(HARNAIS);
    const barre = page.getByRole('navigation', { name: 'Espaces' });
    const boite = await barre.boundingBox();
    expect(boite).not.toBeNull();
    expect((boite?.y ?? 0) + (boite?.height ?? 0)).toBeGreaterThan(HAUTEUR - 4);
    await expect(page.getByRole('button', { name: 'Tâches' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    for (const bouton of await barre.getByRole('button').all()) {
      expect((await bouton.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('le contenu occupe la hauteur de l’écran et le « + » est dans le tiers inférieur', async ({
    page,
  }) => {
    await ouvrirObjectifs(page);
    const bouton = page.locator('ion-fab-button');
    await expect(bouton).toBeVisible();
    const contenu = await page.locator('ion-content').boundingBox();
    expect(contenu?.height).toBeGreaterThan(300);
    const posture = await bouton.boundingBox();
    expect(posture?.y).toBeGreaterThan((HAUTEUR * 2) / 3);
    expect((posture?.y ?? 0) + (posture?.height ?? 0)).toBeLessThanOrEqual(HAUTEUR);
  });

  test('« Créer un objectif » de l’onglet Objectifs crée un objectif, jamais une tâche', async ({
    page,
  }) => {
    await ouvrirObjectifs(page);
    await page.locator('ion-fab-button').click();
    await expect(page.getByRole('form', { name: 'Nouvel objectif' })).toBeVisible();
    await page.getByLabel('Intitulé').fill('Publier le guide');
    await page.getByRole('button', { name: 'Créer l’objectif' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Publier le guide' })).toBeVisible();
    expect(await etatLocal(page)).toEqual({ objectifs: 1, taches: 0 });
  });

  test('les « + » des deux onglets se distinguent par leur libellé visible', async ({ page }) => {
    await page.goto(HARNAIS);
    await expect(page.locator('ion-fab')).toContainText('Ajouter une tâche');
    await page.getByRole('button', { name: 'Objectifs' }).click();
    await expect(page.locator('ion-fab')).toContainText('Créer un objectif');
  });
});
