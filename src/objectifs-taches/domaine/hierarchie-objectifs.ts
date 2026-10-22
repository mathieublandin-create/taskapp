import { nonImplemente } from '@non-implemente';
import type { IdObjectif } from '../../commun/domaine/identifiants';
import type { Resultat } from '../../commun/domaine/resultat';
import type { RefusMetier } from './refus';
import type { Objectif, VueMetier } from './vue-metier';

// RG-022, Q-US-023-1 (ST-US-023 §6.1).
export const estObjectifPrincipal = (_o: Objectif): boolean =>
  nonImplemente('estObjectifPrincipal');

export type IssuePlacement = 'SANS_EFFET' | 'A_ECRIRE';

export const verifierPlacement = (
  _vue: VueMetier,
  _objectifId: IdObjectif,
  _cibleId: IdObjectif | undefined,
): Resultat<IssuePlacement, RefusMetier> => nonImplemente('verifierPlacement');
