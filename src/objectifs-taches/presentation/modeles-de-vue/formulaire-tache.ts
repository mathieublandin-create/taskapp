import { nonImplemente } from '@non-implemente';
import type { IdObjectif } from '../../../commun/domaine/identifiants';

// ST-US-002 §4.5 (CA-2, Q-ERG-03).
export type ModeleVueFormulaireTache = {
  readonly delaiPreselectionne: undefined;
  readonly estimationPreselectionnee: undefined;
  readonly objectifsPreRemplis: ReadonlyArray<IdObjectif>; // objectif du détail d'où l'on vient, sinon vide
  readonly mentionsObligatoire: ReadonlyArray<{
    readonly champ: 'DELAI' | 'ESTIMATION';
    readonly code: 'MEN-OBLIGATOIRE';
  }>;
};

export const construireFormulaireTache = (_donnees: {
  readonly objectifPreRempli?: IdObjectif;
}): ModeleVueFormulaireTache => nonImplemente('construireFormulaireTache');
