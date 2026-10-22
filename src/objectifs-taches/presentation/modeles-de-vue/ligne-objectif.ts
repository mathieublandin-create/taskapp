import { nonImplemente } from '@non-implemente';
import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { ResumeObjectif } from '../../application/requetes/resumes';

// ST-US-001 §4.5, §6.5 ; ALR-007 : ST-US-023 §4.5.
export type ModeleVueDelai =
  | { readonly type: 'DATE'; readonly date: DateCalendaire; readonly libelle: string }
  | { readonly type: 'SANS_DELAI'; readonly code: 'MEN-SANS-DELAI'; readonly libelle: string };

export type LigneObjectif = {
  readonly id: IdObjectif;
  readonly intitule: string;
  readonly niveau: 'PRINCIPAL' | 'SOUS_OBJECTIF';
  readonly parentId?: IdObjectif;
  readonly etat: {
    readonly code: 'ETA-OBJ-EN-COURS' | 'ETA-OBJ-ATTEINT' | 'ETA-OBJ-A-DECLINER';
    readonly libelle: string;
  };
  readonly compteur: {
    readonly code: 'ETA-OBJ-COMPTEUR';
    readonly terminees: number;
    readonly nonAbandonnees: number;
    readonly libelle: string;
  };
  readonly delai: ModeleVueDelai;
  readonly enRetard?: { readonly code: 'MEN-EN-RETARD'; readonly libelle: string };
  readonly alerteDelai?: {
    readonly code: 'ALR-007';
    readonly parent: string;
    readonly libelle: string;
  };
  readonly nomAccessible: string;
};

/** `aujourdhui` : jour de Paris, pour le format des dates (guide §6.6.1). */
export const construireLigneObjectif = (
  _resume: ResumeObjectif,
  _aujourdhui: DateCalendaire,
): LigneObjectif => nonImplemente('construireLigneObjectif');
