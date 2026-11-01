import { describe, expect, it } from 'vitest';
import { lireScenarios } from '../../../scripts/lire-scenarios.mjs';
import { selectionnerScenarios } from '../../../scripts/selection-scenarios.mjs';
import { definitionsInutilisees } from '../../../scripts/verifier-etapes-inutilisees.mjs';
import { codesCites, codesDuGuide, verifierCatalogue } from '../../../scripts/verifier-catalogue';
import { MOTIFS_GITIGNORE, verifierDepot } from '../../../scripts/verifier-depot';
import { verifierRangs } from '../../../scripts/verifier-rangs';
import { reglesDuCahier, verifierTags } from '../../../scripts/verifier-tags';

const ensemble = (...valeurs: ReadonlyArray<string>): ReadonlySet<string> => new Set(valeurs);

describe('Contrôles de CI (conventions.md §8.5, §9.1, §11.8, §11.13, §14)', () => {
  it('UT-COMP-80 verifierCatalogue — réussit sur un catalogue en accord et échoue sur un code manquant', () => {
    const accord = {
      codesDuGuide: ensemble('SYN-OK', 'ERR-001'),
      codesDuCode: ensemble('SYN-OK', 'ERR-001'),
      codesDesFeatures: ensemble('ERR-001'),
      codesDuCatalogue: undefined,
    };

    expect(verifierCatalogue(accord)).toEqual([]);
    expect(verifierCatalogue({ ...accord, codesDuCode: ensemble('SYN-OK') })).toEqual([
      'ERR-001 : dans le guide, absent de CODES_CATALOGUE',
      'ERR-001 : cité dans un .feature, absent du catalogue',
    ]);
    expect(verifierCatalogue({ ...accord, codesDuCatalogue: ensemble('SYN-OK') })).toEqual([
      'ERR-001 : absent de catalogue.fr.ts',
    ]);
  });

  it('UT-COMP-81 codesDuGuide et codesCites — lisent les codes des tableaux du §6.6 et des .feature', () => {
    const guide =
      '### 6.6 Catalogue\n| `SYN-OK` | x |\n| texte | y |\n| `ERR-020` | z |\n\n## 7 Suite\n| `ZZZ-01` | n |';

    expect(codesDuGuide(guide)).toEqual(ensemble('SYN-OK', 'ERR-020'));
    expect(codesCites('Alors "ERR-020" et "SYN-OK" mais "autre"')).toEqual(
      ensemble('ERR-020', 'SYN-OK'),
    );
  });

  it('UT-COMP-82 verifierRangs — signale scénario sans rang, clé orpheline, titre mal formé et recul du rang', () => {
    const scenarios = [
      { chemin: 'a.feature', ligne: 3, identifiant: 'US-001 S01' },
      { chemin: 'a.feature', ligne: 9, identifiant: 'US-001 S02' },
      { chemin: 'a.feature', ligne: 15, identifiant: undefined },
    ];

    const erreurs = verifierRangs({
      scenarios,
      rangs: { 'US-001 S01': 2, 'US-009 S09': 4 },
      rangCourant: 1,
      rangDeBase: 2,
    });

    expect(erreurs).toEqual([
      'a.feature:15 : titre sans identifiant « Snn — … »',
      'US-001 S02 : scénario sans rang',
      'US-009 S09 : clé de rang sans scénario',
      'rangCourant 1 inférieur au rang 2 déjà atteint',
    ]);
  });

  it('UT-COMP-83 verifierTags — exige @US-, @RG- connu et @LOT-, refuse @wip et les tags inconnus', () => {
    const regles = reglesDuCahier('| RG-002 | texte |\n| RG-003 | texte |');
    const scenario = (tags: ReadonlyArray<string>) => ({ chemin: 'a.feature', ligne: 1, tags });

    expect(
      verifierTags({ scenarios: [scenario(['@US-001', '@RG-002', '@LOT-001', '@ihm'])], regles }),
    ).toEqual([]);
    expect(verifierTags({ scenarios: [scenario(['@RG-099', '@wip', '@bidule'])], regles })).toEqual(
      [
        'a.feature:1 : tag @US- manquant',
        'a.feature:1 : tag @LOT- manquant',
        'a.feature:1 : @wip interdit',
        'a.feature:1 : @RG-099 absent du cahier des charges',
        'a.feature:1 : tag inconnu @bidule',
      ],
    );
  });

  it('UT-COMP-84 verifierDepot — signale motif manquant, fichier sensible, action non épinglée et versions discordantes', () => {
    const sain = {
      gitignore: MOTIFS_GITIGNORE.join('\n'),
      fichiersSuivis: ['src/main.tsx', '.env.example'],
      workflows: [
        {
          nom: 'ci.yml',
          texte: `permissions:\n  contents: read\njobs:\n  a:\n    steps:\n      - uses: actions/checkout@${'a'.repeat(40)}\n      - uses: ./.github/actions/x\n`,
        },
      ],
      nvmrc: '24\n',
      moteurNode: '>=24 <25',
      envExempleExiste: true,
    };

    expect(verifierDepot(sain)).toEqual([]);
    expect(
      verifierDepot({
        ...sain,
        gitignore: '*.jks',
        fichiersSuivis: ['cles/prod.keystore', '.env.local', 'secrets/a.txt'],
        workflows: [
          { nom: 'mal.yml', texte: 'jobs:\n  a:\n    steps:\n      - uses: actions/checkout@v4\n' },
        ],
        nvmrc: '22',
        envExempleExiste: false,
      }),
    ).toEqual(
      expect.arrayContaining([
        '.gitignore : motif « *.keystore » manquant',
        'cles/prod.keystore : fichier sensible versionné',
        '.env.local : fichier sensible versionné',
        'secrets/a.txt : fichier sensible versionné',
        '.env.example manquant',
        '.nvmrc (22) et engines.node (>=24 <25) discordent',
        'mal.yml : permissions non déclarées',
        'mal.yml : action non épinglée par empreinte de commit : actions/checkout@v4',
      ]),
    );
  });

  it('UT-COMP-85 selectionnerScenarios — ne retient que les rangs atteints, et rien au rang 0', () => {
    const rangs = Object.fromEntries(lireScenarios().map((s) => [s.identifiant ?? '', 2]));
    rangs['US-001 S01'] = 1;

    expect(selectionnerScenarios(0, rangs)).toEqual([]);
    expect(selectionnerScenarios(1, rangs)).toHaveLength(1);
    expect(selectionnerScenarios(2, rangs)).toHaveLength(lireScenarios().length);
    expect(selectionnerScenarios(99, {})).toEqual([]);
  });

  it('UT-OUT-10 verifierTags — admet le tag de traçabilité @ANO-nnn d’un scénario de non-régression (conventions v0.4.8 §11.8)', () => {
    const regles = reglesDuCahier('| RG-017 | texte |');

    expect(
      verifierTags({
        scenarios: [
          { chemin: 'a.feature', ligne: 1, tags: ['@US-017', '@RG-017', '@LOT-001', '@ANO-001'] },
        ],
        regles,
      }),
    ).toEqual([]);
    expect(
      verifierTags({
        scenarios: [
          { chemin: 'a.feature', ligne: 1, tags: ['@US-017', '@RG-017', '@LOT-001', '@ANOMALIE'] },
        ],
        regles,
      }),
    ).toEqual(['a.feature:1 : tag inconnu @ANOMALIE']);
  });

  it('UT-COMP-86 lireScenarios — lit les dix fichiers du lot, 289 scénarios identifiés', () => {
    const scenarios = lireScenarios();

    // 286 depuis US-017 S06c à S06f (ANO-001, glossaire v1.11) ; 289 depuis US-017 S10b, S10c et US-023 S18d (Q-ST017-PEP-2).
    expect(scenarios).toHaveLength(289);
    expect(scenarios.every((s) => s.identifiant !== undefined)).toBe(true);
    expect(scenarios[0]?.tags).toEqual(expect.arrayContaining(['@US-001', '@LOT-001']));
  });

  it('UT-COMP-87 definitionsInutilisees — signale les définitions qu’aucune étape n’utilise', () => {
    const usage = [
      { pattern: 'a', uri: 'a.ts', matches: [{}] },
      { pattern: 'b', uri: 'b.ts', matches: [] },
    ];

    expect(definitionsInutilisees(usage)).toEqual([{ pattern: 'b', uri: 'b.ts' }]);
  });
});
