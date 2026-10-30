import type { ReactElement } from 'react';
import { nonImplemente } from '@non-implemente';
import type {
  ActionCarteFeuille,
  ModeleVueFeuilleSynchronisation,
} from '../modeles-de-vue/feuille-synchronisation';

// SyncSheet, section « Synchronisation » (ECR-011, guide §4.26, §6.6.2 ; ST-US-017 v0.4 §4.5) : data-etat des lignes
// SYN-FEUILLE-…, data-message des cartes ; boutons natifs (aria-disabled focalisable). Textes : modèle de vue.
export type ProprietesFeuilleSynchronisation = {
  readonly vue: ModeleVueFeuilleSynchronisation;
  readonly surSynchroniser: () => void;
  readonly surActionCarte: (action: ActionCarteFeuille) => void;
};

export const FeuilleSynchronisation = (_p: ProprietesFeuilleSynchronisation): ReactElement =>
  nonImplemente('FeuilleSynchronisation');
