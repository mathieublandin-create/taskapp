import { nonImplemente } from '@non-implemente';
import type { IdTache } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { ResumeTache } from '../../application/requetes/resumes';

// ST-US-002 §4.5 ; ALR-006 : ST-US-024 ; MEN-INCOHERENCE : ST-US-024 (rang 9).
export type AlerteLigneTache =
  | {
      readonly code: 'ALR-005';
      readonly objectifs: ReadonlyArray<string>;
      readonly libelle: string;
    }
  | { readonly code: 'ALR-006'; readonly tache: string; readonly libelle: string };

export type LigneTache = {
  readonly id: IdTache;
  readonly intitule: string;
  readonly etat: {
    readonly code: 'ETA-TACHE-A-FAIRE' | 'ETA-TACHE-TERMINEE' | 'ETA-TACHE-ABANDONNEE';
  };
  readonly delai: { readonly date: DateCalendaire; readonly libelle: string };
  readonly estimation: {
    readonly minutes: number;
    readonly libelle: string;
    readonly calculee: boolean;
  };
  readonly objectifs: ReadonlyArray<string>;
  readonly enRetard?: { readonly code: 'MEN-EN-RETARD'; readonly libelle: string };
  readonly alertes: ReadonlyArray<AlerteLigneTache>;
  /** « 1/3 » : présent si la tâche a des sous-tâches. */
  readonly compteurSousTaches?: {
    readonly terminees: number;
    readonly nonAbandonnees: number;
    readonly libelle: string;
  };
  readonly incoherence?: { readonly code: 'MEN-INCOHERENCE' };
  readonly nomAccessible: string;
};

export const construireLigneTache = (
  _resume: ResumeTache,
  _aujourdhui: DateCalendaire,
): LigneTache => nonImplemente('construireLigneTache');
