import type { RefElementMetier } from '../../domaine/information';

// Guide §6.6.4 : MEN-ATTENTE = indication « non synchronisé » (US-017, US-018, US-031).
export const mentionAttente = (
  element: RefElementMetier,
  elementsEnAttente: ReadonlySet<string>,
): { readonly code: 'MEN-ATTENTE' } | undefined =>
  elementsEnAttente.has(element.id) ? { code: 'MEN-ATTENTE' } : undefined;
