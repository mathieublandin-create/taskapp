/**
 * Outils des tests de navigateur des corrections de l'E13b de LOT-001 (ST-CORR-E13B-LOT-001 §9) : contour calculé de
 * l'élément focalisé (y compris dans un shadow DOM Ionic), tabulation jusqu'à un élément, recouvrement d'un point,
 * harnais de l'écran connecté et application `test-ihm` connectée au compte A (ponts Google et Drive simulés).
 */
import { expect, type BrowserContext, type Locator, type Page } from '@playwright/test';
import { BancSynchro } from '../banc/banc-synchro';
import { IDENTIFIANTS_APPAREILS } from '../banc/appareil-simule';
import { ORIGINE_HARNAIS } from '../harnais/port';
import { PontFauxDrive } from '../../steps-ihm/support/pont-faux-drive';
import { PontFauxGoogle } from '../../steps-ihm/support/pont-faux-google';
import { ORIGINE_IHM } from '../../steps-ihm/support/serveur-ihm';

export const HARNAIS = `${ORIGINE_HARNAIS}/tests/support/harnais/ecran-connecte.html`;
/** `--dj-focus` (guide v0.2.26 §6.6.16 n° 1) en valeur calculée. */
export const COULEUR_FOCUS = 'rgb(46, 91, 219)';
export const DELAI_MS = 10_000;

export type Contour = {
  readonly style: string;
  readonly largeur: string;
  readonly couleur: string;
  readonly decalage: string;
};

/**
 * Contour de l'élément focalisé : le premier élément de la chaîne `document.activeElement` → `shadowRoot.activeElement`
 * → … dont le contour calculé n'est pas `none` (l'anneau peut être porté par l'hôte Ionic ou par son bouton natif).
 * `undefined` si aucun élément de la chaîne n'a de contour.
 */
export const contourDuFocus = (page: Page): Promise<Contour | undefined> =>
  page.evaluate(() => {
    const chaine: Array<Element> = [];
    let courant: Element | null = document.activeElement;
    while (courant !== null) {
      chaine.push(courant);
      courant = courant.shadowRoot?.activeElement ?? null;
    }
    const style = chaine.map((e) => getComputedStyle(e)).find((s) => s.outlineStyle !== 'none');
    return style === undefined
      ? undefined
      : {
          style: style.outlineStyle,
          largeur: style.outlineWidth,
          couleur: style.outlineColor,
          decalage: style.outlineOffset,
        };
  });

/** Vrai si `cible` est dans la chaîne du focus (hôte Ionic compris). */
const estFocalise = (cible: Locator): Promise<boolean> =>
  cible.evaluate((element) => {
    let courant: Element | null = document.activeElement;
    while (courant !== null) {
      if (courant === element) return true;
      courant = courant.shadowRoot?.activeElement ?? null;
    }
    return false;
  });

/** Tabulation au clavier jusqu'à `cible` (au plus `maximum` appuis) ; échoue si elle n'est jamais atteinte. */
export const tabulerJusqua = async (page: Page, cible: Locator, maximum = 80): Promise<void> => {
  for (let i = 0; i < maximum; i += 1) {
    await page.keyboard.press('Tab');
    if (await estFocalise(cible)) return;
  }
  throw new Error(`Élément jamais atteint au clavier en ${String(maximum)} tabulations`);
};

/**
 * Vrai si l'élément trouvé au centre de `cible` (`elementFromPoint`, en descendant dans les shadow DOM) est `cible`
 * ou l'un de ses descendants : rien ne la recouvre en son centre (WCAG 2.4.11, guide §2.2).
 */
export const centreDegage = (cible: Locator): Promise<boolean> =>
  cible.evaluate((element) => {
    const boite = element.getBoundingClientRect();
    const x = boite.left + boite.width / 2;
    const y = boite.top + boite.height / 2;
    let trouve: Element | null = document.elementFromPoint(x, y);
    while (trouve?.shadowRoot?.elementFromPoint(x, y)) {
      const interieur = trouve.shadowRoot.elementFromPoint(x, y);
      if (interieur === null || interieur === trouve) break;
      trouve = interieur;
    }
    let courant: Node | null = trouve;
    while (courant !== null) {
      if (courant === element) return true;
      courant = courant.parentNode ?? (courant instanceof ShadowRoot ? courant.host : null);
    }
    return false;
  });

/** Boîte de `cible` ; échoue si l'élément n'est pas rendu. */
export const boite = async (cible: Locator) => {
  const b = await cible.boundingBox();
  if (b === null) throw new Error('Élément sans boîte (non rendu)');
  return b;
};

/** Harnais de l'écran connecté, avec `n` tâches créées avant l'affichage de la liste. */
export const ouvrirHarnais = async (page: Page, taches = 0): Promise<void> => {
  await page.goto(HARNAIS);
  if (taches > 0) {
    await page.evaluate(
      (n) =>
        (window as unknown as { __creerTaches: (n: number) => Promise<void> }).__creerTaches(n),
      taches,
    );
  }
  await expect(page.locator('li.ligne-tache')).toHaveCount(taches);
};

/**
 * Ponts Google et Drive du processus de test exposés au contexte, sur le compte `compte` connecté à Google et qui a
 * accordé l'accès ; horloge du navigateur fixée sur celle du banc (tests/e2e/onglets.e2e.ts, et ce fichier).
 */
export const exposerLesPonts = async (context: BrowserContext, compte = 'A'): Promise<void> => {
  const banc = new BancSynchro();
  const google = new PontFauxGoogle(banc.google, banc.temps);
  google.ouvrirSession(compte);
  const drive = new PontFauxDrive({
    google: banc.google,
    appareil: () => IDENTIFIANTS_APPAREILS.pc,
    compte: () => google.compteConnecte(),
  });
  await context.clock.setFixedTime(new Date(banc.temps.maintenant()));
  await context.exposeBinding('donejuanFauxGoogle', (_source, methode: string, json: string) =>
    google.repondre(methode, json),
  );
  await context.exposeBinding('donejuanFauxDrive', (_source, methode: string, json: string) =>
    drive.repondre(methode, json),
  );
};

/**
 * Application `test-ihm` (build `dist-test-ihm`, servi par le `webServer` de playwright.config.ts) connectée au compte
 * A : ponts exposés, « Continuer avec Google », puis attente de `SYN-OK`.
 */
export const ouvrirApplicationConnectee = async (context: BrowserContext): Promise<Page> => {
  await exposerLesPonts(context);
  const page = await context.newPage();
  await page.goto(ORIGINE_IHM);
  await page.getByRole('button', { name: /continuer avec google/i }).click();
  await expect(page.locator('div[role="status"][data-etat^="SYN-"]').first()).toHaveAttribute(
    'data-etat',
    'SYN-OK',
    { timeout: DELAI_MS },
  );
  return page;
};
