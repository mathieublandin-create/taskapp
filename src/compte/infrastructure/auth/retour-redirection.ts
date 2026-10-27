import { nonImplemente } from '@non-implemente';
import type { RetourGoogle } from '../../application/ports/fournisseur-auth';

// RED-01, RED-02 (conventions.md §9.2.1) : seul fichier qui lit `location.hash` et appelle `history.replaceState`
// (dans la composition, par l'implémentation de NavigationRetour).
export interface NavigationRetour {
  /** Fragment courant, avec ou sans « # ». */
  lireFragment(): string;
  /** history.replaceState(history.state, '', pathname + search). */
  effacerFragment(): void;
}

/** Analyse pure du fragment de retour de Google (RetourGoogle, ST-US-022 §4.3). */
export const analyserFragment = (_fragment: string): RetourGoogle =>
  nonImplemente('analyserFragment');

/**
 * Première instruction de main.tsx, synchrone : copie le fragment, l'efface aussitôt, quel qu'il soit,
 * puis l'analyse. L'effacement précède toujours l'analyse.
 */
export const consommerRetourRedirection = (_navigation: NavigationRetour): RetourGoogle =>
  nonImplemente('consommerRetourRedirection');
