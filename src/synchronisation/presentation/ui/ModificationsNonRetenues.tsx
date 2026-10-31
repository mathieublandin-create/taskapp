import { nonImplemente } from '@non-implemente';
import type { ReactElement } from 'react';
import type { RefElementMetier } from '../../domaine/information';
import type { ModeleVueModificationsNonRetenues } from '../modeles-de-vue/modifications-non-retenues';

// DiscardedItem (guide §4.24, §6.6.9) dans la section « À lire » d'ECR-011, en tête de la feuille (ST-US-017 v0.5 §4.6).
export type ProprietesModificationsNonRetenues = {
  readonly vue: ModeleVueModificationsNonRetenues;
  /** « Compris » : identifiants d'une ligne, ou de toutes les lignes `ALR-014` de la carte `ALR-008`. */
  readonly surCompris: (ids: ReadonlyArray<string>) => void;
  readonly surVoir: (element: RefElementMetier) => void;
};

export const ModificationsNonRetenues = (p: ProprietesModificationsNonRetenues): ReactElement =>
  nonImplemente(`ModificationsNonRetenues (${String(p.vue.n)})`);
