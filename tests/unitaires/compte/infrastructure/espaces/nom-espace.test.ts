import { describe, expect, it } from 'vitest';
import { nomEspace } from '@src/compte/infrastructure/espaces/nom-espace';
import { compte } from '@tests/support/compte/doublures-compte';

describe('nomEspace (conventions §9.3, DEC-016)', () => {
  it('UT-US-022-37 nomEspace — préfixe de l’environnement puis SHA-256 hexadécimal du sub, sans le sub en clair', async () => {
    // SHA-256 de « abc » (FIPS 180-2, exemple B.1).
    const nom = await nomEspace('recette', compte('abc'));

    expect(nom).toBe(
      'donejuan-recette-ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
    expect(await nomEspace('production', compte('sub-A'))).toMatch(
      /^donejuan-production-[0-9a-f]{64}$/,
    );
    expect(await nomEspace('production', compte('sub-A'))).not.toContain('sub-A');
  });
});
