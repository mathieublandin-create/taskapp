/**
 * ST-US-018 v0.4 §6.4 n° 1 (rang 12, tranche B2), tests complémentaires de Bruce : codec du pont.
 * Propriété d'aller-retour sur toute valeur JSON ; cas limites du JSON strict (prototype nul, clé symbole, `toJSON`) ;
 * message d'erreur : chemin et type, jamais la valeur (aucun jeton recopié). UT-COMP-US-018-17 à 19.
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import { decoderPont, encoderPont } from '@src/composition/test-ihm/codec-pont';

describe('encoderPont, decoderPont — compléments (ST-US-018 §6.4 n° 1)', () => {
  it('UT-COMP-US-018-17 propriété — toute valeur JSON fait l’aller-retour à l’identique, et s’encode comme JSON.stringify', () => {
    fc.assert(
      fc.property(fc.jsonValue(), (valeur) => {
        const texte = encoderPont(valeur);
        expect(texte).toBe(JSON.stringify(valeur));
        expect(decoderPont(texte)).toEqual(JSON.parse(texte));
        expect(decoderPont(texte)).toEqual(valeur);
      }),
    );
  });

  it('UT-COMP-US-018-17 propriété — une valeur interdite enfouie à n’importe quelle profondeur est refusée', () => {
    const interdite = fc.constantFrom<unknown>(
      undefined,
      Number.NaN,
      Number.NEGATIVE_INFINITY,
      2n,
      new Map(),
      new Date(0),
    );
    fc.assert(
      fc.property(
        interdite,
        fc.array(fc.oneof(fc.constant('tableau'), fc.string()), { maxLength: 6 }),
        (valeur, chemin) => {
          // Chaque étape enveloppe la valeur dans un tableau (« tableau ») ou dans un objet, sous la clé donnée.
          const enfouie = chemin.reduce<unknown>(
            (interieur, cle) =>
              cle === 'tableau' ? [1, interieur] : { autre: 1, [cle]: interieur },
            valeur,
          );
          // L'enveloppe la plus intérieure est la première du chemin.
          // Seul cas admis : `undefined` en propriété d'objet (omise, comme absente).
          const admise = valeur === undefined && chemin.length > 0 && chemin[0] !== 'tableau';
          const leve = (): unknown => {
            try {
              encoderPont(enfouie);
              return undefined;
            } catch (erreur) {
              return erreur;
            }
          };
          expect(leve() instanceof ErreurProgrammation).toBe(!admise);
        },
      ),
    );
  });

  it('UT-COMP-US-018-18 objet à prototype nul — admis ; objet à clé symbole, objet doté de toJSON, tableau creux — refusés', () => {
    const sansPrototype: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
    sansPrototype['a'] = 1;
    expect(decoderPont(encoderPont(sansPrototype))).toEqual({ a: 1 });

    expect(() => encoderPont({ a: 1, [Symbol('cache')]: 2 })).toThrow(ErreurProgrammation);
    expect(() => encoderPont({ toJSON: () => 'autre chose' })).toThrow(ErreurProgrammation);
    // eslint-disable-next-line no-sparse-arrays -- un trou de tableau deviendrait `null` en silence.
    expect(() => encoderPont([1, , 3])).toThrow(ErreurProgrammation);
  });

  it('UT-COMP-US-018-19 message — chemin et type de la valeur refusée, jamais la valeur elle-même', () => {
    const jeton = 'ya29.secret-du-test';
    const valeur = { contenu: { registres: [{ id: 'r', brut: new Date(jeton.length) }] } };

    expect(() => encoderPont(valeur)).toThrow(
      new ErreurProgrammation(
        'Valeur non transmissible par le pont en $.contenu.registres[0].brut : Date',
      ),
    );
    expect(() => encoderPont({ jeton, n: Number.POSITIVE_INFINITY })).toThrow(
      new ErreurProgrammation(
        'Valeur non transmissible par le pont en $.n : nombre non fini (Infinity)',
      ),
    );
    expect(() => decoderPont(`{"jeton":"${jeton}"`)).toThrow(
      new ErreurProgrammation('Texte du pont illisible (30 caractères)'),
    );
  });
});
