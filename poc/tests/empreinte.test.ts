import { describe, expect, it } from 'vitest';
import { empreinteSha256 } from '../src/drive/empreinte';
import { genererEtatPoc } from '../src/drive/etat-poc';

describe('empreinte SHA-256', () => {
  it('calcule le condensat connu de « abc »', async () => {
    const empreinte = await empreinteSha256(new TextEncoder().encode('abc'));
    expect(empreinte).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('génère un fichier d’état d’environ 10 Ko, différent à chaque appel', async () => {
    const a = await genererEtatPoc('pc');
    const b = await genererEtatPoc('pc');
    expect(a.length).toBeGreaterThan(8_000);
    expect(a.length).toBeLessThan(16_000);
    expect(await empreinteSha256(a)).not.toBe(await empreinteSha256(b));
  });
});
