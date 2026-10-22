import { nonImplemente } from '@non-implemente';
import type { Horloge } from '../../../commun/application/ports/horloge';
import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { DetailObjectif } from '../../application/requetes/consulter-detail-objectif';
import type { ActionObjectif } from '../../domaine/actions';
import type { LigneObjectif, ModeleVueDelai } from './ligne-objectif';
import type { LigneTache } from './ligne-tache';

// ST-US-001 §4.5 ; ST-US-023 §4.5 ; ST-US-002 §4.5, §6.6 (guide v0.2.10 §5.8 d).
export type LigneDetailObjectif = LigneTache & { readonly niveau: 'TACHE' | 'SOUS_TACHE' };

export type CodeSectionTaches =
  'SEC-TACHES-A-FAIRE' | 'SEC-TACHES-TERMINEES' | 'SEC-TACHES-ABANDONNEES';

export type SectionTaches<C extends CodeSectionTaches> = {
  readonly code: C;
  readonly n: number; // tâches directes de la section (sous-tâches non comptées)
  readonly libelle: string;
  readonly replieeParDefaut: boolean; // faux pour « à faire », vrai pour les deux autres
  readonly lignes: ReadonlyArray<LigneDetailObjectif>;
};

export type ModeleVueDetailObjectif = {
  readonly id: IdObjectif;
  readonly intitule: string;
  readonly description?: string;
  readonly delai: ModeleVueDelai;
  readonly niveau:
    | { readonly type: 'PRINCIPAL' }
    | {
        readonly type: 'SOUS_OBJECTIF';
        readonly parent: { readonly id: IdObjectif; readonly intitule: string };
      };
  readonly etat: LigneObjectif['etat'];
  readonly compteur: LigneObjectif['compteur'];
  readonly enRetard?: LigneObjectif['enRetard'];
  readonly alerteDelai?: LigneObjectif['alerteDelai'];
  readonly sousObjectifs: {
    readonly code: 'SEC-SOUS-OBJECTIFS';
    readonly libelle: string;
    readonly lignes: ReadonlyArray<LigneObjectif>;
  };
  readonly taches: {
    readonly aFaire: SectionTaches<'SEC-TACHES-A-FAIRE'>;
    readonly terminees: SectionTaches<'SEC-TACHES-TERMINEES'>;
    readonly abandonnees: SectionTaches<'SEC-TACHES-ABANDONNEES'>;
  };
  readonly etatVide?: { readonly code: 'EVD-OBJECTIF-SANS-TACHE' }; // aucune tâche directe
  readonly actions: ReadonlyArray<ActionObjectif>;
  readonly mentionHeureParis?: { readonly code: 'MEN-HEURE-PARIS'; readonly libelle: string };
};

export const construireDetailObjectif = (
  _donnees: DetailObjectif,
  _dependances: { readonly horloge: Horloge },
): ModeleVueDetailObjectif => nonImplemente('construireDetailObjectif');
