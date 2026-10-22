import type { Duree } from '../../commun/domaine/duree';
import type { IdObjectif, IdTache } from '../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../commun/domaine/temps/date-calendaire';
import type { Instant } from '../../commun/domaine/temps/instant';
import type { Hlc } from './hlc';
import type { IdEvenement } from './identifiant-evenement';
import type { OrigineParent, RefElementMetier } from './information';

// RG-050, DAT §6.1 (ST-socle-ecriture.md §4.1.4).
export type TypeEvenementJournal =
  | 'CREATION'
  | 'MODIFICATION_DELAI'
  | 'MODIFICATION_ESTIMATION'
  | 'RATTACHEMENT'
  | 'DETACHEMENT'
  | 'CHANGEMENT_PARENT'
  | 'FIN'
  | 'REOUVERTURE'
  | 'ABANDON'
  | 'REPRISE'
  | 'SUPPRESSION';

/** Valeur « état » d'une tâche, telle que l'utilisateur la voyait. */
export type EtatJournal = {
  readonly etat: 'A_FAIRE' | 'TERMINEE' | 'ABANDONNEE';
  readonly dateFin?: DateCalendaire;
  readonly dateAbandon?: DateCalendaire;
};

export type PlacementJournal = {
  readonly parentId?: IdObjectif;
  readonly origine: OrigineParent;
  readonly hlcOrigine: Hlc;
};

type Vide = Record<string, never>;
type RefObjectif = { readonly type: 'OBJECTIF'; readonly id: IdObjectif };
type RefTache = { readonly type: 'TACHE'; readonly id: IdTache };

export type ContenuEvenement =
  | {
      readonly type: 'CREATION';
      readonly element: RefObjectif;
      readonly avant: Vide;
      readonly apres: { readonly parentId?: IdObjectif; readonly delai?: DateCalendaire };
    }
  | {
      readonly type: 'CREATION';
      readonly element: RefTache;
      readonly avant: Vide;
      readonly apres: {
        readonly tacheParenteId?: IdTache;
        readonly delai: DateCalendaire;
        readonly estimation: Duree;
        readonly objectifIds: ReadonlyArray<IdObjectif>; // ordre de saisie ; vide pour une sous-tâche
      };
    }
  | {
      readonly type: 'MODIFICATION_DELAI';
      readonly element: RefElementMetier;
      readonly avant: { readonly delai?: DateCalendaire };
      readonly apres: { readonly delai?: DateCalendaire };
    }
  | {
      readonly type: 'MODIFICATION_ESTIMATION';
      readonly element: RefTache;
      readonly avant: { readonly estimation: Duree };
      readonly apres: { readonly estimation: Duree };
    }
  | {
      readonly type: 'RATTACHEMENT';
      readonly element: RefTache;
      readonly avant: Vide;
      readonly apres: { readonly objectifId: IdObjectif };
    }
  | {
      readonly type: 'DETACHEMENT';
      readonly element: RefTache;
      readonly avant: { readonly objectifId: IdObjectif };
      readonly apres: Vide;
    }
  | {
      readonly type: 'CHANGEMENT_PARENT';
      readonly element: RefObjectif;
      readonly avant: PlacementJournal;
      readonly apres: PlacementJournal;
    }
  | {
      readonly type: 'FIN' | 'REOUVERTURE' | 'ABANDON' | 'REPRISE';
      readonly element: RefTache;
      readonly avant: EtatJournal;
      readonly apres: EtatJournal;
    }
  | {
      readonly type: 'SUPPRESSION';
      readonly element: RefElementMetier;
      readonly avant: Vide;
      readonly apres: Vide;
    };

export type EvenementJournal = ContenuEvenement & {
  readonly id: IdEvenement;
  readonly hlc: Hlc; // HLC de la modification qui porte l'événement
  readonly instant: Instant; // Horloge.maintenant(), non corrigé
  readonly jour: DateCalendaire; // jourDeReference(instant)
  readonly cause?: IdEvenement; // conséquence enregistrée (DAT §6.1 c)
};

/** Ce que fournit un contexte métier : ni HLC, ni avant/après d'un changement de parent. */
export type EvenementACreer =
  | (Exclude<ContenuEvenement, { readonly type: 'CHANGEMENT_PARENT' }> & {
      readonly rang: number;
      readonly cause?: number;
    })
  | {
      readonly type: 'CHANGEMENT_PARENT';
      readonly element: RefObjectif;
      readonly rang: number;
      readonly cause?: number;
    };
