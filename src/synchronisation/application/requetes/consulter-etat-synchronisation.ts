import type { EtatReseau } from '../../../commun/application/ports/etat-reseau';
import type { Instant } from '../../../commun/domaine/temps/instant';
import type { MasquageRappel } from '../masquage-rappel';
import type { AccesGoogle } from '../ports/acces-google';
import type { EtatMoteur, SuiviCycle } from '../ports/suivi-cycle';

// ST-US-022 §3.2 n° 44 : entrée unique de l'indicateur et du bandeau (conventions.md §8.5).
export type AttenteLocale = {
  /** Décompte par élément (DAT §4.1.5 bis). */
  readonly enAttente: number;
  readonly plusAncienneEnAttente?: Instant;
  /**
   * ST-US-017 v0.5 §4.6 (incrément 2, tranche B3) : `compterALire` des signalements de l'espace ; absent ≡ 0. Source
   * d'`aLire`, à la place d'`EtatMoteur.aLire` (DT-025).
   */
  readonly aLire?: number;
};

/**
 * Même forme que `EtatSynchronisationAffichable` (presentation/modeles-de-vue) : l'application ne dépend pas
 * de la présentation (conventions.md §2.2), le compilateur vérifie la compatibilité à l'appel.
 */
export type EtatSynchronisationLu = {
  readonly reseau: 'CONNECTE' | 'COUPE';
  readonly acces: 'VALIDE' | 'A_RENOUVELER' | 'PERDU';
  readonly cycle: EtatMoteur['cycle'];
  readonly actionRequise?: NonNullable<EtatMoteur['actionRequise']>;
  readonly enAttente: number;
  readonly plusAncienneEnAttente?: Instant;
  readonly aLire: number;
  readonly rappelMasque: boolean;
};

export type DependancesConsulterEtat = {
  readonly reseau: EtatReseau;
  readonly acces: AccesGoogle;
  readonly suivi: SuiviCycle;
  readonly masquage: MasquageRappel;
  readonly attente: () => Promise<AttenteLocale>;
};

/** Sans session, rien n'est affiché : undefined. */
export const consulterEtatSynchronisation = async (
  d: DependancesConsulterEtat,
): Promise<EtatSynchronisationLu | undefined> => {
  const acces = d.acces.etat();
  if (acces === 'SANS_SESSION') return undefined;
  const moteur = d.suivi.etatMoteur();
  const attente = await d.attente();
  return {
    reseau: d.reseau.estConnecte() ? 'CONNECTE' : 'COUPE',
    acces,
    cycle: moteur.cycle,
    ...(moteur.actionRequise === undefined ? {} : { actionRequise: moteur.actionRequise }),
    enAttente: attente.enAttente,
    ...(attente.plusAncienneEnAttente === undefined
      ? {}
      : { plusAncienneEnAttente: attente.plusAncienneEnAttente }),
    // DT-025 : `EtatMoteur.aLire` n'est plus lu (ST-US-017 v0.5 §3.4, I2-16).
    aLire: attente.aLire ?? 0,
    rappelMasque: d.masquage.estMasque(),
  };
};
