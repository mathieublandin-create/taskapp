import { nonImplemente } from '@non-implemente';
import type { Horloge } from '../../../commun/application/ports/horloge';
import type { IdTache } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { DetailTache } from '../../application/requetes/consulter-detail-tache';
import type { ActionTache } from '../../domaine/actions';
import type { LigneTache } from './ligne-tache';

// ST-US-002 §4.5 ; ST-US-024 §4.5 ; ST-US-003 §4.5 ; ST-US-025 §4.5.
type MentionHeureParis = { readonly code: 'MEN-HEURE-PARIS'; readonly libelle: string };

export type LigneSousTache = {
  readonly id: IdTache;
  readonly intitule: string;
  readonly delai: DateCalendaire;
  readonly estimation: { readonly minutes: number; readonly libelle: string };
  readonly etat: LigneTache['etat'];
  readonly enRetard?: LigneTache['enRetard'];
  readonly alertes: LigneTache['alertes'];
  /**
   * WCAG 4.1.2 (RL-LOT-001-S4, ST-US-024 §4.5) : « {intitulé}, {état en toutes lettres}, délai {date} »,
   * suivi de « , en retard » si `enRetard` ; même forme que `LigneTache.nomAccessible`.
   */
  readonly nomAccessible: string;
  /** Case « Terminer » de la ligne : nom accessible « Terminer « {intitulé} » ». */
  readonly caseTerminer: { readonly nomAccessible: string };
  /** Sous-tâches d'une tâche parente abandonnée (ST-US-025 §6.4). */
  readonly etiquette?: {
    readonly code:
      | 'ETA-SOUS-TACHE-ABANDONNEE-AVEC'
      | 'ETA-SOUS-TACHE-ABANDONNEE-AVANT'
      | 'ETA-SOUS-TACHE-TERMINEE-AVANT';
    readonly libelle: string;
  };
};

export type ModeleVueDetailTache = {
  readonly id: IdTache;
  readonly intitule: string;
  readonly etat: LigneTache['etat'];
  /** Jamais de MEN-HEURE-PARIS sur un délai. */
  readonly delai: {
    readonly date: DateCalendaire;
    readonly libelle: string;
    readonly alertes: LigneTache['alertes'];
  };
  readonly estimation: {
    readonly minutes: number;
    readonly libelle: string;
    readonly verrou?: { readonly code: 'MEN-ESTIMATION-CALCULEE'; readonly libelle: string };
  };
  readonly estimationInitiale: { readonly minutes: number };
  readonly objectifs: {
    readonly intitules: ReadonlyArray<string>;
    readonly verrou?: { readonly code: 'MEN-OBJECTIFS-HERITES'; readonly libelle: string };
  };
  readonly tacheParente?: { readonly id: IdTache; readonly intitule: string };
  readonly enRetard?: LigneTache['enRetard'];
  readonly actions: ReadonlyArray<ActionTache>;
  /** Section SEC-SOUS-TACHES : une seule liste, tous états, ordre de référence (guide §5.8 e). */
  readonly sousTaches?: {
    readonly code: 'SEC-SOUS-TACHES';
    readonly libelle: string;
    readonly lignes: ReadonlyArray<LigneSousTache>;
    readonly compteur: {
      readonly terminees: number;
      readonly nonAbandonnees: number;
      readonly libelle: string;
    };
  };
  /** n = sous-tâches à faire ; absent si n = 0. */
  readonly infoFinImpossible?: {
    readonly code: 'ALR-013';
    readonly n: number;
    readonly libelle: string;
  };
  readonly incoherence?: {
    readonly code: 'ALR-003' | 'ALR-004';
    readonly n: number;
    readonly libelle: string;
  }; // rang 9
  readonly dateFin?: {
    readonly date: DateCalendaire;
    readonly libelle: string;
    readonly mentionHeureParis?: MentionHeureParis;
  };
  readonly dateAbandon?: {
    readonly date: DateCalendaire;
    readonly libelle: string;
    readonly mentionHeureParis?: MentionHeureParis;
  };
};

export const construireDetailTache = (
  _donnees: DetailTache,
  _dependances: { readonly horloge: Horloge },
): ModeleVueDetailTache => nonImplemente('construireDetailTache');
