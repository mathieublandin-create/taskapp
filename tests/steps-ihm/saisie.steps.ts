/**
 * Saisies des scénarios `@ihm` (ST-US-018 v0.4 §12.2 n° 8 ; ST-US-031 §12.1 n° 5) : par rôles accessibles et libellés
 * de l'interface (`LIBELLES_TACHES`, ECR-002, ECR-007), comme un utilisateur ; aucun libellé recopié.
 */
import { When } from '@cucumber/cucumber';
import { expect, type Page } from '@playwright/test';
import { PAS_DUREE_MINUTES } from '@src/commun/domaine/duree';
import { LIBELLES_TACHES } from '@src/objectifs-taches/presentation/ui/libelles-ui';
import type { NomAppareil } from '../support/banc/appareil-simule';
import { ligneTache } from './support/ecrans-ihm';
import type { MondeIhm } from './support/monde-ihm';

const bouton = (page: Page, nom: string) => page.getByRole('button', { name: nom, exact: true });

/** Feuille de saisie d'une tâche ou d'une sous-tâche : ses champs ne se confondent pas avec ceux du détail dessous. */
const feuilleDeSaisie = (page: Page) => page.locator('ion-modal[is-open]');

/**
 * Ouvre le détail de la tâche (ECR-007) depuis la liste. Le libellé du bouton flottant « Ajouter une tâche » recouvre
 * le centre de la dernière ligne visible : la ligne est touchée à son bord gauche, comme le ferait un utilisateur.
 */
const ouvrirDetail = async (page: Page, intitule: string): Promise<void> => {
  await ligneTache(page, intitule)
    .locator('button[data-etat]')
    .click({ position: { x: 16, y: 16 } });
  await expect(page.getByRole('heading', { level: 1, name: intitule })).toBeVisible();
};

/** Retour du détail à la liste : le bouton de l'en-tête, distinct de l'onglet « Tâches » de la barre du bas. */
const retournerALaListe = (page: Page): Promise<void> =>
  page.locator('ion-header').getByRole('button', { name: LIBELLES_TACHES.retourListe }).click();

When(
  "sur le {appareil}, l'utilisateur renomme la tâche {string} en {string}",
  async function (this: MondeIhm, appareil: NomAppareil, ancien: string, nouveau: string) {
    this.exigerAppareil(appareil);
    const page = await this.pageCourante();
    await ouvrirDetail(page, ancien);
    await bouton(page, LIBELLES_TACHES.menuActions).click();
    await bouton(page, LIBELLES_TACHES.menu.RENOMMER).click();
    await page.getByLabel(LIBELLES_TACHES.renommage).fill(nouveau);
    await bouton(page, LIBELLES_TACHES.enregistrer).click();
    await expect(page.getByRole('heading', { level: 1, name: nouveau })).toBeVisible();
    await retournerALaListe(page);
  },
);

When(
  "sur le {appareil}, l'utilisateur commence la saisie d'une sous-tâche de la tâche {string}",
  async function (this: MondeIhm, appareil: NomAppareil, parente: string) {
    this.exigerAppareil(appareil);
    const page = await this.pageCourante();
    await ouvrirDetail(page, parente);
    await bouton(page, LIBELLES_TACHES.ajouterSousTache).click();
    await expect(feuilleDeSaisie(page).getByLabel(LIBELLES_TACHES.champIntitule)).toBeVisible();
  },
);

When(
  "sur le {appareil}, l'utilisateur saisit l'intitulé {string}, le délai {date} et l'estimation {duree}",
  async function (
    this: MondeIhm,
    appareil: NomAppareil,
    intitule: string,
    delai: string,
    minutes: number,
  ) {
    this.exigerAppareil(appareil);
    const page = await this.pageCourante();
    const feuille = feuilleDeSaisie(page);
    await feuille.getByLabel(LIBELLES_TACHES.champIntitule).fill(intitule);
    await feuille.getByLabel(LIBELLES_TACHES.champDelai).fill(delai);
    for (let pas = 0; pas < minutes / PAS_DUREE_MINUTES; pas += 1) {
      await bouton(page, LIBELLES_TACHES.stepper.plus).click();
    }
  },
);

When("l'utilisateur termine la saisie", async function (this: MondeIhm) {
  const page = await this.pageCourante();
  await bouton(page, LIBELLES_TACHES.ajouter).click();
  await expect(page.locator('[data-etat="TST-AJOUTEE"]')).toBeVisible();
  // La feuille reste ouverte, vide, après l'ajout (guide §4.3) : Échap la ferme, comme le fait l'utilisateur.
  await page.keyboard.press('Escape');
  await expect(feuilleDeSaisie(page)).toHaveCount(0);
});
