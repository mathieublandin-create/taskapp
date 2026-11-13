import { z } from 'zod';

/**
 * ADR-014 (M2) : Zod 4 sonde la compilation à la volée par `Function('')`, ce qui émet une violation de la CSP
 * (`script-src` sans `unsafe-eval`). Le mode interprété (`jitless`) supprime la sonde.
 *
 * Effet de bord voulu à l'importation : Zod lit `jitless` à la construction de chaque schéma, et des schémas sont
 * construits à l'évaluation de modules (stockage local, base technique). Ce module doit donc être le premier import
 * de `main.tsx`, avant tout module qui construit un schéma.
 */
z.config({ jitless: true });
