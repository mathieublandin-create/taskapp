import type { VitePWAOptions } from 'vite-plugin-pwa';

// ST-US-018 v0.4 §3 n° 1, §6.1 (rang 12, tranche D2) ; DAT §4.1.5 bis, §4.1.7, §7.4 bis ; conventions §9.1, §14.3.
// Fonction pure, appelée par `vite.config.ts` (qui ne l'importe qu'à la tranche D2, pour que `pnpm build` reste vert
// pendant la phase rouge).

export type EnvironnementPwa = {
  /** `VITE_ENV` : `recette` donne le nom « Done Juan (recette) ». */
  readonly env: string | undefined;
  /** `VITE_BASE_PATH`, terminé par « / » (par défaut « / »). */
  readonly base: string;
};

/** Pages publiques du client OAuth (DAT §4.1.7) : servies telles quelles, jamais remplacées par `index.html`. */
const PAGES_PUBLIQUES = ['accueil.html', 'confidentialite.html'];

/** Motif ancré d'un chemin littéral (les caractères spéciaux, dont « . », sont échappés). */
const motifAncre = (chemin: string): RegExp =>
  new RegExp(`^${chemin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);

/**
 * Options de vite-plugin-pwa : `registerType: 'prompt'`, `injectRegister: false` (enregistrement par
 * `enregistrerServiceWorker`, après RED-02) ; Workbox en précache seul (`globPatterns` de tout `dist/`, aucun
 * `runtimeCaching`), `navigateFallback` = `${base}index.html`, `navigateFallbackDenylist` = pages publiques
 * (`${base}accueil.html`, `${base}confidentialite.html`) ; manifeste : `name`, `short_name` « Done Juan », `lang` « fr »,
 * `start_url` et `scope` = `base`, `display` « standalone ».
 */
export const optionsPwa = (environnement: EnvironnementPwa): Partial<VitePWAOptions> => {
  const { env, base } = environnement;
  return {
    registerType: 'prompt',
    injectRegister: false,
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,woff2}'],
      navigateFallback: `${base}index.html`,
      navigateFallbackDenylist: PAGES_PUBLIQUES.map((page) => motifAncre(`${base}${page}`)),
    },
    manifest: {
      name: env === 'recette' ? 'Done Juan (recette)' : 'Done Juan',
      short_name: 'Done Juan',
      lang: 'fr',
      start_url: base,
      scope: base,
      display: 'standalone',
    },
  };
};
