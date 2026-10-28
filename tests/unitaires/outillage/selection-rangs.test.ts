import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  fichiersCouverts,
  fichiersTermines,
  lireRangCourant,
  motifSelection,
  rangDuTest,
  type RangsFichier,
  type RegleRang,
} from '@tests/support/rangs/selection-rangs';

// conventions.md §11.14 (réponses à Q-BEN-LOT001-2 et 3). Tests d'outillage : rang -1, toujours exécutés.
const RACINE = join(import.meta.dirname, '..', '..', '..');
const lireJson = (chemin: string): unknown =>
  JSON.parse(readFileSync(join(RACINE, chemin), 'utf8'));
const REGLES = (
  lireJson('tests/support/rangs/rangs-tests.json') as { regles: ReadonlyArray<RegleRang> }
).regles;
const FICHIERS = (
  lireJson('tests/support/rangs/rangs-fichiers.json') as { fichiers: Record<string, RangsFichier> }
).fichiers;

const lister = (dossier: string): ReadonlyArray<string> =>
  readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    return statSync(chemin).isDirectory() ? lister(chemin) : [chemin];
  });

const REGLES_EXEMPLE: ReadonlyArray<RegleRang> = [
  { motif: 'Memoire.*CT-X-\\d+', rang: 3 },
  { motif: 'CT-X-\\d+', rang: 0 },
  { motif: 'UT-A-\\d+', rang: 1 },
];
const NOMS_EXEMPLE = [
  'Contrat — Dexie CT-X-01 lire',
  'Contrat — Memoire CT-X-01 lire',
  'Cas UT-A-07 décide',
  'Cas sans identifiant',
];

describe('Sélection des tests par rang (conventions.md §11.14)', () => {
  it('UT-OUT-01 rangDuTest — la première règle qui s’applique fixe le rang ; aucun rang sans règle', () => {
    expect(NOMS_EXEMPLE.map((nom) => rangDuTest(nom, REGLES_EXEMPLE))).toEqual([
      0,
      3,
      1,
      undefined,
    ]);
  });

  it('UT-OUT-02 motifSelection — sélectionne exactement les tests de rang inférieur ou égal au rang courant', () => {
    [-1, 0, 1, 3].forEach((rangCourant) => {
      const motif = motifSelection(REGLES_EXEMPLE, rangCourant);
      NOMS_EXEMPLE.forEach((nom) => {
        const rang = rangDuTest(nom, REGLES_EXEMPLE);
        expect(motif.test(nom)).toBe(rang !== undefined && rang <= rangCourant);
      });
    });
  });

  it('UT-OUT-03 fichiersCouverts et fichiersTermines — selon debut et fin ; lireRangCourant — variable entière prioritaire', () => {
    const fichiers = { 'a.ts': { debut: 0, fin: 3 }, 'b.ts': { debut: 1, fin: 1 } };
    expect(fichiersCouverts(fichiers, 0)).toEqual(['a.ts']);
    expect(fichiersCouverts(fichiers, 1)).toEqual(['a.ts', 'b.ts']);
    expect(fichiersTermines(fichiers, 1)).toEqual(['b.ts']);
    expect(fichiersTermines(fichiers, 3)).toEqual(['a.ts', 'b.ts']);
    expect(lireRangCourant('2', -1)).toBe(2);
    expect(lireRangCourant(undefined, -1)).toBe(-1);
    expect(lireRangCourant('rang', 0)).toBe(0);
  });

  it('UT-OUT-04 rangs-tests.json — chaque identifiant de test du dépôt a un rang', () => {
    const identifiants = new Set(
      lister(join(RACINE, 'tests'))
        .filter((chemin) => /\.(test|contrat)\.ts$/.test(chemin))
        .flatMap((chemin) => [
          ...readFileSync(chemin, 'utf8').matchAll(/'((?:UT|CT)-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d+)\b/g),
        ])
        .map((correspondance) => correspondance[1] ?? ''),
    );
    const sansRang = [...identifiants].filter((id) => rangDuTest(id, REGLES) === undefined);

    expect(identifiants.size).toBeGreaterThan(300);
    expect(sansRang).toEqual([]);
  });

  it('UT-OUT-05 rangs-fichiers.json — chaque fichier de src/ y figure, et seulement eux, avec debut ≤ fin', () => {
    const sources = lister(join(RACINE, 'src'))
      .filter((chemin) => /\.tsx?$/.test(chemin))
      .map((chemin) => relative(RACINE, chemin))
      .sort();

    expect(Object.keys(FICHIERS).sort()).toEqual(sources);
    expect(Object.values(FICHIERS).filter((r) => r.debut > r.fin)).toEqual([]);
  });

  it('UT-OUT-06 rangs-fichiers.json — un fichier terminé au rang courant n’importe plus @non-implemente', () => {
    const rangCourant = (
      lireJson('tests/support/rangs/rang-courant.json') as { rangCourant: number }
    ).rangCourant;
    const encoreSquelettes = fichiersTermines(FICHIERS, rangCourant).filter((chemin) =>
      readFileSync(join(RACINE, chemin), 'utf8').includes('@non-implemente'),
    );

    expect(encoreSquelettes).toEqual([]);
  });
});
