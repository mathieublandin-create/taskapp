/**
 * Outils des tests de composants d'US-001 (ST-US-001 §14) : services d'objectifs réels sur l'environnement d'écriture
 * (fake-indexeddb), magasin Zustand et gestes utilisateur sur les composants Ionic.
 */
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assemblerObjectifsTaches } from '@src/composition/objectifs-taches';
import type { IdObjectif } from '@src/commun/domaine/identifiants';
import { echec } from '@src/commun/domaine/resultat';
import {
  creerMagasinObjectifsTaches,
  type ServicesObjectifs,
} from '@src/objectifs-taches/presentation/ui/etat/magasin-objectifs-taches';
import type { ServiceEtatLocal } from '@src/synchronisation/application/service-etat-local';
import { creerEnvironnement, valeurDe, type Environnement } from './environnement';

export type BancObjectifs = {
  readonly env: Environnement;
  readonly services: ServicesObjectifs;
  readonly magasin: ReturnType<typeof creerMagasinObjectifsTaches>;
  /** Crée un objectif par le cas d'usage et rend son identifiant. */
  readonly creer: (intitule: string, delai?: string) => Promise<IdObjectif>;
};

const DEPART = '2026-10-21T08:00:00.000Z';

const banc = (env: Environnement, service: ServiceEtatLocal): BancObjectifs => {
  const services = assemblerObjectifsTaches({
    service,
    generateur: env.generateur,
    horloge: env.horloge,
    observer: (rappel) => env.depot.observer(rappel),
  });
  return {
    env,
    services,
    magasin: creerMagasinObjectifsTaches(services),
    creer: async (intitule, delai) =>
      valeurDe(
        await services.creerObjectif.executer({
          intitule,
          ...(delai === undefined ? {} : { delai: delai as never }),
        }),
      ),
  };
};

export const creerBancObjectifs = (depart: string = DEPART): BancObjectifs => {
  const env = creerEnvironnement(depart);
  return banc(env, env.service);
};

/**
 * Banc dont les écritures peuvent échouer comme un espace local inaccessible (ERR-014) ; les lectures fonctionnent.
 * `interrompre()` rend les écritures suivantes impossibles.
 */
export const creerBancEcritureInterruptible = (): BancObjectifs & {
  readonly interrompre: () => void;
} => {
  const env = creerEnvironnement(DEPART);
  let interrompu = false;
  const service: ServiceEtatLocal = {
    lire: () => env.service.lire(),
    lireJournal: (element) => env.service.lireJournal(element),
    lireDecompteEnAttente: () => env.service.lireDecompteEnAttente(),
    modifier: (decision) =>
      interrompu
        ? Promise.resolve(echec({ type: 'EcritureLocaleImpossible' as const }))
        : env.service.modifier(decision),
  };
  return {
    ...banc(env, service),
    interrompre: () => {
      interrompu = true;
    },
  };
};

/** Banc dont toutes les écritures échouent. */
export const creerBancEcritureImpossible = (): BancObjectifs => {
  const interruptible = creerBancEcritureInterruptible();
  interruptible.interrompre();
  return interruptible;
};

/** Champ natif d'un composant Ionic (IonInput, IonTextarea) retrouvé par son libellé. */
export const champ = async (
  libelle: RegExp | string,
): Promise<HTMLInputElement | HTMLTextAreaElement> => {
  const composant = await waitFor(() => {
    const trouve = Array.from(
      document.querySelectorAll<HTMLElement & { label?: string }>('ion-input, ion-textarea'),
    ).find((e) =>
      typeof libelle === 'string' ? e.label === libelle : libelle.test(e.label ?? ''),
    );
    if (trouve === undefined) throw new Error(`Champ « ${String(libelle)} » absent`);
    return trouve;
  });
  const natif = composant.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
  if (natif === null) throw new Error(`Champ natif « ${String(libelle)} » absent`);
  return natif;
};

/** Bouton Ionic (ion-button, ion-fab-button) retrouvé par son texte ou son nom accessible. */
export const boutonIon = async (nom: string): Promise<HTMLElement> =>
  waitFor(() => {
    const trouve = Array.from(
      document.querySelectorAll<HTMLElement>('ion-button, ion-fab-button'),
    ).find((b) => b.textContent.trim() === nom || b.getAttribute('aria-label') === nom);
    if (trouve === undefined) throw new Error(`Bouton « ${nom} » absent`);
    return trouve;
  });

export const cliquerBoutonIon = async (nom: string): Promise<void> => {
  await userEvent.click(await boutonIon(nom));
};

export const saisir = async (libelle: RegExp | string, texte: string): Promise<void> => {
  const natif = await champ(libelle);
  await userEvent.clear(natif);
  if (texte !== '') await userEvent.type(natif, texte);
};

/** Bouton d'une feuille d'actions ou d'une alerte Ionic (boutons natifs, hors DOM fantôme). */
export const choixDuMenu = async (texte: string): Promise<void> => {
  await userEvent.click(await screen.findByRole('button', { name: texte }));
};

const ATTENTE_FERMETURE_MS = 150;

const apresEvenement = (nom: string): Promise<void> =>
  new Promise((resolve) => {
    document.addEventListener(
      nom,
      () => {
        resolve();
      },
      { once: true },
    );
  });

/**
 * Exécute un geste qui ouvre une superposition Ionic et attend la fin de sa présentation : avant, Ionic déplace le
 * focus et une saisie en cours serait interrompue.
 */
export type Superposition = 'Modal' | 'ActionSheet';

/** Attend la fin de la fermeture d'une superposition (Ionic démonte mal une superposition encore présentée). */
export const apresFermeture = async (superposition: Superposition): Promise<void> => {
  await apresEvenement(`ion${superposition}DidDismiss`);
  // Ionic retire encore la superposition de la page après l'événement : le démontage doit attendre.
  await new Promise((resolve) => setTimeout(resolve, ATTENTE_FERMETURE_MS));
};

export const ouvrir = async (
  superposition: Superposition,
  geste: () => Promise<void>,
): Promise<void> => {
  const presentee = apresEvenement(`ion${superposition}DidPresent`);
  await geste();
  await presentee;
};

/**
 * Démonte les composants puis retire les superpositions Ionic téléportées dans le corps de la page, après avoir laissé
 * à Ionic le temps d'achever leur fermeture (sinon il tente de retirer un élément déjà détaché).
 */
export const nettoyerDocument = async (): Promise<void> => {
  cleanup();
  await new Promise((resolve) => setTimeout(resolve, ATTENTE_FERMETURE_MS));
  document.body.replaceChildren();
};
