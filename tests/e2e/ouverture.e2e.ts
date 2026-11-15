// ST-CORR-E13B-LOT-001 §7 (tranche T6) : ANO-004, cadre neutre à l'ouverture (guide v0.2.26 §6.2, §6.6.16 n° 4). Un
// observateur de mutations, installé avant tout script de la page, relève l'ordre d'apparition des écrans : cadre
// neutre (`main[aria-busy="true"]`), invitation à se connecter (« Continuer avec Google »), espace de l'application.
// Réouverture d'une session : build `test-ihm` ; sans session : build de production. Rang 14 (rangs-tests.json).
import { expect, test, type Page } from '@playwright/test';
import { ouvrirApplicationConnectee } from '../support/e2e/outils-navigateur';

type Releve = {
  readonly ecrans: ReadonlyArray<'CADRE' | 'CONNEXION' | 'ESPACE'>;
  /** Texte et attributs `data-*` du cadre neutre, relevés à son apparition. */
  readonly cadres: ReadonlyArray<{
    readonly texte: string;
    readonly donnees: ReadonlyArray<string>;
  }>;
};

/** Installe l'observateur pour le prochain chargement de la page. */
const observerLesEcrans = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    const releve: {
      ecrans: Array<string>;
      cadres: Array<{ texte: string; donnees: Array<string> }>;
    } = {
      ecrans: [],
      cadres: [],
    };
    Object.assign(window, { __releveEcrans: releve });
    const noter = (ecran: string) => {
      if (releve.ecrans.at(-1) !== ecran) releve.ecrans.push(ecran);
    };
    new MutationObserver(() => {
      const cadre = document.querySelector('main[aria-busy="true"]');
      if (cadre !== null) {
        releve.cadres.push({
          texte: cadre.textContent,
          donnees: Array.from(cadre.attributes)
            .map((a) => a.name)
            .filter((n) => n.startsWith('data-')),
        });
        noter('CADRE');
      }
      const connexion = Array.from(document.querySelectorAll('button')).some((b) =>
        /continuer avec google/i.test(b.textContent),
      );
      if (connexion) noter('CONNEXION');
      if (document.querySelector('main.espace-application') !== null) noter('ESPACE');
    }).observe(document, { childList: true, subtree: true, attributes: true });
  });
};

const releve = (page: Page): Promise<Releve> =>
  page.evaluate(() => (window as unknown as { __releveEcrans: Releve }).__releveEcrans);

test.describe('Ouverture de l’application (ANO-004)', () => {
  test('E2E-ANO-004-01 réouverture d’une session existante : cadre neutre puis espace, jamais l’invitation à se connecter', async ({
    context,
  }) => {
    const page = await ouvrirApplicationConnectee(context);
    await observerLesEcrans(page);
    await page.reload();
    await expect(page.locator('main.espace-application')).toBeVisible();
    const { ecrans, cadres } = await releve(page);
    expect(ecrans).toEqual(['CADRE', 'ESPACE']);
    expect(cadres.every((c) => c.texte === '' && c.donnees.length === 0)).toBe(true);
  });

  test('E2E-ANO-004-02 sans session (build de production) : cadre neutre, vide et sans data-*, puis écran de connexion', async ({
    page,
  }) => {
    await observerLesEcrans(page);
    await page.goto('/');
    await expect(page.getByRole('button', { name: /continuer avec google/i })).toBeVisible();
    const { ecrans, cadres } = await releve(page);
    expect(ecrans).toEqual(['CADRE', 'CONNEXION']);
    expect(cadres.length).toBeGreaterThan(0);
    expect(cadres.every((c) => c.texte === '' && c.donnees.length === 0)).toBe(true);
  });
});
