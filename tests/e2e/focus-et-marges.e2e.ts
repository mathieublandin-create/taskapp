// ST-CORR-E13B-LOT-001 §2 (tranche T2) : DT-034 points 1 et 3 (guide v0.2.26 §2.2, §6.6.16 n° 1 ; WCAG 2.4.7, 2.4.11).
// Anneau de focus global (2 px, plein, `--dj-focus`, décalé de 2 px ; -2 px pour les éléments pleine largeur), aucun
// anneau au clic, zone sûre du bas (`viewport-fit=cover`, `env(safe-area-inset-bottom)` sur la barre d'onglets), réserve
// de 88 px sous le « + ». Harnais de l'écran connecté (smartphone 390 × 844) et build de production (connexion).
// Rang 14 (rangs-tests.json) : exclus par `grepInvert` tant que `rangCourant` < 14.
import { expect, test, type Page } from '@playwright/test';
import {
  boite,
  centreDegage,
  COULEUR_FOCUS,
  contourDuFocus,
  ouvrirHarnais,
  tabulerJusqua,
} from '../support/e2e/outils-navigateur';

const ANNEAU_EXTERIEUR = {
  style: 'solid',
  largeur: '2px',
  couleur: COULEUR_FOCUS,
  decalage: '2px',
};
const ANNEAU_INTERIEUR = { ...ANNEAU_EXTERIEUR, decalage: '-2px' };

const ongletObjectifs = (page: Page) =>
  page.getByRole('navigation', { name: 'Espaces' }).getByRole('button', { name: 'Objectifs' });

test.describe('Focus visible et marges à 390 × 844 (DT-034)', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('E2E-DT-034-01 onglet de la barre focalisé au clavier : anneau intérieur (2 px, plein, couleur du jeton, -2 px)', async ({
    page,
  }) => {
    await ouvrirHarnais(page);
    await tabulerJusqua(page, ongletObjectifs(page));
    expect(await contourDuFocus(page)).toEqual(ANNEAU_INTERIEUR);
  });

  test('E2E-DT-034-02 « + » focalisé au clavier : anneau extérieur (2 px, plein, couleur du jeton, 2 px)', async ({
    page,
  }) => {
    await ouvrirHarnais(page);
    await tabulerJusqua(page, page.locator('ion-fab-button'));
    expect(await contourDuFocus(page)).toEqual(ANNEAU_EXTERIEUR);
  });

  test('E2E-DT-034-03 ligne de tâche : la case « Terminer » et le bouton de la ligne ont l’anneau intérieur (-2 px)', async ({
    page,
  }) => {
    await ouvrirHarnais(page, 1);
    const ligne = page.locator('li.ligne-tache').first();
    await tabulerJusqua(page, ligne.locator('input[type="checkbox"]'));
    expect(await contourDuFocus(page)).toEqual(ANNEAU_INTERIEUR);
    await tabulerJusqua(page, ligne.locator('button[data-etat]'));
    expect(await contourDuFocus(page)).toEqual(ANNEAU_INTERIEUR);
  });

  test('E2E-DT-034-04 IonButton de la saisie rapide (« Ajouter ») focalisé au clavier : anneau extérieur', async ({
    page,
  }) => {
    await ouvrirHarnais(page);
    await page.locator('ion-fab-button').click();
    const ajouter = page.locator('ion-modal ion-button', { hasText: 'Ajouter' });
    await expect(ajouter).toBeVisible();
    await tabulerJusqua(page, ajouter);
    expect(await contourDuFocus(page)).toEqual(ANNEAU_EXTERIEUR);
  });

  test('E2E-DT-034-05 aucun anneau après un clic de souris sur un onglet', async ({ page }) => {
    await ouvrirHarnais(page);
    await ongletObjectifs(page).click();
    await expect(ongletObjectifs(page)).toBeFocused();
    expect(await contourDuFocus(page)).toBeUndefined();
  });

  test('E2E-DT-034-07 zone sûre : viewport-fit=cover déclaré ; la barre d’onglets réserve env(safe-area-inset-bottom) en bas', async ({
    page,
  }) => {
    await ouvrirHarnais(page);
    const reglesBarre = await page.evaluate(() =>
      Array.from(document.styleSheets)
        .flatMap((feuille) => Array.from(feuille.cssRules))
        .filter((r): r is CSSStyleRule => r instanceof CSSStyleRule)
        .filter((r) => r.selectorText === '.barre-onglets')
        .map((r) => r.style.getPropertyValue('padding-bottom')),
    );
    expect(reglesBarre).toContain('env(safe-area-inset-bottom)');
  });

  test('E2E-DT-034-08 réserve de 88 px : au clavier, la dernière ligne et son bouton sont entièrement visibles, jamais recouverts par le « + » ni par la barre (2.4.11)', async ({
    page,
  }) => {
    await ouvrirHarnais(page, 15);
    const derniere = page.locator('li.ligne-tache').last();
    const bouton = derniere.locator('button[data-etat]');
    await tabulerJusqua(page, bouton, 120);
    await expect(bouton).toBeInViewport({ ratio: 1 });
    expect(await centreDegage(bouton)).toBe(true);
    expect(await centreDegage(derniere.locator('input[type="checkbox"]'))).toBe(true);
    const fab = await boite(page.locator('ion-fab-button'));
    const ligne = await boite(derniere);
    expect(ligne.y + ligne.height).toBeLessThanOrEqual(fab.y + 0.5);
  });
});

test.describe('Focus visible du build de production (DT-034)', () => {
  test('E2E-DT-034-06 « Continuer avec Google » (bouton natif) focalisé au clavier : anneau extérieur ; viewport-fit=cover dans la page servie', async ({
    page,
  }) => {
    await page.goto('/');
    const bouton = page.getByRole('button', { name: /continuer avec google/i });
    await expect(bouton).toBeVisible();
    await tabulerJusqua(page, bouton);
    expect(await contourDuFocus(page)).toEqual(ANNEAU_EXTERIEUR);
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      'content',
      /viewport-fit=cover/,
    );
  });
});
