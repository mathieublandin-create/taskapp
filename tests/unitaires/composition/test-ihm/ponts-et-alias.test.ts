/**
 * ST-US-018 v0.4 §3 n° 22, §6.4 n° 5 et 6 (rang 12, tranche B2), tests complémentaires de Bruce : lecture des bindings
 * de la page `test-ihm` et alias du mode `test-ihm` (seul `main.tsx` est redirigé ; aucun alias hors de ce mode).
 * UT-COMP-US-018-13 et 20.
 */
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import { lirePonts } from '@src/composition/test-ihm/ponts';
import { aliasDuMode, MODE_TEST_IHM } from '../../../../vite.config';

const pontDrive = () => Promise.resolve('null');
const pontGoogle = () => Promise.resolve('null');

describe('lirePonts (ST-US-018 §6.4 n° 5)', () => {
  it('UT-COMP-US-018-13 bindings présents — rendus tels quels, sans appel', () => {
    expect(lirePonts({ donejuanFauxDrive: pontDrive, donejuanFauxGoogle: pontGoogle })).toEqual({
      drive: pontDrive,
      google: pontGoogle,
    });
  });

  it.each<[string, Record<string, unknown>]>([
    ['donejuanFauxDrive', { donejuanFauxGoogle: pontGoogle }],
    ['donejuanFauxGoogle', { donejuanFauxDrive: pontDrive }],
    [
      'donejuanFauxDrive',
      { donejuanFauxDrive: 'pas une fonction', donejuanFauxGoogle: pontGoogle },
    ],
    ['donejuanFauxGoogle', { donejuanFauxDrive: pontDrive, donejuanFauxGoogle: null }],
  ])(
    'UT-COMP-US-018-13 binding %s absent ou invalide — ErreurProgrammation qui le nomme',
    (nom, fenetre) => {
      expect(() => lirePonts(fenetre)).toThrow(
        new ErreurProgrammation(`Binding absent de la page test-ihm : window.${nom}`),
      );
    },
  );
});

describe('aliasDuMode (ST-US-018 §6.4 n° 6)', () => {
  const COMPOSITION_TEST = fileURLToPath(
    new URL('../../../../src/composition/test-ihm.ts', import.meta.url),
  );

  it('UT-COMP-US-018-20 mode test-ihm — un seul alias : « ./composition/web » (main.tsx) vers test-ihm.ts ; « ./web » (test-ihm.ts) et les autres chemins restent intacts', () => {
    const alias = aliasDuMode(MODE_TEST_IHM);

    expect(MODE_TEST_IHM).toBe('test-ihm');
    expect(alias.map((a) => a.replacement)).toEqual([COMPOSITION_TEST]);
    const correspond = (specificateur: string): boolean =>
      alias.some((a) => a.find.test(specificateur));
    expect(correspond('./composition/web')).toBe(true);
    expect(
      ['./web', '../composition/web', './composition/web-autre', './composition/web.ts'].filter(
        correspond,
      ),
    ).toEqual([]);
  });

  it.each(['production', 'development', 'recette', 'test'])(
    'UT-COMP-US-018-20 mode %s — aucun alias : la composition de test n’entre jamais dans ce build',
    (mode) => {
      expect(aliasDuMode(mode)).toEqual([]);
    },
  );
});
