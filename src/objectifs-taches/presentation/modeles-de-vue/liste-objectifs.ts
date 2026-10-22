import { nonImplemente } from '@non-implemente';
import type { Horloge } from '../../../commun/application/ports/horloge';
import type { ResumeObjectif } from '../../application/requetes/resumes';
import type { LigneObjectif } from './ligne-objectif';

// ST-US-001 §4.5, §6.6 (guide v0.2.9 §5.8) ; ST-US-023 §6.6.
export type ModeleVueListeObjectifs = {
  /** Principaux NON atteints, chacun suivi de ses sous-objectifs (atteints compris). */
  readonly lignes: ReadonlyArray<LigneObjectif>;
  /** Absente si aucun objectif principal atteint. */
  readonly sectionAtteints?: {
    readonly code: 'SEC-OBJ-ATTEINTS';
    readonly n: number;
    readonly libelle: string;
    readonly replieeParDefaut: true;
    readonly lignes: ReadonlyArray<LigneObjectif>;
  };
  readonly mentionHeureParis?: { readonly code: 'MEN-HEURE-PARIS'; readonly libelle: string };
  readonly etatVide?: { readonly code: 'EVD-OBJECTIFS' };
};

export const construireListeObjectifs = (
  _donnees: { readonly objectifs: ReadonlyArray<ResumeObjectif> },
  _dependances: { readonly horloge: Horloge },
): ModeleVueListeObjectifs => nonImplemente('construireListeObjectifs');
