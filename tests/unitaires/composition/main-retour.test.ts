/**
 * RED-02 et RED-05 (conventions.md §9.2.1 ; RC-US022-1) : le retour de Google, qui porte le jeton, est consommé par la
 * première instruction de main.tsx et passé directement à `demarrerWeb`, sans être lié à aucun nom de module ; dans
 * `demarrerWeb`, il ne sert qu'à l'appel d'`ouvrirApplication.executer`. Contrôle statique sur l'arbre syntaxique.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const source = (relatif: string): ts.SourceFile => {
  const chemin = fileURLToPath(new URL(`../../../src/${relatif}`, import.meta.url));
  return ts.createSourceFile(relatif, readFileSync(chemin, 'utf8'), ts.ScriptTarget.Latest, true);
};

const noeuds = (racine: ts.Node): ReadonlyArray<ts.Node> => {
  const tous: Array<ts.Node> = [];
  const visiter = (n: ts.Node): void => {
    tous.push(n);
    n.forEachChild(visiter);
  };
  visiter(racine);
  return tous;
};

const estAppelDe = (n: ts.Node | undefined, nom: string): n is ts.CallExpression =>
  n !== undefined &&
  ts.isCallExpression(n) &&
  ts.isIdentifier(n.expression) &&
  n.expression.text === nom;

describe('main.tsx et demarrerWeb — retour de Google hors de toute variable (RED-02, RED-05)', () => {
  it('UT-COMP-US-022-87 main.tsx — la première instruction passe consommerRetourRedirection(…) directement à demarrerWeb', () => {
    const main = source('main.tsx');
    const instructions = main.statements.filter((s) => !ts.isImportDeclaration(s));
    const premiere = instructions[0];

    expect(premiere !== undefined && ts.isVariableStatement(premiere)).toBe(true);
    const declaration = (premiere as ts.VariableStatement).declarationList.declarations[0];
    const appel = declaration?.initializer;
    expect(estAppelDe(appel, 'demarrerWeb')).toBe(true);
    expect(
      estAppelDe((appel as ts.CallExpression).arguments[0], 'consommerRetourRedirection'),
    ).toBe(true);
  });

  it('UT-COMP-US-022-88 main.tsx — aucun nom (variable, affectation, propriété) ne reçoit le résultat de consommerRetourRedirection', () => {
    const appels = noeuds(source('main.tsx')).filter((n) =>
      estAppelDe(n, 'consommerRetourRedirection'),
    );

    expect(appels).toHaveLength(1);
    expect(estAppelDe(appels[0]?.parent, 'demarrerWeb')).toBe(true);
  });

  it("UT-COMP-US-022-89 demarrerWeb — le paramètre retour n'est lu qu'une fois, en argument d'ouvrirApplication.executer", () => {
    const web = source('composition/web.ts');
    const demarrer = noeuds(web).find(
      (n): n is ts.VariableDeclaration =>
        ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === 'demarrerWeb',
    );
    const fonction = demarrer?.initializer;
    expect(fonction !== undefined && ts.isArrowFunction(fonction)).toBe(true);
    const parametre = (fonction as ts.ArrowFunction).parameters[0]?.name;
    expect(parametre !== undefined && ts.isIdentifier(parametre)).toBe(true);
    const nom = (parametre as ts.Identifier).text;

    const lectures = noeuds((fonction as ts.ArrowFunction).body).filter(
      (n): n is ts.Identifier => ts.isIdentifier(n) && n.text === nom,
    );

    expect(lectures).toHaveLength(1);
    const appel = lectures[0]?.parent;
    expect(appel !== undefined && ts.isCallExpression(appel)).toBe(true);
    expect((appel as ts.CallExpression).expression.getText()).toBe(
      'application.ouvrirApplication.executer',
    );
  });
});
