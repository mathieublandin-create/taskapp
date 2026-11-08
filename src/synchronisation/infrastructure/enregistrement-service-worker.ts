import { nonImplemente } from '@non-implemente';
import type { JournalTechnique } from '../../commun/application/ports/journal-technique';

// ST-US-018 v0.4 §4.3, §6.1 (rang 12, tranche D2) ; DAT §4.1.7 (RED-02), §7.4 : le service worker généré par
// vite-plugin-pwa (`registerType: 'prompt'`) est enregistré par `main.tsx` **après** `consommerRetourRedirection`.

/** Service worker en cours d'installation (sous-ensemble de `ServiceWorker`). */
export type TravailleurInstallation = {
  readonly state: string;
  addEventListener(type: 'statechange', rappel: () => void): void;
};

/** Sous-ensemble de `ServiceWorkerRegistration` utilisé. */
export type EnregistrementObserve = {
  readonly waiting: object | null;
  readonly installing: TravailleurInstallation | null;
  addEventListener(type: 'updatefound', rappel: () => void): void;
};

/** Sous-ensemble de `ServiceWorkerContainer` utilisé. */
export type ConteneurEnregistrement = {
  /** Page déjà contrôlée par un service worker ; null au tout premier chargement. */
  readonly controller: object | null;
  register(url: string, options: { readonly scope: string }): Promise<EnregistrementObserve>;
};

export type DependancesEnregistrementServiceWorker = {
  /** `navigator.serviceWorker`, absent d'un navigateur sans service worker (rien n'est fait). */
  readonly conteneur: ConteneurEnregistrement | undefined;
  /** `VITE_BASE_PATH` (se termine par « / ») : l'URL est `${base}sw.js`, la portée `base`. */
  readonly base: string;
  readonly journal: JournalTechnique;
  /**
   * Une version plus récente attend l'accord de l'utilisateur (`waiting` présent à l'enregistrement, ou nouveau
   * service worker passé à `installed` alors que la page est déjà contrôlée). Jamais au premier chargement.
   */
  readonly surNouvelleVersion: () => void;
};

/**
 * Enregistre le service worker et observe l'arrivée d'une nouvelle version. Un échec de `register` est consigné
 * (`avertissement`, événement `EnregistrementServiceWorkerEnEchec`, champ `erreur` = nom de l'erreur) ; ne rejette
 * jamais.
 */
export const enregistrerServiceWorker = (
  dependances: DependancesEnregistrementServiceWorker,
): Promise<void> => nonImplemente(`enregistrerServiceWorker ${dependances.base}`);
