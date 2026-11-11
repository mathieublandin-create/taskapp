// ANO-007 et DT-024 : dans un navigateur réel, le fond (`ion-backdrop`) ne recouvre pas les boutons des boîtes
// (confirmation, sélecteur de parent, refus « Compris ») : un clic souris et un toucher à 390 × 844 les atteignent,
// sans `force` ; un clic sur le fond, lui, ne déclenche rien (guide §6.6.7).
import { expect, test, type Page } from '@playwright/test';
import { ORIGINE_HARNAIS } from '../support/harnais/port';

type Geste = 'clic' | 'toucher';
type Boite = 'confirmation' | 'selecteur' | 'refus';

const ouvrir = async (page: Page, boite: Boite): Promise<void> => {
  await page.goto(`${ORIGINE_HARNAIS}/tests/support/harnais/boites.html?boite=${boite}`);
};
const appels = (page: Page) =>
  page.evaluate(() => (window as unknown as { __appels: string[] }).__appels);
const agir = async (page: Page, geste: Geste, nom: string): Promise<void> => {
  const bouton = page.getByRole('button', { name: nom, exact: true });
  await (geste === 'clic' ? bouton.click() : bouton.tap());
};

const gestes: ReadonlyArray<{ geste: Geste; ecran: { width: number; height: number } }> = [
  { geste: 'clic', ecran: { width: 1280, height: 800 } },
  { geste: 'toucher', ecran: { width: 390, height: 844 } },
];

for (const { geste, ecran } of gestes) {
  test.describe(`Boîtes : ${geste} à ${String(ecran.width)} × ${String(ecran.height)} (ANO-007)`, () => {
    test.use({ viewport: ecran, hasTouch: geste === 'toucher' });

    test('boîte de confirmation : « Annuler » et l’action atteignent leur bouton', async ({
      page,
    }) => {
      await ouvrir(page, 'confirmation');
      await agir(page, geste, 'Annuler');
      await agir(page, geste, 'Supprimer');
      expect(await appels(page)).toEqual(['annuler', 'confirmer']);
    });

    test('sélecteur de parent : « Annuler » et « Valider » atteignent leur bouton', async ({
      page,
    }) => {
      await ouvrir(page, 'selecteur');
      await agir(page, geste, 'Annuler');
      await page.getByRole('radio', { name: 'Développer mon activité' }).check();
      await agir(page, geste, 'Valider');
      expect(await appels(page)).toEqual(['fermer', 'choisir']);
    });

    test('refus bloquant du sélecteur : « Compris » atteint son bouton', async ({ page }) => {
      await ouvrir(page, 'refus');
      await agir(page, geste, 'Compris');
      expect(await appels(page)).toEqual(['refus-compris']);
    });
  });
}

test.describe('Fond des boîtes (DT-024)', () => {
  for (const boite of ['confirmation', 'selecteur', 'refus'] as const) {
    test(`${boite} : un clic sur le fond ne déclenche aucun rappel et la boîte reste ouverte`, async ({
      page,
    }) => {
      await ouvrir(page, boite);
      await page.mouse.click(5, 5);
      expect(await appels(page)).toEqual([]);
      await expect(page.getByRole(boite === 'selecteur' ? 'dialog' : 'alertdialog')).toBeVisible();
    });
  }
});
