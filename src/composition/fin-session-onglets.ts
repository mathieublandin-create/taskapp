import { nonImplemente } from '@non-implemente';
import type { Annulation } from '../commun/application/ports/planificateur';
import type { AvisOnglets } from '../compte/application/ports/avis-onglets';

// ST-US-031 v0.4 §6.4 (rang 13, tranche B2) ; ST-US-022 v0.3 §6.5, §6.6 ; DAT v0.11.12 §4.1.6 (RL-LOT-001-A1).
// Fin de session décidée par un autre onglet (`SESSION_FERMEE`) ou fermeture imposée (`versionchange`) : la
// coordination de l'espace ouvert est arrêtée (main rendue, cycle arrêté), puis la page est rechargée, sans message.

export type DependancesFinDeSession = {
  /** `Application.arreterCoordination` : sans effet sans espace ouvert. */
  readonly arreterCoordination: () => void;
  /** `Navigateur.recharger`. */
  readonly recharger: () => void;
};

/**
 * Renvoie `quitter` : au premier appel, `arreterCoordination()` puis `recharger()` (rechargement fait même si l'arrêt
 * lève une exception, qui est alors propagée) ; les appels suivants sont sans effet (avis et `versionchange` cumulés).
 */
export const quitterApresFinDeSession = (d: DependancesFinDeSession): (() => void) =>
  nonImplemente(`quitterApresFinDeSession(${typeof d.recharger})`);

/** Branche `quitter` sur l'avis `SESSION_FERMEE` ; l'annulation retire l'écoute. */
export const ecouterFinDeSession = (avis: AvisOnglets, quitter: () => void): Annulation =>
  nonImplemente(`ecouterFinDeSession(${typeof avis.ecouter}, ${typeof quitter})`);
