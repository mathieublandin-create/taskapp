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

const messageDeuxiemeNiveau = (
  refus: Extract<RefusMetier, { readonly type: 'DeuxiemeNiveau' }>,
): MessageRefus =>
  refus.variante === 'objectif-a-des-sous-objectifs'
    ? {
        code: 'ERR-030',
        variante: refus.variante,
        variables: { element: refus.objectif, n: refus.nombreSousObjectifs },
      }
    : { code: 'ERR-030', variante: refus.variante, variables: { element: refus.cible } };

export const messagesDeRefus = (refus: RefusMetier): ReadonlyArray<MessageRefus> => {
  switch (refus.type) {
    case 'SaisieInvalide':
      return refus.defauts.map((defaut) => ({ code: CODES_DEFAUTS[defaut], variables: {} }));
    case 'ElementIntrouvable':
    case 'ActionNonDisponible':
      return [];
    case 'PlacementSousLuiMeme':
      return [{ code: 'ERR-031', variables: {} }];
    case 'DeuxiemeNiveau':
      return [messageDeuxiemeNiveau(refus)];
    case 'EstimationCalculee':
      return [{ code: 'ERR-033', variables: {} }];
    case 'ObjectifsHerites':
      return [{ code: 'ERR-034', variables: {} }];
    case 'AjoutSousTacheATacheAbandonnee':
      return [{ code: 'ERR-032', variables: {} }];
    case 'SousTachesRestantes':
      return [{ code: 'ERR-035', variables: { n: refus.nombre } }];
  }
};
