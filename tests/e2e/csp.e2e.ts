// ADR-014 (M3) : test de fumée de la CSP en navigateur réel, sur le build de production servi en statique.
// jsdom n'applique pas la CSP : seul Chromium voit une violation (nouvelle origine, nouveau script, style injecté).
import { expect, test, type Page } from '@playwright/test';

/** Composants Ionic « scoped » ou à Shadow DOM utilisés par src/ : instanciés pour déclencher leurs styles. */
const COMPOSANTS_IONIC = [
  'ion-button',
  'ion-buttons',
  'ion-header',
  'ion-toolbar',
  'ion-title',
  'ion-content',
  'ion-input',
  'ion-textarea',
  'ion-chip',
  'ion-note',
  'ion-fab',
  'ion-toast',
  'ion-modal',
  'ion-action-sheet',
];

type Violation = { readonly directive: string; readonly bloque: string };

const surveillerViolations = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    const violations: Array<Violation> = [];
    Object.assign(window, { __violationsCsp: violations });
    document.addEventListener('securitypolicyviolation', (evenement) => {
      violations.push({
        directive: evenement.effectiveDirective,
        bloque: evenement.blockedURI,
      });
    });
  });
};

const violationsRelevees = (page: Page): Promise<ReadonlyArray<Violation>> =>
  page.evaluate(() => (window as unknown as { __violationsCsp: Array<Violation> }).__violationsCsp);

const instancierComposantsIonic = (page: Page): Promise<ReadonlyArray<string>> =>
  page.evaluate((noms) => {
    const definis = noms.filter((nom) => customElements.get(nom) !== undefined);
    for (const nom of definis) document.body.appendChild(document.createElement(nom));
    return definis;
  }, COMPOSANTS_IONIC);

test.describe('CSP du build de production (ADR-014)', () => {
  test('aucune violation de la CSP, ni message de console, à la connexion et sur les composants Ionic', async ({
    page,
  }) => {
    const messagesCsp: Array<string> = [];
    const erreursPage: Array<string> = [];
    page.on('console', (message) => {
      if (/content security policy|refused to/i.test(message.text())) {
        messagesCsp.push(message.text());
      }
    });
    page.on('pageerror', (erreur) => erreursPage.push(erreur.message));
    await surveillerViolations(page);

    await page.goto('/');
    await expect(page.locator('ion-app')).toBeAttached();
    const definis = await instancierComposantsIonic(page);
    await page.waitForLoadState('networkidle');

    expect(definis).toEqual(COMPOSANTS_IONIC);
    expect(await violationsRelevees(page)).toEqual([]);
    expect(messagesCsp).toEqual([]);
    expect(erreursPage).toEqual([]);
  });

  test('la CSP déclarée garde script-src strict et autorise les styles en ligne seulement', async ({
    page,
  }) => {
    await page.goto('/');

    const csp = await page
      .locator('meta[http-equiv="Content-Security-Policy"]')
      .getAttribute('content');
    const directive = (nom: string): string =>
      (csp ?? '').split(';').find((d) => d.trim().startsWith(`${nom} `)) ?? '';

    expect(directive('style-src')).toContain("'unsafe-inline'");
    expect(directive('script-src')).not.toMatch(/unsafe-inline|unsafe-eval/);
  });
});
