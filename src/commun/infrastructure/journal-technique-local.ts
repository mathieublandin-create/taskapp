import { nonImplemente } from '@non-implemente';

// conventions.md §9.4 : masquage défensif (jetons `ya29.`, `Bearer`, `access_token=`, adresses e-mail).
// Le texte masqué est remplacé par « [masqué] ». L'adaptateur JournalTechniqueLocal l'applique à chaque champ texte.
export const MASQUE = '[masqué]';

export const masquerDonneesSensibles = (_texte: string): string =>
  nonImplemente('masquerDonneesSensibles');
