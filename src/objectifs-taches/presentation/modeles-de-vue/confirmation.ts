import { nonImplemente } from '@non-implemente';
import type { CodeCatalogue } from '../../../commun/presentation/messages/codes';
import type { VariablesLibelle } from '../../../commun/presentation/messages/libelle';
import type { ConfirmationRequise } from '../../domaine/confirmation';

// ST-US-001 §6.5 ; ST-US-002, 024, 003, 025 : codes CNF-….
export type ModeleVueConfirmation = {
  readonly code: CodeCatalogue;
  readonly variables: VariablesLibelle;
  readonly titre: string;
  readonly texte: string;
  readonly actionLibelle: string;
};

export const construireConfirmation = (_c: ConfirmationRequise): ModeleVueConfirmation =>
  nonImplemente('construireConfirmation');
