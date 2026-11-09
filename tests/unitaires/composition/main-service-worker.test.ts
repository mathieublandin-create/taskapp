/**
 * ST-US-018 v0.4 §4.3, §6.1 n° 4 (RED-02), tests complémentaires de Benjamin : câblage de l'enregistrement du service
 * worker dans `main.tsx` (contrôle statique, comme `main-retour.test.ts`). UT-COMP-US-018-35 à 37.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const main = (): ts.SourceFile => {
  const chemin = fileURLToPath(new URL('../../../src/main.tsx', import.meta.url));
  return ts.createSourceFile(
    'main.tsx',
    readFileSync(chemin, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
};

const appelsDe = (racine: ts.Node, nom: string): ReadonlyArray<ts.CallExpression> => {
  const trouves: Array<ts.CallExpression> = [];
  const visiter = (n: ts.Node): void => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === nom) {
      trouves.push(n);
    }
    n.forEachChild(visiter);
  };
  visiter(racine);
  return trouves;
};

const unAppel = (source: ts.SourceFile, nom: string): ts.CallExpression => {
  const [appel, ...autres] = appelsDe(source, nom);
  if (appel === undefined || autres.length > 0) throw new Error(`Un seul appel de ${nom} attendu`);
  return appel;
};

/** Instruction de premier niveau qui contient le nœud. */
const instructionDe = (source: ts.SourceFile, n: ts.Node): number =>
  source.statements.findIndex((s) => s.pos <= n.pos && n.end <= s.end);

const proprietes = (appel: ts.CallExpression): ReadonlyMap<string, string> => {
  const objet = appel.arguments[0];
  if (objet === undefined || !ts.isObjectLiteralExpression(objet)) return new Map();
  return new Map(
    objet.properties
      .filter(ts.isPropertyAssignment)
      .map((p) => [p.name.getText(), p.initializer.getText()]),
  );
};

describe('main.tsx — enregistrement du service worker (ST-US-018 §6.1)', () => {
  it('UT-COMP-US-018-35 RED-02 — enregistrerServiceWorker est appelé une fois, au premier niveau, après l’instruction qui consomme le retour de redirection', () => {
    const source = main();

    const ligneEnregistrement = instructionDe(source, unAppel(source, 'enregistrerServiceWorker'));
    const ligneDemarrage = instructionDe(source, unAppel(source, 'demarrerWeb'));

    expect(ligneDemarrage).toBeGreaterThanOrEqual(0);
    expect(ligneEnregistrement).toBeGreaterThan(ligneDemarrage);
  });

  it('UT-COMP-US-018-36 invite — surNouvelleVersion appelle controleur.signalerNouvelleVersion, le journal est celui de l’application', () => {
    const champs = proprietes(unAppel(main(), 'enregistrerServiceWorker'));

    expect(champs.get('surNouvelleVersion')).toBe('controleur.signalerNouvelleVersion');
    expect(champs.get('journal')).toBe('journal');
  });

  it('UT-COMP-US-018-37 portée — conteneur issu de navigator.serviceWorker (absent sinon), base = BASE_URL de la construction', () => {
    const champs = proprietes(unAppel(main(), 'enregistrerServiceWorker'));

    expect(champs.get('conteneur')).toBe(
      "'serviceWorker' in navigator ? navigator.serviceWorker : undefined",
    );
    expect(champs.get('base')).toBe('import.meta.env.BASE_URL');
  });
});
