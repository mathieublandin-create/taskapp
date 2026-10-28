import { nonImplemente } from '@non-implemente';
import type { CodeCatalogue } from '../../../commun/presentation/messages/codes';
import type { VariablesLibelle } from '../../../commun/presentation/messages/libelle';
import type { DefautSaisie, RefusMetier } from '../../domaine/refus';

// conventions.md §8.5 ; ST-US-001 §6.5 et rangs suivants. Refus sans code → liste vide.
export type MessageRefus = {
  readonly code: CodeCatalogue;
  readonly variante?: string;
  readonly variables: VariablesLibelle;
};

const CODES_DEFAUTS: Readonly<Record<DefautSaisie, CodeCatalogue>> = {
  INTITULE_VIDE: 'ERR-020',
  DELAI_ABSENT: 'ERR-021',
  ESTIMATION_ABSENTE: 'ERR-022',
  ESTIMATION_INVALIDE: 'ERR-023',
};

export const messagesDeRefus = (refus: RefusMetier): ReadonlyArray<MessageRefus> => {
  switch (refus.type) {
    case 'SaisieInvalide':
      return refus.defauts.map((defaut) => ({ code: CODES_DEFAUTS[defaut], variables: {} }));
    case 'ElementIntrouvable':
    case 'ActionNonDisponible':
      return [];
    case 'PlacementSousLuiMeme':
    case 'DeuxiemeNiveau':
    case 'EstimationCalculee':
    case 'ObjectifsHerites':
    case 'AjoutSousTacheATacheAbandonnee':
    case 'SousTachesRestantes':
      return nonImplemente('messagesDeRefus (refus de ST-US-023, 002, 024 et 003)');
  }
};
