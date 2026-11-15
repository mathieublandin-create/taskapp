/**
 * ST-CORR-E13B-LOT-001 v0.3 §5.1 ter (tranche T5a) : ligne d'état de l'espace (indicateur puis bouton « Compte et
 * synchronisation »), guide v0.2.27 §6.6.17 n° 4 : `min-height: 48px` **sans hauteur maximale** ; avec le texte agrandi
 * (WCAG 1.4.4) ou l'espacement du texte (1.4.12), le libellé du bouton passe sur deux lignes, jamais tronqué. Contrôle
 * du texte de `styles.css` ; la géométrie réelle est contrôlée par E2E-ANO-005-FEUILLE-07 (T5b). Rang 14.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const RACINE = join(import.meta.dirname, '..', '..', '..', '..');
const CSS = readFileSync(join(RACINE, 'src/commun/presentation/ui/styles.css'), 'utf8');

/** Règles (sélecteur, déclarations) de premier niveau ou dans un `@media`, commentaires retirés. */
const regles = (css: string): ReadonlyArray<{ selecteur: string; declarations: string }> =>
  [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}@;]+)\{([^{}]*)\}/g)].map((m) => ({
    selecteur: (m[1] ?? '').trim(),
    declarations: (m[2] ?? '').trim(),
  }));

/** Déclarations normalisées d'une règle : `propriété: valeur`, triées. */
const declarations = (bloc: string): ReadonlyArray<string> =>
  bloc
    .split(';')
    .map((d) =>
      d
        .trim()
        .replace(/\s*:\s*/, ': ')
        .replace(/\s+/g, ' '),
    )
    .filter((d) => d !== '')
    .sort();

describe('Ligne d’état (ANO-005, guide v0.2.27 §6.6.17 n° 4)', () => {
  it('UT-ANO-005-FEUILLE-12 règle .ligne-etat exacte (flex, min-height 48px) ; aucune règle qui vise la ligne ou ses descendants ne fixe de hauteur maximale, de hauteur, de découpage ni de troncature', () => {
    const toutes = regles(CSS);
    const ligne = toutes.filter((r) => r.selecteur === '.ligne-etat');
    expect(ligne).toHaveLength(1);
    expect(declarations(ligne[0]?.declarations ?? '')).toEqual(
      [
        'align-items: center',
        'display: flex',
        'flex: none',
        'gap: 8px',
        'justify-content: space-between',
        'min-height: 48px',
        'padding: 0 8px 0 16px',
      ].sort(),
    );
    const interdites =
      /(?:^|;|\s)(?:max-height|height|block-size|max-block-size|overflow(?:-[xy])?|white-space|text-overflow|line-clamp|-webkit-line-clamp)\s*:/;
    toutes
      .filter((r) => r.selecteur.split(',').some((s) => s.includes('.ligne-etat')))
      .forEach((r) => {
        expect({ selecteur: r.selecteur, interdite: interdites.test(r.declarations) }).toEqual({
          selecteur: r.selecteur,
          interdite: false,
        });
      });
  });
});
