/**
 * Repères de la page de l'application pour les étapes `@ihm` (ST-US-018 v0.4 §12.2) : rôles accessibles, `data-etat`
 * et classes de présentation de la PWA (`src/main.tsx`, `ligne-tache.tsx`). Le texte d'une ligne de tâche vient du
 * modèle de vue (`construireLigneTache`), jamais d'un libellé recopié.
 */
import type { Locator, Page } from '@playwright/test';
import { LIBELLES_FEUILLE } from '@src/synchronisation/presentation/ui/libelles-feuille';

export type EcranAffiche = 'CONNEXION' | 'APPLICATION';

export const boutonConnexion = (page: Page): Locator =>
  page.getByRole('button', { name: /continuer avec google/i });

/** Espace de l'application (ligne d'état, bandeau, espaces Tâches et Objectifs) ; la section « Compte » est dans la feuille. */
export const espaceApplication = (page: Page): Locator => page.locator('main.espace-application');

/** Bouton d'ouverture de la feuille « Compte et synchronisation », à droite de l'indicateur (Q-CORR-STE-1). */
export const boutonFeuille = (page: Page): Locator =>
  page.getByRole('button', { name: LIBELLES_FEUILLE.ouvrir, exact: true });

/** Enveloppe de la feuille (rôle `dialog` porté par Ionic dans son shadow DOM), pour attendre sa présentation. */
export const dialogueFeuille = (page: Page): Locator =>
  page.getByRole('dialog', { name: LIBELLES_FEUILLE.titre });

/**
 * Contenu de la feuille « Compte et synchronisation » : l'hôte `ion-modal`. Le contenu est dans le DOM léger, projeté
 * dans l'enveloppe `dialog` du shadow DOM : il n'en est pas un descendant, `dialogueFeuille(page).getByRole(…)` ne le
 * trouverait pas.
 */
export const feuilleCompte = (page: Page): Locator =>
  page.locator('ion-modal.feuille-synchronisation');

/** Indicateur de synchronisation (`role="status"` et `data-etat="SYN-…"`) ; le premier, hors feuille et cartes. */
export const indicateur = (page: Page): Locator =>
  page.locator('div[role="status"][data-etat^="SYN-"]').first();

/** Code `data-etat` de l'indicateur ; `undefined` sans indicateur (connexion, page d'erreur du navigateur). */
export const etatIndicateur = async (page: Page): Promise<string | undefined> =>
  (await indicateur(page).count()) === 0
    ? undefined
    : ((await indicateur(page).getAttribute('data-etat')) ?? undefined);

/** États où l'application a fini ce qu'elle entreprenait (ni hors ligne, ni en cours, ni en attente de départ). */
const ETATS_STABLES: ReadonlySet<string | undefined> = new Set([
  'SYN-OK',
  'SYN-SESSION',
  'SYN-ACTION',
  'SYN-INFO',
  undefined,
]);

export const synchronisationStable = (etat: string | undefined): boolean => ETATS_STABLES.has(etat);

/** Tout élément d'un écran de Done Juan : racine d'attente, indicateur, connexion ou espace. */
export const elementsDeDoneJuan = (page: Page): Locator =>
  page.locator('[data-etat], main.espace-application, [data-action]');

export const lignesTaches = (page: Page): Locator => page.locator('li.ligne-tache');

const echapper = (texte: string): string => texte.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

/** Ligne dont l'intitulé est exactement `intitule`. */
export const ligneTache = (page: Page, intitule: string): Locator =>
  lignesTaches(page).filter({
    has: page.locator('.ligne-tache-intitule', { hasText: new RegExp(`^${echapper(intitule)}$`) }),
  });

export const lignesObjectifs = (page: Page): Locator => page.locator('li.ligne-objectif');

/** Ligne d'objectif dont l'intitulé est exactement `intitule` (`ligne-objectif.tsx`). */
export const ligneObjectif = (page: Page, intitule: string): Locator =>
  lignesObjectifs(page).filter({
    has: page.locator('.ligne-objectif-intitule', {
      hasText: new RegExp(`^${echapper(intitule)}$`),
    }),
  });

/** Bouton de la barre d'onglets du bas (espaces « Tâches » et « Objectifs », guide §4.14) ; `libelle` vient de `LIBELLES_*`. */
export const boutonEspace = (page: Page, libelle: string): Locator =>
  page.locator('nav.barre-onglets').getByRole('button', { name: libelle, exact: true });

/** Boîte de confirmation (`role="alertdialog"`, guide §6.6.7). */
export const dialogueConfirmation = (page: Page): Locator => page.getByRole('alertdialog');

/** Écran rendu, s'il y en a un : connexion (bouton) ou espace de l'application. */
export const ecranAffiche = async (page: Page): Promise<EcranAffiche | undefined> => {
  if (await espaceApplication(page).isVisible()) return 'APPLICATION';
  if (await boutonConnexion(page).isVisible()) return 'CONNEXION';
  return undefined;
};

/** Intitulés des tâches affichées, dans l'ordre de la liste. */
export const intitulesAffiches = (page: Page): Promise<ReadonlyArray<string>> =>
  lignesTaches(page).locator('.ligne-tache-intitule').allInnerTexts();
