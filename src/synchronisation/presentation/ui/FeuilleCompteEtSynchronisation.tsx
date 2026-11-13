import { nonImplemente } from '@non-implemente';
import type { ReactElement, ReactNode, Ref } from 'react';
import type { ProprietesFeuilleSynchronisation } from './FeuilleSynchronisation';

// Squelette (ST-CORR-E13B-LOT-001 §5, tranche T5a) : feuille modale « Compte et synchronisation » d'ECR-011 (guide
// v0.2.26 §4.26, §6.6.15, §6.6.16 n° 5 ; ANO-005). Fermée à l'ouverture de l'application, ouverte par `BoutonFeuille`.

/** `id` de la feuille, cible d'`aria-controls` du bouton d'ouverture. */
export const ID_FEUILLE_SYNCHRONISATION = 'feuille-synchronisation';

/** Media query du panneau latéral de 400 px (guide §4.26 : PC, ≥ 1024 px). */
export const MEDIA_PANNEAU_LATERAL = '(min-width: 1024px)';

export type ProprietesFeuilleCompteEtSynchronisation = {
  /** La feuille est présentée tant que `ouverte` est vraie ; elle reste montée pour que Ionic la ferme proprement. */
  readonly ouverte: boolean;
  /** Appelée quand la feuille est refermée : « Fermer », Échap, geste retour, glissement ou fond. */
  readonly surFermee: () => void;
  /** Section « À lire » (`ModificationsNonRetenues`) ; absente s'il n'y a rien à lire. Rendue en premier. */
  readonly aLire?: ReactNode;
  /** Section « Synchronisation » (`ALR-016` en tête, `ALR-015` et « Stockage » en pied) ; absente sans espace. */
  readonly synchronisation?: ProprietesFeuilleSynchronisation;
  /** Section « Compte » (`SectionCompte`) ; rendue en dernier. */
  readonly compte?: ReactNode;
  /** Confirmations et `ERR-017` ouvertes depuis la feuille : rendues **dans** la modale (piège d'ANO-007, focus). */
  readonly dialogues?: ReactNode;
};

export const FeuilleCompteEtSynchronisation = (
  p: ProprietesFeuilleCompteEtSynchronisation,
): ReactElement => nonImplemente(`FeuilleCompteEtSynchronisation(${String(p.ouverte)})`);

export type ProprietesBoutonFeuille = {
  /** Reflète l'état de la feuille (`aria-expanded`). */
  readonly ouverte: boolean;
  readonly surOuvrir: () => void;
  /** Cible du focus quand la dernière entrée de « À lire » disparaît, feuille fermée (DT-028). */
  readonly refElement?: Ref<HTMLButtonElement>;
};

/** Bouton d'ouverture de la feuille, sur la ligne d'état, juste après l'indicateur (Q-CORR-STE-1, option a). */
export const BoutonFeuille = (p: ProprietesBoutonFeuille): ReactElement =>
  nonImplemente(`BoutonFeuille(${String(p.ouverte)})`);
