import type { RefElementMetier } from '../../domaine/information';

// Guide §6.6.4 : MEN-ATTENTE = indication « non synchronisé » (US-017, US-018, US-031).
export type MentionAttente = { readonly code: 'MEN-ATTENTE' };

/** Pour les requêtes qui savent déjà si l'élément est en attente (RC-R3-4). */
export const mentionAttenteSi = (enAttente: boolean): MentionAttente | undefined =>
  enAttente ? { code: 'MEN-ATTENTE' } : undefined;

export const mentionAttente = (
  element: RefElementMetier,
  elementsEnAttente: ReadonlySet<string>,
): MentionAttente | undefined => mentionAttenteSi(elementsEnAttente.has(element.id));
