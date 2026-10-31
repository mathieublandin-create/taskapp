import { nonImplemente } from '@non-implemente';
import type {
  InformationSignalee,
  ValeurEcarteeDetaillee,
  ValeurSignalee,
} from '../../domaine/detail-valeurs-ecartees';
import type { RefElementMetier } from '../../domaine/information';

// ECR-011, section « À lire » (guide §4.24, §6.6.2 `SYN-FEUILLE-A-LIRE`, §6.6.9 `ALR-008` à `ALR-011`, `ALR-014` ;
// guide §5.8 f) ; ST-US-017 v0.5 §4.6, §6.6 n° 13 ; H-2, H-6.

export type LigneModificationNonRetenue = {
  readonly id: string;
  readonly code: 'ALR-009' | 'ALR-010' | 'ALR-011';
  /** `ALR-010` seulement : `tache` (élément supprimé : une tâche), `rattachement` (OBJECTIFS), `placement` (PARENT). */
  readonly variante?: 'tache' | 'rattachement' | 'placement';
  /** Colonne « élément » du glossaire §8. */
  readonly element: string;
  readonly information: InformationSignalee;
  readonly valeurNonRetenue: ValeurSignalee;
  readonly valeurConservee: ValeurSignalee;
  /** Libellé du code (et de sa variante) : titre du `DiscardedItem`. */
  readonly titre: string;
  /** Élément ouvert par « Voir … » ; absent si l'élément n'existe plus. */
  readonly voir?: RefElementMetier;
};

export type LigneDonneeEffacee = {
  readonly id: string;
  readonly element: string;
  readonly information: InformationSignalee;
  readonly valeurNonRetenue: ValeurSignalee;
};

export type ModeleVueModificationsNonRetenues = {
  readonly code: 'SYN-FEUILLE-A-LIRE';
  /** Nombre de lignes `ALR-009` à `ALR-011` (= `aLire`, H-6). */
  readonly n: number;
  readonly libelle: string;
  /** Non lues, ordre `comparerLignesFeuille` (instant = `ValeurEcarteeDetaillee.instant`, intitulé = élément, id). */
  readonly lignes: ReadonlyArray<LigneModificationNonRetenue>;
  /** `ALR-014` non lues, groupées sous la carte `ALR-008`, même ordre ; un seul « Compris » pour toutes (`ids`). */
  readonly donneesEffacees?: {
    readonly code: 'ALR-008';
    readonly ids: ReadonlyArray<string>;
    readonly lignes: ReadonlyArray<LigneDonneeEffacee>;
  };
};

/** Section absente (undefined) s'il n'y a aucune entrée non lue. */
export const construireModificationsNonRetenues = (
  valeurs: ReadonlyArray<ValeurEcarteeDetaillee>,
): ModeleVueModificationsNonRetenues | undefined =>
  nonImplemente(`construireModificationsNonRetenues (${String(valeurs.length)})`);
