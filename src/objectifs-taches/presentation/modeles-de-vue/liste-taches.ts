import { nonImplemente } from '@non-implemente';
import type { Horloge } from '../../../commun/application/ports/horloge';
import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { ResumeTache } from '../../application/requetes/resumes';
import type { LigneTache } from './ligne-tache';

// ST-US-002 §4.5, §6.4 (guide §5.7).
export type FiltreEtat = 'A_FAIRE' | 'TERMINEE' | 'ABANDONNEE';
export type FiltreObjectif =
  | { readonly type: 'TOUS' }
  | { readonly type: 'OBJECTIF'; readonly id: IdObjectif }
  | { readonly type: 'SANS_OBJECTIF' };

/** À chaque ouverture, non mémorisé (guide §5.7). */
export const FILTRE_ETAT_PAR_DEFAUT: FiltreEtat = 'A_FAIRE';

export type ModeleVueListeTaches = {
  readonly filtreEtat: FiltreEtat;
  readonly filtreObjectif: FiltreObjectif;
  readonly sousTitre: { readonly code: 'MEN-TRI-DELAI'; readonly libelle: string };
  readonly lignes: ReadonlyArray<LigneTache>;
  readonly etatVide?: {
    readonly code:
      | 'EVD-BIENVENUE'
      | 'EVD-TACHES'
      | 'EVD-FILTRE-SANS-OBJECTIF'
      | 'EVD-FILTRE-A-FAIRE'
      | 'EVD-FILTRE-TERMINEES'
      | 'EVD-FILTRE-ABANDONNEES';
  };
  readonly mentionHeureParis?: { readonly code: 'MEN-HEURE-PARIS'; readonly libelle: string };
};

export const construireListeTaches = (
  _donnees: {
    readonly taches: ReadonlyArray<ResumeTache>;
    readonly existeAuMoinsUnObjectif: boolean;
  },
  _filtres: { readonly etat: FiltreEtat; readonly objectif: FiltreObjectif },
  _dependances: { readonly horloge: Horloge },
): ModeleVueListeTaches => nonImplemente('construireListeTaches');
