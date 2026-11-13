/**
 * ST-CORR-E13B-LOT-001 §2 (tranche T2) : DT-034 points 1 et 3 (guide v0.2.26 §2.2, §6.6.16 n° 1). Contrôles du texte de
 * `index.html` et des jetons de `styles.css` ; le rendu calculé (contour, réserve, zone sûre) est contrôlé en navigateur
 * réel par E2E-DT-034-01 à 08. Rang 14 (rangs-tests.json).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const RACINE = join(import.meta.dirname, '..', '..', '..', '..');
const lire = (chemin: string): string => readFileSync(join(RACINE, chemin), 'utf8');
const STYLES = 'src/commun/presentation/ui/styles.css';

/** Bloc `:root { … }` de la feuille de styles. */
const blocRacine = (css: string): string => /:root\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';

describe('DT-034 : focus visible et zone sûre (guide §6.6.16 n° 1)', () => {
  it('UT-DT-034-01 index.html : la balise viewport porte viewport-fit=cover, sans retirer width ni initial-scale', () => {
    const contenu = /<meta\s+name="viewport"\s+content="([^"]*)"/.exec(lire('index.html'))?.[1];
    expect(contenu?.split(',').map((partie) => partie.trim())).toEqual([
      'width=device-width',
      'initial-scale=1',
      'viewport-fit=cover',
    ]);
  });

  it('UT-DT-034-02 styles.css : jetons --dj-focus (#2e5bdb) et --dj-marge-fab (88px) dans :root ; aucune déclaration outline: none ni outline: 0', () => {
    const css = lire(STYLES);
    const racine = blocRacine(css);
    expect(racine).toMatch(/--dj-focus:\s*#2e5bdb;/i);
    expect(racine).toMatch(/--dj-marge-fab:\s*88px;/);
    expect(css).not.toMatch(/outline:\s*(?:none|0)\b/);
  });
});
