// ST-CORR-E13B-LOT-001 §5 (tranche T5b) : ANO-005, feuille « Compte et synchronisation » modale (guide v0.2.26 §4.26,
// §6.6.15, §6.6.16 n° 5, critères b et c), sur l'application réelle : build `test-ihm` servi par le `webServer` de
// playwright.config.ts, Google et Drive simulés par les ponts du processus de test, compte A connecté.
// Rang 14 (rangs-tests.json).
import { expect, test, type Page } from '@playwright/test';
import { LIBELLE_ANNULER } from '../../src/commun/presentation/ui/boite-confirmation';
import { libelleActionCompte } from '../../src/compte/presentation/modeles-de-vue/section-compte';
import { LIBELLES_TACHES } from '../../src/objectifs-taches/presentation/ui/libelles-ui';
import { LIBELLES_FEUILLE } from '../../src/synchronisation/presentation/ui/libelles-feuille';
import { boite, centreDegage, ouvrirApplicationConnectee } from '../support/e2e/outils-navigateur';

const ouvrir = (page: Page) => page.getByRole('button', { name: LIBELLES_FEUILLE.ouvrir });
const feuille = (page: Page) => page.getByRole('dialog', { name: LIBELLES_FEUILLE.titre });
/** Contenu de la feuille (premier enfant de l'`ion-modal`) : sa boîte est la partie visible de la feuille. */
const contenu = (page: Page) => page.locator('ion-modal.feuille-synchronisation .feuille-contenu');
const supprimer = (page: Page) =>
  feuille(page).getByRole('button', { name: libelleActionCompte('SUPPRIMER_DONNEES') });

/** Crée `n` tâches par la saisie rapide, qui reste ouverte entre deux ajouts (guide §4.3), puis la ferme. */
const creerTaches = async (page: Page, n: number): Promise<void> => {
  await page.locator('ion-fab-button').click();
  const saisie = page.locator('ion-modal.saisie-rapide');
  for (let i = 1; i <= n; i += 1) {
    await saisie
      .getByLabel(LIBELLES_TACHES.champIntitule)
      .fill(`Tâche ${String(i).padStart(2, '0')}`);
    await saisie.getByLabel(LIBELLES_TACHES.champDelai).fill('2026-12-31');
    await saisie.getByRole('button', { name: LIBELLES_TACHES.stepper.plus }).click();
    await saisie.locator('ion-button', { hasText: LIBELLES_TACHES.ajouter }).click();
    await expect(page.locator('li.ligne-tache')).toHaveCount(i);
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('ion-modal.saisie-rapide[is-open]')).toHaveCount(0);
};

/** Position de défilement de la liste (`ion-content` de la vue Tâches). */
const defilement = (page: Page): Promise<number> =>
  page
    .locator('ion-content')
    .first()
    .evaluate(async (c) => (await (c as HTMLIonContentElement).getScrollElement()).scrollTop);

test.describe('Feuille de synchronisation à 390 × 844 (ANO-005)', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('E2E-ANO-005-FEUILLE-01 fermée au lancement ; ouverte par le bouton, elle occupe 0,92 de la hauteur et la liste derrière ne bouge pas (critère c)', async ({
    context,
  }) => {
    const page = await ouvrirApplicationConnectee(context);
    await expect(page.locator('[data-etat="SYN-FEUILLE-BOUTON"]')).toHaveCount(0);
    await expect(page.locator('section[aria-labelledby="compte-titre"]')).toHaveCount(0);
    await expect(ouvrir(page)).toHaveAttribute('aria-expanded', 'false');
    await creerTaches(page, 1);
    const avant = await boite(page.locator('li.ligne-tache').first());

    await ouvrir(page).click();
    await expect(feuille(page)).toBeVisible();
    await expect(ouvrir(page)).toHaveAttribute('aria-expanded', 'true');
    const visible = await boite(contenu(page));
    expect(Math.abs(visible.y - 844 * 0.08)).toBeLessThanOrEqual(3);
    expect(await boite(page.locator('li.ligne-tache').first())).toEqual(avant);
  });

  test('E2E-ANO-005-FEUILLE-02 contenu : « Synchronisation » avant « Compte » ; défilement interne jusqu’à la dernière action du compte, entièrement visible et dégagée', async ({
    context,
  }) => {
    const page = await ouvrirApplicationConnectee(context);
    await ouvrir(page).click();
    const bouton = feuille(page).locator('[data-etat="SYN-FEUILLE-BOUTON"]');
    const compte = feuille(page).locator('section[aria-labelledby="compte-titre"]');
    await expect(bouton).toHaveCount(1);
    await expect(compte).toHaveCount(1);
    const synchronisationAvantCompte = await feuille(page).evaluate((f) => {
      const b = f.querySelector('[data-etat="SYN-FEUILLE-BOUTON"]');
      const c = f.querySelector('section[aria-labelledby="compte-titre"]');
      return (
        b !== null &&
        c !== null &&
        (b.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
      );
    });
    expect(synchronisationAvantCompte).toBe(true);
    await supprimer(page).scrollIntoViewIfNeeded();
    await expect(supprimer(page)).toBeInViewport({ ratio: 1 });
    expect(await centreDegage(supprimer(page))).toBe(true);
  });

  test('E2E-ANO-005-FEUILLE-03 Échap ferme la feuille, le focus revient au bouton, la position de défilement de la liste est inchangée (critère b)', async ({
    context,
  }) => {
    const page = await ouvrirApplicationConnectee(context);
    await creerTaches(page, 14);
    await page.locator('li.ligne-tache').nth(8).scrollIntoViewIfNeeded();
    const position = await defilement(page);
    expect(position).toBeGreaterThan(0);

    await ouvrir(page).focus();
    await page.keyboard.press('Enter');
    await expect(feuille(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(feuille(page)).toHaveCount(0);
    await expect(ouvrir(page)).toBeFocused();
    expect(await defilement(page)).toBe(position);
  });

  test('E2E-ANO-005-FEUILLE-04 confirmation ouverte depuis la feuille : focus sur « Annuler », boutons dégagés et cliquables ; « Annuler » laisse la feuille ouverte, la confirmation mène à l’écran de connexion', async ({
    context,
  }) => {
    const page = await ouvrirApplicationConnectee(context);
    await ouvrir(page).click();
    await supprimer(page).click();
    const dialogue = page.getByRole('alertdialog');
    const annuler = dialogue.getByRole('button', { name: LIBELLE_ANNULER });
    await expect(annuler).toBeFocused();
    expect(await centreDegage(annuler)).toBe(true);
    await annuler.click();
    await expect(dialogue).toHaveCount(0);
    await expect(feuille(page)).toBeVisible();

    await supprimer(page).click();
    const confirmer = page.getByRole('alertdialog').getByRole('button').filter({
      hasNotText: LIBELLE_ANNULER,
    });
    expect(await centreDegage(confirmer)).toBe(true);
    await confirmer.click();
    await expect(page.getByRole('button', { name: /continuer avec google/i })).toBeVisible({
      timeout: 10_000,
    });
  });
});

test.describe('Feuille de synchronisation à 1280 × 800 (ANO-005)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('E2E-ANO-005-FEUILLE-05 panneau de 400 px à droite, pleine hauteur ; la confirmation ouverte depuis le panneau est cliquable', async ({
    context,
  }) => {
    const page = await ouvrirApplicationConnectee(context);
    await ouvrir(page).click();
    await expect(feuille(page)).toBeVisible();
    const panneau = await boite(contenu(page));
    expect(Math.abs(panneau.x - 880)).toBeLessThanOrEqual(1);
    expect(Math.abs(panneau.width - 400)).toBeLessThanOrEqual(1);
    expect(Math.abs(panneau.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(panneau.height - 800)).toBeLessThanOrEqual(1);

    await supprimer(page).click();
    const annuler = page.getByRole('alertdialog').getByRole('button', { name: LIBELLE_ANNULER });
    await expect(annuler).toBeFocused();
    expect(await centreDegage(annuler)).toBe(true);
    await annuler.click();
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(feuille(page)).toBeVisible();
  });
});

// Ajout de l'E13 des tranches T1 à T3 (revue-code-LOT-001-corr-e13b-t1t3.md, RC-CORR-3 ; ST-CORR v0.2 §5.2 bis) : les
// trois rustines de mise en page de T2 et T3 sont retirées par T5b, parce que le compte et la feuille ne sont plus
// dans la page (`overflow: hidden` de `ion-content.contenu-avec-fab`, `overflow-y: auto` de `.espace-application`,
// `flex: 1 0 auto` et `min-height: 70dvh` de `.espaces`). Sur l'application réelle : la page ne défile pas, la liste
// occupe l'espace restant, et la dernière ligne reste atteignable au défilement de la liste.
for (const [largeur, hauteur] of [
  [390, 844],
  [360, 480],
] as const) {
  test.describe(`Mise en page de l’espace à ${String(largeur)} × ${String(hauteur)} (rustines de T2 et T3 retirées)`, () => {
    test.use({ viewport: { width: largeur, height: hauteur }, hasTouch: true });

    test(`E2E-ANO-005-FEUILLE-06 la page ne défile pas, la liste occupe plus de la moitié de l’écran, la dernière tâche est atteignable (${String(largeur)} × ${String(hauteur)})`, async ({
      context,
    }) => {
      const page = await ouvrirApplicationConnectee(context);
      const mesures = await page.evaluate(() => {
        const espace = document.querySelector('main.espace-application');
        const espaces = document.querySelector('.espaces');
        const liste = document.querySelector('ion-content.contenu-avec-fab');
        if (espace === null || espaces === null || liste === null)
          throw new Error('mise en page absente');
        return {
          pageDefilable: espace.scrollHeight - espace.clientHeight,
          overflowEspace: getComputedStyle(espace).overflowY,
          minHauteurEspaces: getComputedStyle(espaces).minHeight,
          flexEspaces:
            getComputedStyle(espaces).flexGrow +
            ' ' +
            getComputedStyle(espaces).flexShrink +
            ' ' +
            getComputedStyle(espaces).flexBasis,
          overflowListe: getComputedStyle(liste).overflow,
          hauteurListe: liste.getBoundingClientRect().height,
        };
      });
      expect(mesures.pageDefilable).toBeLessThanOrEqual(0);
      expect(mesures.overflowEspace).toBe('visible');
      expect(mesures.minHauteurEspaces).toBe('0px');
      expect(mesures.flexEspaces).toBe('1 1 0%');
      expect(mesures.overflowListe).toBe('visible');
      expect(mesures.hauteurListe).toBeGreaterThan(hauteur / 2);

      await creerTaches(page, 8);
      const derniere = page.locator('li.ligne-tache').last();
      await derniere.scrollIntoViewIfNeeded();
      await expect(derniere).toBeInViewport({ ratio: 1 });
      expect(await centreDegage(derniere.locator('button[data-etat]'))).toBe(true);
      const fab = await boite(page.locator('ion-fab-button'));
      const ligne = await boite(derniere);
      expect(ligne.y + ligne.height).toBeLessThanOrEqual(fab.y + 0.5);
    });
  });
}
