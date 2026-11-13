import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

describe('zod-sans-compilation (ADR-014, M2)', () => {
  afterEach(() => {
    z.config({ jitless: false });
    vi.resetModules();
  });

  it("UT-COMP-US-022-210 l'importation passe Zod en mode interprété, sans sonde de compilation à la volée", async () => {
    z.config({ jitless: false });

    await import('@src/compte/infrastructure/zod-sans-compilation');

    expect(z.config().jitless).toBe(true);
  });

  it('UT-COMP-US-022-211 la validation reste correcte en mode interprété', async () => {
    await import('@src/compte/infrastructure/zod-sans-compilation');
    const schema = z.object({ nom: z.string() });

    expect(schema.safeParse({ nom: 'Done Juan' }).success).toBe(true);
    expect(schema.safeParse({ nom: 1 }).success).toBe(false);
  });
});
