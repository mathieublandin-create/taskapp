import type { IdObjectif, IdTache } from '../../commun/domaine/identifiants';

// conventions.md §8.6 ; ST-US-001, 002, 024, 003, 025.
export type ConfirmationRequise =
  | {
      readonly type: 'SUPPRESSION_OBJECTIF';
      readonly objectifId: IdObjectif;
      readonly intitule: string;
      readonly tachesDetachees: number;
      readonly sousObjectifsPromus: number;
    }
  | {
      readonly type: 'SUPPRESSION_TACHE';
      readonly tacheId: IdTache;
      readonly intitule: string;
      readonly sousTaches: number;
    }
  | {
      readonly type: 'AJOUT_SOUS_TACHE_TERMINEE';
      readonly tacheParenteId: IdTache;
      readonly intitule: string;
    }
  | {
      readonly type: 'REOUVERTURE_SOUS_TACHE';
      readonly tacheParenteId: IdTache;
      readonly intitule: string;
    }
  | {
      readonly type: 'ABANDON_TACHE';
      readonly tacheId: IdTache;
      readonly intitule: string;
      readonly sousTachesAbandonnees: number;
      /** Sous-tâches déjà terminées : elles restent terminées (CNF-ABANDON-TACHE-CASCADE). */
      readonly sousTachesTerminees: number;
    }
  | {
      // CNF-REPRENDRE-SOUS-TACHE (DEC-032, US-025 CA-13) : la sous-tâche reprise et sa tâche parente terminée
      readonly type: 'REPRISE_SOUS_TACHE';
      readonly tacheId: IdTache;
      readonly intitule: string;
      readonly tacheParenteId: IdTache;
      readonly intituleTacheParente: string;
    };

export type Evaluation =
  | { readonly type: 'SANS_CONFIRMATION' }
  | { readonly type: 'CONFIRMATION_REQUISE'; readonly confirmation: ConfirmationRequise };
