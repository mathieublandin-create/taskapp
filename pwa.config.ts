import type { VitePWAOptions } from 'vite-plugin-pwa';
import { nonImplemente } from '@non-implemente';

// ST-US-018 v0.4 §3 n° 1, §6.1 (rang 12, tranche D2) ; DAT §4.1.5 bis, §4.1.7, §7.4 bis ; conventions §9.1, §14.3.
// Fonction pure, appelée par `vite.config.ts` (qui ne l'importe qu'à la tranche D2, pour que `pnpm build` reste vert
// pendant la phase rouge).

export type EnvironnementPwa = {
  /** `VITE_ENV` : `recette` donne le nom « Done Juan (recette) ». */
  readonly env: string | undefined;
  /** `VITE_BASE_PATH`, terminé par « / » (par défaut « / »). */
  readonly base: string;
};

/**
 * Options de vite-plugin-pwa : `registerType: 'prompt'`, `injectRegister: false` (enregistrement par
 * `enregistrerServiceWorker`, après RED-02) ; Workbox en précache seul (`globPatterns` de tout `dist/`, aucun
 * `runtimeCaching`), `navigateFallback` = `${base}index.html`, `navigateFallbackDenylist` = pages publiques
 * (`${base}accueil.html`, `${base}confidentialite.html`) ; manifeste : `name`, `short_name` « Done Juan », `lang` « fr »,
 * `start_url` et `scope` = `base`, `display` « standalone ».
 */
export const optionsPwa = (environnement: EnvironnementPwa): Partial<VitePWAOptions> =>
  nonImplemente(`optionsPwa ${environnement.base}`);
