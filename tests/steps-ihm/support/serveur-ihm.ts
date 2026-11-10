/**
 * Serveur statique du build `test-ihm` (ST-US-018 v0.4 §12.3) : `vite preview` sur `dist-test-ihm`, port fixe et
 * `strictPort` (jamais celui du harnais ni du build de production des tests `e2e`). Le build est produit par
 * `pnpm build:test-ihm` (script `cucumber:ihm`) : il n'est jamais construit ici.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { preview } from 'vite';
import { MODE_TEST_IHM } from '../../../vite.config';

export const PORT_IHM = 4175;
export const ORIGINE_IHM = `http://localhost:${String(PORT_IHM)}`;

const DOSSIER_BUILD_IHM = 'dist-test-ihm';

export type ServeurIhm = { readonly arreter: () => Promise<void> };

export const demarrerServeurIhm = async (): Promise<ServeurIhm> => {
  if (!existsSync(resolve(DOSSIER_BUILD_IHM, 'index.html'))) {
    throw new Error(`Build absent : lancer « pnpm build:test-ihm » (dossier ${DOSSIER_BUILD_IHM})`);
  }
  const serveur = await preview({
    mode: MODE_TEST_IHM,
    build: { outDir: DOSSIER_BUILD_IHM },
    preview: { host: 'localhost', port: PORT_IHM, strictPort: true },
  });
  return { arreter: () => serveur.close() };
};
