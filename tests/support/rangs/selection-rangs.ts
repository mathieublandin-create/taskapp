/**
 * Sélection des tests unitaires, d'intégration et de contrat par rang de réalisation (conventions.md §11.14,
 * réponse à Q-BEN-LOT001-2). Fonctions pures, utilisées par `vitest.config.ts` et par le contrôle de CI.
 * Rang -1 : test d'outillage, toujours exécuté.
 */

/** Règle : `motif` (expression régulière) cherché dans le nom complet du test (suites et titre). */
export type RegleRang = { readonly motif: string; readonly rang: number };

/** Rangs d'un fichier de `src/` : `debut` (création), `fin` (dernier rang qui y retire un squelette). */
export type RangsFichier = { readonly debut: number; readonly fin: number };

/** La première règle dont le motif apparaît dans le nom fixe le rang ; undefined si aucune. */
export const rangDuTest = (
  nomComplet: string,
  regles: ReadonlyArray<RegleRang>,
): number | undefined => regles.find((r) => new RegExp(r.motif).test(nomComplet))?.rang;

/**
 * Motif pour `testNamePattern` : sélectionne exactement les tests dont `rangDuTest` est inférieur ou égal
 * à `rangCourant` (la première règle qui s'applique l'emporte, comme dans `rangDuTest`).
 * Aucune règle retenue : motif qui ne sélectionne rien.
 */
export const motifSelection = (regles: ReadonlyArray<RegleRang>, rangCourant: number): RegExp => {
  const branches = regles.flatMap((regle, i) => {
    if (regle.rang > rangCourant) return [];
    const precedentes = regles.slice(0, i).map((r) => `(?:${r.motif})`);
    const exclusion = precedentes.length === 0 ? '' : `(?!.*(?:${precedentes.join('|')}))`;
    return [`^${exclusion}.*(?:${regle.motif})`];
  });
  return new RegExp(branches.length === 0 ? '(?!)' : branches.join('|'));
};

/** Fichiers de `src/` dont la couverture est mesurée : créés à un rang inférieur ou égal au rang courant. */
export const fichiersCouverts = (
  fichiers: Readonly<Record<string, RangsFichier>>,
  rangCourant: number,
): ReadonlyArray<string> =>
  Object.entries(fichiers)
    .filter(([, rangs]) => rangs.debut <= rangCourant)
    .map(([chemin]) => chemin)
    .sort();

/** Fichiers qui ne doivent plus importer `@non-implemente` : terminés à un rang inférieur ou égal au rang courant. */
export const fichiersTermines = (
  fichiers: Readonly<Record<string, RangsFichier>>,
  rangCourant: number,
): ReadonlyArray<string> =>
  Object.entries(fichiers)
    .filter(([, rangs]) => rangs.fin <= rangCourant)
    .map(([chemin]) => chemin)
    .sort();

/** Rang courant : variable RANG_COURANT si elle est un entier (travail local sur une branche d'US), sinon le fichier. */
export const lireRangCourant = (variable: string | undefined, rangDuFichier: number): number =>
  variable !== undefined && /^-?\d+$/.test(variable) ? Number(variable) : rangDuFichier;
