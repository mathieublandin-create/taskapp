import { describe, expect, it } from 'vitest';
import {
  empreinteSha256,
  serialiserCanonique,
} from '@src/synchronisation/infrastructure/drive/serialisation-canonique';

describe('Sérialisation canonique (conventions §10.3)', () => {
  it('UT-US-017-10 serialiserCanonique — trie les clés à tous les niveaux, garde l’ordre des tableaux, sans espace', () => {
    expect(serialiserCanonique({ b: 1, a: { d: [3, { z: 1, y: null }], c: 'é' } })).toBe(
      '{"a":{"c":"é","d":[3,{"y":null,"z":1}]},"b":1}',
    );
    expect(serialiserCanonique({ B: 1, a: 2, _: 3 })).toBe('{"B":1,"_":3,"a":2}');
  });

  it('UT-US-017-11 empreinteSha256 — calcule le SHA-256 hexadécimal de l’UTF-8 (vecteur « abc »)', async () => {
    expect(await empreinteSha256('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });
});
