import { describe, expect, it } from 'vitest';
import {
  estFichierMesurable,
  normaliserRapport,
  verifierNonRegression,
  type CouvertureParFichier,
} from '../../../scripts/verifier-non-regression-couverture';

// conventions.md §12 (non-régression de la couverture d'un fichier modifié) ; DT-005. Tests d'outillage : rang -1.
const entree = (lines: number | string, branches: number | string) => ({
  lines: { pct: lines },
  branches: { pct: branches },
});

describe('Non-régression de la couverture par fichier (conventions.md §12, DT-005)', () => {
  it('UT-OUT-07 estFichierMesurable — ne retient que les sources de src/, hors déclarations de types', () => {
    expect(
      [
        'src/commun/domaine/duree.ts',
        'src/main.tsx',
        'src/commun/domaine/types.d.ts',
        'tests/unitaires/a.test.ts',
        'docs/x.md',
      ].map(estFichierMesurable),
    ).toEqual([true, true, false, false, false]);
  });

  it('UT-OUT-08 normaliserRapport — ramène les chemins absolus à la racine et retire la ligne total', () => {
    const brut = {
      total: entree(90, 80),
      '/runner/base/src/a.ts': entree(90, 80),
      '/runner/base/src/b/c.tsx': entree(70, 60),
    };

    expect(normaliserRapport(brut, '/runner/base')).toEqual({
      'src/a.ts': entree(90, 80),
      'src/b/c.tsx': entree(70, 60),
    });
    expect(normaliserRapport(brut, '/runner/base/')).toEqual({
      'src/a.ts': entree(90, 80),
      'src/b/c.tsx': entree(70, 60),
    });
  });

  it('UT-OUT-09 verifierNonRegression — échoue sur une baisse de lignes ou de branches, réussit sur une hausse ou un maintien', () => {
    const base: CouvertureParFichier = {
      'src/a.ts': entree(90, 80),
      'src/b.ts': entree(90, 80),
      'src/c.ts': entree(90, 80),
    };
    const pr: CouvertureParFichier = {
      'src/a.ts': entree(89.99, 80),
      'src/b.ts': entree(95, 79),
      'src/c.ts': entree(90, 85),
    };

    const resultat = verifierNonRegression({
      fichiersModifies: ['src/a.ts', 'src/b.ts', 'src/c.ts'],
      base,
      pr,
    });

    expect(resultat.erreurs).toEqual([
      'src/a.ts : couverture des lignes en baisse, 90 % (base) → 89.99 % (PR)',
      'src/b.ts : couverture des branches en baisse, 80 % (base) → 79 % (PR)',
    ]);
    expect(resultat.compares).toEqual(['src/a.ts', 'src/b.ts', 'src/c.ts']);
  });

  it('UT-OUT-10 verifierNonRegression — ne compare que les fichiers modifiés de src/, ignore les nouveaux et les « Unknown »', () => {
    const resultat = verifierNonRegression({
      fichiersModifies: [
        'src/ancien.ts',
        'src/nouveau.ts',
        'src/vide.ts',
        'src/absent-de-la-pr.ts',
        'tests/x.test.ts',
        'src/types.d.ts',
      ],
      base: {
        'src/ancien.ts': entree(90, 80),
        'src/vide.ts': entree(100, 'Unknown'),
        'src/absent-de-la-pr.ts': entree(90, 80),
        'src/non-modifie.ts': entree(100, 100),
      },
      pr: {
        'src/ancien.ts': entree(90, 80),
        'src/vide.ts': entree(100, 'Unknown'),
        'src/nouveau.ts': entree(10, 10),
      },
    });

    expect(resultat.erreurs).toEqual([
      'src/absent-de-la-pr.ts : absent du rapport de couverture de la PR',
    ]);
    expect(resultat.sansReference).toEqual([
      'src/nouveau.ts : absent du rapport de la base (nouveau fichier ou non mesuré)',
    ]);
    expect(resultat.compares).toEqual(['src/ancien.ts', 'src/vide.ts']);
  });
});
