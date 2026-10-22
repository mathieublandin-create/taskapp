import { nonImplemente } from '@non-implemente';
import type { CodeCatalogue } from '../../../commun/presentation/messages/codes';
import type { VariablesLibelle } from '../../../commun/presentation/messages/libelle';
import type { RefusMetier } from '../../domaine/refus';

// conventions.md §8.5 ; ST-US-001 §6.5 et rangs suivants. Refus sans code → liste vide.
export type MessageRefus = {
  readonly code: CodeCatalogue;
  readonly variante?: string;
  readonly variables: VariablesLibelle;
};

export const messagesDeRefus = (_refus: RefusMetier): ReadonlyArray<MessageRefus> =>
  nonImplemente('messagesDeRefus');
