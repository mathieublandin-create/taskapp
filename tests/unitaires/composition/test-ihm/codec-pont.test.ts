/**
 * ST-US-018 v0.4 §6.4, §13 (rang 12, tranche B2) : codec du pont entre la page `test-ihm` et le processus cucumber.
 * Aller-retour sans perte des valeurs échangées ; refus explicite de toute valeur que JSON perdrait en silence.
 */
import { describe, expect, it } from 'vitest';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import { echec, succes } from '@src/commun/domaine/resultat';
import { decoderPont, encoderPont } from '@src/composition/test-ihm/codec-pont';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import { registre } from '@tests/support/fabriques/etat-local';
import { hlc, idObjectif, SMARTPHONE } from '@tests/support/valeurs';

const CONTENU: ContenuFichierAppareil = {
  schemaVersion: 1,
  versionApplication: '0.1.0',
  generation: { type: 'NOUVELLE', hlc: hlc('2026-10-21T08:00:00.000Z', 3, SMARTPHONE) },
  appareil: SMARTPHONE,
  registres: [
    registre(
      { type: 'OBJECTIF', id: idObjectif(1), champ: 'intitule' },
      'Publier « le guide » — ébauche',
      hlc('2026-10-21T08:00:00.000Z', 0, SMARTPHONE),
    ),
  ],
  journal: [],
  inconnus: {
    registres: [],
    evenements: [
      {
        id: 'evt-1',
        hlc: hlc('2026-10-21T08:00:01.000Z', 0, SMARTPHONE),
        brut: { type: 'FUTUR', niveau: 2, actif: true, rien: null, liste: [1, 'a'] },
      },
    ],
  },
};

const allerRetour = (valeur: unknown): unknown => decoderPont(encoderPont(valeur));

describe('encoderPont, decoderPont (ST-US-018 §6.4)', () => {
  it('UT-US-018-13 aller-retour sans perte — contenu de fichier d’appareil (génération, registres, inconnus), succès et échecs du transport', () => {
    expect(allerRetour(CONTENU)).toStrictEqual(CONTENU);
    expect(allerRetour(succes({ id: 'f-1', version: '7' }))).toStrictEqual(
      succes({ id: 'f-1', version: '7' }),
    );
    expect(allerRetour(echec({ type: 'FormatPlusRecent', schemaVersion: 2 }))).toStrictEqual(
      echec({ type: 'FormatPlusRecent', schemaVersion: 2 }),
    );
    expect(allerRetour(['dossier-1', { dossier: 'dossier-1', contenu: CONTENU }])).toStrictEqual([
      'dossier-1',
      { dossier: 'dossier-1', contenu: CONTENU },
    ]);
  });

  it('UT-US-018-13 propriété de valeur undefined — omise (exactOptionalPropertyTypes), comme une propriété absente', () => {
    expect(allerRetour({ dossier: 'd', fichierExistant: undefined })).toStrictEqual({
      dossier: 'd',
    });
    expect(encoderPont(succes(undefined))).toBe(encoderPont({ ok: true }));
  });

  it.each<[string, unknown]>([
    ['undefined à la racine', undefined],
    ['undefined dans un tableau', [1, undefined]],
    ['NaN', { n: Number.NaN }],
    ['Infinity', [Number.POSITIVE_INFINITY]],
    ['bigint', { n: 1n }],
    ['fonction', { f: () => undefined }],
    ['Uint8Array', { octets: new Uint8Array([1, 2]) }],
    ['Map', { m: new Map([['a', 1]]) }],
    ['Set', [new Set([1])]],
    ['Date', { d: new Date(0) }],
    ['instance de classe', { e: new Error('x') }],
  ])(
    'UT-US-018-13 valeur refusée (%s) — ErreurProgrammation, rien n’est perdu en silence',
    (_cas, valeur) => {
      expect(() => encoderPont(valeur)).toThrow(ErreurProgrammation);
    },
  );

  it('UT-US-018-13 texte qui n’est pas du JSON — ErreurProgrammation', () => {
    expect(() => decoderPont('{pas du json')).toThrow(ErreurProgrammation);
  });
});
