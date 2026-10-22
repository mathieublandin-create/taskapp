import { nonImplemente } from '@non-implemente';
import type { IdObjectif } from '../../commun/domaine/identifiants';
import type { VueMetier } from './vue-metier';

// RG-025 (ST-US-001 §6.2) : dérivé, jamais stocké.
export type EtatObjectif = 'EN_COURS' | 'ATTEINT' | 'A_DECLINER';

export const etatObjectif = (_vue: VueMetier, _id: IdObjectif): EtatObjectif =>
  nonImplemente('etatObjectif');

/** Tâches directes seulement (US-001 CA-3). */
export const compteurObjectif = (
  _vue: VueMetier,
  _id: IdObjectif,
): { readonly terminees: number; readonly nonAbandonnees: number } =>
  nonImplemente('compteurObjectif');
