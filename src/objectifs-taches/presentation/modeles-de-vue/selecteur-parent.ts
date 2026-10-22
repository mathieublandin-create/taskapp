import { nonImplemente } from '@non-implemente';
import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { SelecteurParent } from '../../application/requetes/consulter-selecteur-parent';
import type { MessageRefus } from './messages-de-refus';

// ST-US-023 §4.5, §6.5 (ECR-008 C, D ; guide §4.28).
export type OptionParent = {
  readonly cible:
    { readonly type: 'AUCUN' } | { readonly type: 'OBJECTIF'; readonly id: IdObjectif };
  readonly intitule: string;
  readonly disponible: boolean;
  readonly raison?: MessageRefus;
};

export type ModeleVueSelecteurParent = {
  readonly titre: string;
  readonly messageBloquant?: MessageRefus; // ERR-030 variante objectif-a-des-sous-objectifs
  readonly options: ReadonlyArray<OptionParent>; // AUCUN, puis les objectifs principaux
};

export const construireSelecteurParent = (_donnees: SelecteurParent): ModeleVueSelecteurParent =>
  nonImplemente('construireSelecteurParent');
