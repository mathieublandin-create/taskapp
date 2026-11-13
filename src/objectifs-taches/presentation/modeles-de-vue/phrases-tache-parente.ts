// Phrases qui nomment la tâche parente d'une sous-tâche (ECR-007 A, I). Elles n'ont pas de code au catalogue ; le
// modèle de vue les compose pour qu'aucun composant n'assemble de texte (DT-021 point 2, CR-16, CR-23).
const SOUS_TACHE_DE = 'Sous-tâche de « {parent} »';
const DE_TACHE_PARENTE = 'de « {parent} »';

/** Une valeur de remplacement est littérale : un intitulé contenant « $& » n'est jamais interprété. */
const nommer = (gabarit: string, intituleParent: string): string =>
  gabarit.replace('{parent}', () => intituleParent);

/** « Sous-tâche de « Chapitre 1 » » : sous le titre du détail d'une sous-tâche. */
export const phraseSousTacheDe = (intituleParent: string): string =>
  nommer(SOUS_TACHE_DE, intituleParent);

/** « de « Chapitre 1 » » : sous le titre de la saisie d'une sous-tâche. */
export const phraseDeTacheParente = (intituleParent: string): string =>
  nommer(DE_TACHE_PARENTE, intituleParent);
