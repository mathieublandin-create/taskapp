import { describe, expect, it } from 'vitest';
import {
  estFichierMesurable,
  estRapportValide,
  normaliserRapport,
  verifierNonRegression,
  type CouvertureParFichier,
} from '../../../scripts/verifier-non-regression-couverture';

// conventions.md §12 (non-régression de la couverture d'un fichier modifié) ; DT-005. Tests d'outillage : rang -1.
const metrique = (total: number, pct: number) => ({ total, pct });
const entree = (lines: ReturnType<typeof metrique>, branches: ReturnType<typeof metrique>) => ({
  lines,
  branches,
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
      total: entree(metrique(100, 90), metrique(10, 80)),
      '/runner/base/src/a.ts': entree(metrique(100, 90), metrique(10, 80)),
      '/runner/base/src/b/c.tsx': entree(metrique(40, 70), metrique(10, 60)),
    };

    expect(normaliserRapport(brut, '/runner/base')).toEqual({
      'src/a.ts': entree(metrique(100, 90), metrique(10, 80)),
      'src/b/c.tsx': entree(metrique(40, 70), metrique(10, 60)),
    });
    expect(normaliserRapport(brut, '/runner/base/')).toEqual({
      'src/a.ts': entree(metrique(100, 90), metrique(10, 80)),
      'src/b/c.tsx': entree(metrique(40, 70), metrique(10, 60)),
    });
  });

  it('UT-OUT-09 verifierNonRegression — échoue sur une baisse de lignes ou de branches, réussit sur une hausse ou un maintien', () => {
    const base: CouvertureParFichier = {
      'src/a.ts': entree(metrique(10, 90), metrique(5, 80)),
      'src/b.ts': entree(metrique(10, 90), metrique(5, 80)),
      'src/c.ts': entree(metrique(10, 90), metrique(5, 80)),
    };
    const pr: CouvertureParFichier = {
      'src/a.ts': entree(metrique(10, 89.99), metrique(5, 80)),
      'src/b.ts': entree(metrique(10, 95), metrique(5, 79)),
      'src/c.ts': entree(metrique(10, 90), metrique(5, 85)),
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

  it('UT-OUT-10 verifierNonRegression — ne compare que les fichiers modifiés de src/, ignore les nouveaux et les métriques sans élément', () => {
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
        'src/ancien.ts': entree(metrique(10, 90), metrique(4, 80)),
        'src/vide.ts': entree(metrique(10, 100), metrique(0, 100)),
        'src/absent-de-la-pr.ts': entree(metrique(10, 90), metrique(4, 80)),
        'src/non-modifie.ts': entree(metrique(10, 100), metrique(4, 100)),
      },
      pr: {
        'src/ancien.ts': entree(metrique(10, 90), metrique(4, 80)),
        'src/vide.ts': entree(metrique(10, 100), metrique(0, 0)),
        'src/nouveau.ts': entree(metrique(10, 10), metrique(4, 10)),
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

  it('UT-OUT-11 verifierNonRegression — une métrique vide d’un côté n’est pas comparée', () => {
    const resultat = verifierNonRegression({
      fichiersModifies: ['src/lignes-vides.ts', 'src/branches-vides.ts'],
      base: {
        // Cas 1 : lignes à 100 % à la base, puis aucun élément de ligne dans la PR (total 0, pct 0).
        'src/lignes-vides.ts': entree(metrique(10, 100), metrique(4, 50)),
        // Cas 2 : aucune branche à la base (pct 100), puis 4 branches couvertes à 50 % dans la PR.
        'src/branches-vides.ts': entree(metrique(10, 100), metrique(0, 100)),
      },
      pr: {
        'src/lignes-vides.ts': entree(metrique(0, 0), metrique(4, 50)),
        'src/branches-vides.ts': entree(metrique(10, 100), metrique(4, 50)),
      },
    });

    expect(resultat.erreurs).toEqual([]);
    expect(resultat.compares).toEqual(['src/branches-vides.ts', 'src/lignes-vides.ts']);
  });

  it('UT-OUT-12 estRapportValide — accepte un rapport complet, refuse un rapport absent ou malformé', () => {
    const valide = {
      total: entree(metrique(10, 90), metrique(4, 50)),
      '/runner/base/src/a.ts': entree(metrique(10, 90), metrique(4, 50)),
    };

    expect(estRapportValide(valide)).toBe(true);
    expect(
      [
        undefined,
        null,
        'texte',
        [],
        { '/runner/base/src/a.ts': { lines: metrique(10, 90) } },
        {
          '/runner/base/src/a.ts': {
            lines: { total: 10, pct: 'Unknown' },
            branches: metrique(4, 50),
          },
        },
        { '/runner/base/src/a.ts': { lines: metrique(10, 90), branches: { total: '4', pct: 50 } } },
      ].map(estRapportValide),
    ).toEqual([false, false, false, false, false, false, false]);
  });
});
