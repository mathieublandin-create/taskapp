import type { Duree } from '../../commun/domaine/duree';
import type { IdObjectif, IdTache } from '../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../commun/domaine/temps/date-calendaire';
import type { Instant } from '../../commun/domaine/temps/instant';
import type { EvenementACreer } from './evenement-journal';
import type { CycleDeVie, RefElementMetier } from './information';

// Langage d'écriture des contextes métier (ST-socle-ecriture.md §4.1.5).
export type EcritureChampObjectif =
  | { readonly champ: 'intitule'; readonly valeur: string }
  | { readonly champ: 'description'; readonly valeur: string | undefined }
  | { readonly champ: 'delai'; readonly valeur: DateCalendaire | undefined }
  | { readonly champ: 'parent'; readonly parentId: IdObjectif | undefined }; // déplacement (origine DEPLACEMENT)

export type EcritureChampTache =
  | { readonly champ: 'intitule'; readonly valeur: string }
  | { readonly champ: 'delai'; readonly valeur: DateCalendaire }
  | { readonly champ: 'estimationInitiale'; readonly valeur: Duree }
  | { readonly champ: 'cycleDeVie'; readonly valeur: CycleDeVie };

export type Modification =
  | {
      readonly type: 'CREER_OBJECTIF';
      readonly id: IdObjectif;
      readonly creeLe: Instant;
      readonly valeurs: {
        readonly intitule: string;
        readonly description?: string;
        readonly delai?: DateCalendaire;
        readonly parentId?: IdObjectif;
      };
      readonly evenement: EvenementACreer;
    }
  | {
      readonly type: 'CREER_TACHE';
      readonly id: IdTache;
      readonly creeLe: Instant;
      readonly valeurs: {
        readonly intitule: string;
        readonly delai: DateCalendaire;
        readonly estimationInitiale: Duree;
        readonly tacheParenteId?: IdTache;
        readonly objectifIds: ReadonlyArray<IdObjectif>;
      };
      readonly evenement: EvenementACreer;
    }
  | {
      readonly type: 'ECRIRE_OBJECTIF';
      readonly id: IdObjectif;
      readonly ecriture: EcritureChampObjectif;
      readonly evenement?: EvenementACreer;
    }
  | {
      readonly type: 'ECRIRE_TACHE';
      readonly id: IdTache;
      readonly ecriture: EcritureChampTache;
      readonly evenement?: EvenementACreer;
    }
  | {
      readonly type: 'ECRIRE_LIEN';
      readonly tacheId: IdTache;
      readonly objectifId: IdObjectif;
      readonly actif: boolean;
      readonly evenement?: EvenementACreer;
    }
  | {
      readonly type: 'SUPPRIMER';
      readonly element: RefElementMetier;
      readonly evenement: EvenementACreer;
    };
