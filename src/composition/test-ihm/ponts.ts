import { ErreurProgrammation } from '../../commun/domaine/erreur-programmation';
import type { PontGoogle } from './fournisseur-auth-test-ihm';
import type { PontDrive } from './transport-par-pont';

// ST-US-018 v0.4 §3 n° 22, §6.4 n° 5 (rang 12, tranche B2) ; ST-US-031 §6.5. Seul module qui lit les bindings
// Playwright exposés par le processus cucumber (`window.donejuanFaux*`, règle ESLint : `src/composition/test-ihm/**`).

declare global {
  // Fusion de déclarations avec `Window` du DOM : une interface est requise.
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    /** Binding de la composition `test-ihm` seulement : absent de toute page de production. */
    readonly donejuanFauxDrive?: unknown;
    /** Binding de la composition `test-ihm` seulement : absent de toute page de production. */
    readonly donejuanFauxGoogle?: unknown;
  }
}

export type PontsTestIhm = { readonly drive: PontDrive; readonly google: PontGoogle };

const exigerFonction = (valeur: unknown, nom: string): unknown => {
  if (typeof valeur !== 'function') {
    throw new ErreurProgrammation(`Binding absent de la page test-ihm : window.${nom}`);
  }
  return valeur;
};

/**
 * Lit les deux bindings de la page ; un binding absent (page ouverte hors de la chaîne `@ihm`) lève
 * `ErreurProgrammation` au démarrage, avant toute ouverture d'espace.
 */
export const lirePonts = (
  fenetre: Pick<Window, 'donejuanFauxDrive' | 'donejuanFauxGoogle'>,
): PontsTestIhm => ({
  drive: exigerFonction(fenetre.donejuanFauxDrive, 'donejuanFauxDrive') as PontDrive,
  google: exigerFonction(fenetre.donejuanFauxGoogle, 'donejuanFauxGoogle') as PontGoogle,
});
