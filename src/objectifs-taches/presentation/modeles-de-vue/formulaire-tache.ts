import type { IdObjectif } from '../../../commun/domaine/identifiants';

// ST-US-002 §4.5 (CA-2, Q-ERG-03).
export type ModeleVueFormulaireTache = {
  /** Variante sous-tâche (`'SOUS_TACHE'`) ; absente de la saisie d'une tâche (DT-021 point 2). */
  readonly variante?: 'SOUS_TACHE';
  readonly delaiPreselectionne: undefined;
  readonly estimationPreselectionnee: undefined;
  readonly objectifsPreRemplis: ReadonlyArray<IdObjectif>; // objectif du détail d'où l'on vient, sinon vide
  readonly mentionsObligatoire: ReadonlyArray<{
    readonly champ: 'DELAI' | 'ESTIMATION';
    readonly code: 'MEN-OBLIGATOIRE';
  }>;
};

export const construireFormulaireTache = (donnees: {
  readonly objectifPreRempli?: IdObjectif;
}): ModeleVueFormulaireTache => ({
  delaiPreselectionne: undefined,
  estimationPreselectionnee: undefined,
  objectifsPreRemplis: donnees.objectifPreRempli === undefined ? [] : [donnees.objectifPreRempli],
  mentionsObligatoire: [
    { champ: 'DELAI', code: 'MEN-OBLIGATOIRE' },
    { champ: 'ESTIMATION', code: 'MEN-OBLIGATOIRE' },
  ],
});
