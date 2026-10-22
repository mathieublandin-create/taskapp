import { nonImplemente } from '@non-implemente';
import type { IdTache } from '../../../commun/domaine/identifiants';
import type { DetailTache } from '../../application/requetes/consulter-detail-tache';
import type { ModeleVueFormulaireTache } from './formulaire-tache';

// ST-US-024 §4.5 (ECR-007 I).
export type ModeleVueFormulaireSousTache = ModeleVueFormulaireTache & {
  readonly tacheParente: { readonly id: IdTache; readonly intitule: string };
  /** Première sous-tâche (ALR-012) ; durée = estimation en vigueur de la tâche. */
  readonly information?: {
    readonly code: 'ALR-012';
    readonly duree: { readonly minutes: number; readonly libelle: string };
    readonly libelle: string;
  };
};

export const construireFormulaireSousTache = (
  _donnees: DetailTache,
): ModeleVueFormulaireSousTache => nonImplemente('construireFormulaireSousTache');
