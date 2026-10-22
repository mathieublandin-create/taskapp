import type { RefElementMetier } from '../../synchronisation';
import type { ActionObjectif, ActionTache } from './actions';

// ST-US-001 §4.1, complété par ST-US-023, 002, 024, 003. Le code ERR-… est attribué par messagesDeRefus.
export type DefautSaisie =
  'INTITULE_VIDE' | 'DELAI_ABSENT' | 'ESTIMATION_ABSENTE' | 'ESTIMATION_INVALIDE';

export type SaisieInvalide = {
  readonly type: 'SaisieInvalide';
  readonly defauts: ReadonlyArray<DefautSaisie>; // ordre : intitulé, délai, estimation
};

export type RefusMetier =
  | SaisieInvalide
  | { readonly type: 'ElementIntrouvable'; readonly element: RefElementMetier }
  | { readonly type: 'ActionNonDisponible'; readonly action: ActionObjectif | ActionTache }
  | { readonly type: 'PlacementSousLuiMeme' } // ERR-031
  | {
      readonly type: 'DeuxiemeNiveau';
      readonly variante: 'objectif-a-des-sous-objectifs';
      readonly objectif: string;
      readonly nombreSousObjectifs: number;
    } // ERR-030
  | {
      readonly type: 'DeuxiemeNiveau';
      readonly variante: 'cible-est-sous-objectif';
      readonly cible: string;
    } // ERR-030
  | { readonly type: 'EstimationCalculee' } // ERR-033
  | { readonly type: 'ObjectifsHerites' } // ERR-034
  | { readonly type: 'AjoutSousTacheATacheAbandonnee' } // ERR-032
  | { readonly type: 'SousTachesRestantes'; readonly nombre: number }; // ERR-035
