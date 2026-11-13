// ST-CORR-E13B-LOT-001 §4 (tranche T3) : DT-014, style commun des boutons natifs (guide v0.2.26 §4.1, §6.6.16 n° 2).
// Rendu calculé de la classe `bouton-natif` et de ses variantes sur le harnais `boutons-natifs.html`, puis sur l'écran de
// connexion du build de production (« Continuer avec Google », principal d'ECR-010). Rang 14 (rangs-tests.json).
import { expect, test, type Locator } from '@playwright/test';
import { ORIGINE_HARNAIS } from '../support/harnais/port';
import { boite } from '../support/e2e/outils-navigateur';

const HARNAIS = `${ORIGINE_HARNAIS}/tests/support/harnais/boutons-natifs.html`;

const ACCENT = 'rgb(46, 91, 219)';
const SUR_ACCENT = 'rgb(255, 255, 255)';
const TEXTE = 'rgb(28, 28, 33)';
const BORDURE_FORTE = 'rgb(138, 138, 148)';
const DANGER = 'rgb(196, 43, 43)';
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

/** Propriétés calculées comparées par les tests (valeurs des jetons du guide §3). */
const calcule = (bouton: Locator) =>
  bouton.evaluate((e) => {
    const s = getComputedStyle(e);
    return {
      fond: s.backgroundColor,
      texte: s.color,
      bordure: `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`,
      rayon: s.borderTopLeftRadius,
      graisse: s.fontWeight,
      taille: s.fontSize,
      remplissage: `${s.paddingTop} ${s.paddingRight}`,
      opacite: s.opacity,
      curseur: s.cursor,
    };
  });

const COMMUN = { rayon: '10px', graisse: '600', taille: '15px', opacite: '1' };

test.describe('Boutons natifs : style commun (DT-014)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('E2E-DT-014-01 variantes : principal (fond accent), secondaire (bordure forte), tertiaire (texte accent, sans bordure), danger (texte et bordure rouges) ; 44 px de haut au moins', async ({
    page,
  }) => {
    await page.goto(HARNAIS);
    const bouton = (nom: string) => page.getByRole('button', { name: nom, exact: true });
    expect(await calcule(bouton('Principal'))).toMatchObject({
      ...COMMUN,
      fond: ACCENT,
      texte: SUR_ACCENT,
      remplissage: '0px 16px',
    });
    expect(await calcule(bouton('Secondaire'))).toMatchObject({
      ...COMMUN,
      fond: TRANSPARENT,
      texte: TEXTE,
      bordure: `1px solid ${BORDURE_FORTE}`,
      remplissage: '0px 16px',
    });
    expect(await calcule(bouton('Tertiaire'))).toMatchObject({
      ...COMMUN,
      fond: TRANSPARENT,
      texte: ACCENT,
      remplissage: '0px 8px',
    });
    expect((await calcule(bouton('Tertiaire'))).bordure).toMatch(/^0px /);
    expect(await calcule(bouton('Danger'))).toMatchObject({
      ...COMMUN,
      fond: TRANSPARENT,
      texte: DANGER,
      bordure: `1px solid ${DANGER}`,
    });
    for (const nom of ['Principal', 'Secondaire', 'Tertiaire', 'Danger']) {
      expect((await boite(bouton(nom))).height).toBeGreaterThanOrEqual(44);
    }
  });

  test('E2E-DT-014-02 aria-disabled : opacité 40 %, curseur not-allowed, reste focalisable', async ({
    page,
  }) => {
    await page.goto(HARNAIS);
    const indisponible = page.getByRole('button', { name: 'Indisponible' });
    expect(await calcule(indisponible)).toMatchObject({ opacite: '0.4', curseur: 'not-allowed' });
    await indisponible.focus();
    await expect(indisponible).toBeFocused();
  });

  test('E2E-DT-014-03 écran de connexion du build de production : « Continuer avec Google » est un bouton principal', async ({
    page,
  }) => {
    await page.goto('/');
    const bouton = page.getByRole('button', { name: /continuer avec google/i });
    await expect(bouton).toBeVisible();
    expect(await calcule(bouton)).toMatchObject({ ...COMMUN, fond: ACCENT, texte: SUR_ACCENT });
    expect((await boite(bouton)).height).toBeGreaterThanOrEqual(44);
  });
});
