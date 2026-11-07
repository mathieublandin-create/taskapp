import { nonImplemente } from '@non-implemente';
import type {
  IssueMiseAJour,
  MiseAJourApplication,
} from '../application/ports/mise-a-jour-application';

// ST-US-017 v0.11 §6.8 n° 10 (rang 11, tranche D1) ; DAT §4.2 (Q-US-017-10 a). Le service worker et son traitement du
// message `{ type: 'SKIP_WAITING' }` sont livrés au rang 12 (ST-US-018 §3 n° 1 et 7, vite-plugin-pwa en mode
// `prompt`) ; avant, `getRegistration()` rend undefined et l'issue est `AUCUNE_VERSION`.

/** Sous-ensemble de `ServiceWorkerContainer` utilisé (injectable pour les tests). */
export type ConteneurServiceWorker = {
  getRegistration(): Promise<EnregistrementServiceWorker | undefined>;
  addEventListener(type: 'controllerchange', rappel: () => void, options?: { once: boolean }): void;
};

export type EnregistrementServiceWorker = {
  update(): Promise<unknown>;
  readonly waiting: { postMessage(message: unknown): void } | null;
};

export type DependancesMiseAJourServiceWorker = {
  /** `navigator.serviceWorker` ; absent (navigateur sans service worker) : AUCUNE_VERSION. */
  readonly conteneur: ConteneurServiceWorker | undefined;
  /** `() => location.reload()`, fourni par `main.tsx` (seul fichier qui touche à `location`). */
  readonly recharger: () => void;
};

/**
 * `mettreAJour()` : enregistrement absent → AUCUNE_VERSION ; `await update()` (exception → ECHEC) ; `waiting` nul →
 * AUCUNE_VERSION ; sinon abonnement `controllerchange` (une fois) → `recharger()`, puis
 * `waiting.postMessage({ type: 'SKIP_WAITING' })`, RECHARGEMENT_LANCE.
 */
export class MiseAJourServiceWorker implements MiseAJourApplication {
  constructor(private readonly dependances: DependancesMiseAJourServiceWorker) {}

  mettreAJour(): Promise<IssueMiseAJour> {
    return nonImplemente(`MiseAJourServiceWorker.mettreAJour (${typeof this.dependances})`);
  }
}
