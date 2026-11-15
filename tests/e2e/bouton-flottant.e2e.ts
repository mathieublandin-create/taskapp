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

  // v0.3 (arbitrage de T4) : la zone contrôlée est la zone visible de la liste (boîte de l'`ion-content` qui porte le
  // « + »), et non toute la fenêtre : une ligne dont le centre est sous la barre d'en-tête, hors de la liste, n'est pas
  // une ligne visible. Le test exige au moins 5 lignes contrôlées, dont la dernière, pour ne jamais passer à vide.
  test('E2E-ANO-005-FAB-03 au bout du défilement, le centre de chaque ligne visible dans la liste est dégagé et le toucher au centre de la dernière ouvre son détail', async ({
    page,
  }) => {
    await ouvrirHarnais(page, 15);
    const lignes = page.locator('li.ligne-tache');
    const contenu = page.locator('ion-content.contenu-avec-fab').first();
    await contenu.evaluate(async (element) => {
      await (element as HTMLIonContentElement).scrollToBottom(0);
    });
    const zone = await boite(contenu);
    const centreDansLaListe = (b: { y: number; height: number }): boolean => {
      const y = b.y + b.height / 2;
      return y > zone.y && y < zone.y + zone.height;
    };
    const boutons = await lignes.locator('button[data-etat]').all();
    let controlees = 0;
    for (const bouton of boutons) {
      const b = await bouton.boundingBox();
      if (b !== null && centreDansLaListe(b)) {
        expect(await centreDegage(bouton)).toBe(true);
        controlees += 1;
      }
    }
    expect(controlees).toBeGreaterThanOrEqual(5);
    const derniere = lignes.last().locator('button[data-etat]');
    expect(centreDansLaListe(await boite(derniere))).toBe(true);
    await derniere.tap();
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

  // v0.3 (arbitrage de T4) : le seuil est protégé à sa borne exacte (600 : colonne ; 599 : pleine largeur) et entre les
  // deux tailles de référence (650 : colonne de 650 px, centrée à 0) ; un seuil déplacé à 640 ou 768 rougit.
  test('E2E-ANO-005-FAB-05 colonne de 720 px centrée à 768 × 1024 ; à 650 et à 600 px, colonne à la largeur de la fenêtre (≤ 720) par la règle de colonne ; à 599 × 844 : pleine largeur sans la règle', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await ouvrirHarnais(page);
    const colonne = await boite(page.locator('.espaces'));
    expect(colonne.width).toBeCloseTo(720, 0);
    expect(colonne.x).toBeCloseTo(24, 0);
    const largeurMax = () => page.locator('.espaces').evaluate((e) => getComputedStyle(e).maxWidth);
    for (const largeur of [650, 600]) {
      await page.setViewportSize({ width: largeur, height: 844 });
      await expect
        .poll(async () => Math.round((await boite(page.locator('.espaces'))).width))
        .toBe(largeur);
      expect(await largeurMax()).toBe('720px');
    }
    await page.setViewportSize({ width: 599, height: 844 });
    await expect
      .poll(async () => Math.round((await boite(page.locator('.espaces'))).width))
      .toBe(599);
    expect(await largeurMax()).toBe('none');
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
