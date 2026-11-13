// ST-CORR-E13B-LOT-001 §6 (tranche T4) : ANO-005, « + » rond de 56 px sans étiquette, à 16 px du bord droit de la
// colonne et au-dessus de la barre ; colonne de contenu de 720 px centrée dès 600 px ; un toucher au centre de chaque
// ligne visible, y compris la dernière, ouvre son détail (guide v0.2.26 §2.2, §6.6.16 n° 5, critère a).
// Harnais de l'écran connecté. Rang 14 (rangs-tests.json).
import { expect, test } from '@playwright/test';
import {
  LIBELLES_OBJECTIFS,
  LIBELLES_TACHES,
} from '../../src/objectifs-taches/presentation/ui/libelles-ui';
import { boite, centreDegage, ouvrirHarnais } from '../support/e2e/outils-navigateur';

test.describe('« + » à 390 × 844 (ANO-005)', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('E2E-ANO-005-FAB-01 rond de 56 px, sans étiquette visible : le seul texte de ion-fab est « + »', async ({
    page,
  }) => {
    await ouvrirHarnais(page);
    const fab = await boite(page.locator('ion-fab-button'));
    expect(fab.width).toBeCloseTo(56, 0);
    expect(fab.height).toBeCloseTo(56, 0);
    expect((await page.locator('ion-fab').innerText()).trim()).toBe('+');
    await expect(page.locator('.bouton-flottant-etiquette')).toHaveCount(0);
  });

  test('E2E-ANO-005-FAB-02 position : 16 px du bord droit, 16 px au-dessus de la barre d’onglets', async ({
    page,
  }) => {
    await ouvrirHarnais(page);
    const fab = await boite(page.locator('ion-fab-button'));
    const barre = await boite(page.getByRole('navigation', { name: 'Espaces' }));
    expect(390 - (fab.x + fab.width)).toBeCloseTo(16, 0);
    expect(barre.y - (fab.y + fab.height)).toBeCloseTo(16, 0);
  });

  test('E2E-ANO-005-FAB-03 au bout du défilement, le centre de chaque ligne visible est dégagé et le toucher au centre de la dernière ouvre son détail', async ({
    page,
  }) => {
    await ouvrirHarnais(page, 15);
    const lignes = page.locator('li.ligne-tache');
    await lignes.last().scrollIntoViewIfNeeded();
    await page
      .locator('ion-content')
      .first()
      .evaluate(async (contenu) => {
        await (contenu as HTMLIonContentElement).scrollToBottom(0);
      });
    for (const ligne of await lignes.all()) {
      const bouton = ligne.locator('button[data-etat]');
      if (await bouton.isVisible()) {
        const visible = await bouton.evaluate((e) => {
          const b = e.getBoundingClientRect();
          const y = b.top + b.height / 2;
          return y > 0 && y < window.innerHeight;
        });
        if (visible) expect(await centreDegage(bouton)).toBe(true);
      }
    }
    await lignes.last().locator('button[data-etat]').tap();
    await expect(page.getByRole('heading', { level: 1, name: 'Tâche 15' })).toBeVisible();
  });
});

test.describe('Colonne de 720 px (ANO-005)', () => {
  test('E2E-ANO-005-FAB-04 à 1280 × 800 : colonne de 720 px centrée, barre d’onglets à la largeur de la colonne, « + » à 16 px du bord droit de la colonne', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await ouvrirHarnais(page);
    const colonne = await boite(page.locator('.espaces'));
    expect(colonne.width).toBeCloseTo(720, 0);
    expect(colonne.x).toBeCloseTo(280, 0);
    const barre = await boite(page.getByRole('navigation', { name: 'Espaces' }));
    expect(barre.width).toBeCloseTo(720, 0);
    expect(barre.x).toBeCloseTo(280, 0);
    const fab = await boite(page.locator('ion-fab-button'));
    expect(280 + 720 - (fab.x + fab.width)).toBeCloseTo(16, 0);
  });

  test('E2E-ANO-005-FAB-05 à 768 × 1024 : colonne de 720 px centrée ; à 599 × 844 : pleine largeur', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await ouvrirHarnais(page);
    const colonne = await boite(page.locator('.espaces'));
    expect(colonne.width).toBeCloseTo(720, 0);
    expect(colonne.x).toBeCloseTo(24, 0);
    await page.setViewportSize({ width: 599, height: 844 });
    await expect
      .poll(async () => Math.round((await boite(page.locator('.espaces'))).width))
      .toBe(599);
  });

  test('E2E-ANO-005-FAB-06 les « + » des deux onglets se distinguent par leur nom accessible et leur title (remplace le contrôle du libellé visible d’ANO-002)', async ({
    page,
  }) => {
    await ouvrirHarnais(page);
    const fab = page.locator('ion-fab-button');
    await expect(fab).toHaveAttribute('aria-label', LIBELLES_TACHES.ajouterTache);
    await expect(fab).toHaveAttribute('title', LIBELLES_TACHES.ajouterTache);
    await page.getByRole('button', { name: 'Objectifs' }).click();
    await expect(fab).toHaveAttribute('aria-label', LIBELLES_OBJECTIFS.creerObjectif);
    await expect(fab).toHaveAttribute('title', LIBELLES_OBJECTIFS.creerObjectif);
  });
});
