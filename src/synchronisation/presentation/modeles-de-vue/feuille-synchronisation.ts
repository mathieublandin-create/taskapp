import { nonImplemente } from '@non-implemente';
import type { Instant } from '../../../commun/domaine/temps/instant';
import type { EtatSynchronisationAffichable } from './etat-synchronisation-affichable';
import type { LigneFeuilleOrdonnable } from './ordre-feuille';

// ECR-011, section « Synchronisation » de l'incrément 1 (ST-US-017 v0.4 §4.5, guide §4.26, §6.6.2 ; DT-011).
// Le dossier du Drive (`SYN-FEUILLE-DOSSIER`) reste dans la section « Compte » (`section-compte.ts`).

export type EntreeFeuilleSynchronisation = {
  readonly etat: EtatSynchronisationAffichable;
  readonly maintenant: Instant;
  /** `MetaSynchronisation.dernierContactDrive` ; absent tant qu'aucun échange n'a abouti. */
  readonly dernierEchange?: Instant;
  /** Une entrée par élément qui porte `MEN-ATTENTE` (DAT §4.1.5 bis), dans un ordre quelconque. */
  readonly elementsEnAttente: ReadonlyArray<LigneFeuilleOrdonnable>;
};

export type LigneAttenteFeuille = { readonly id: string; readonly intitule: string };

export type ActionCarteFeuille = 'OUVRIR_GOOGLE_DRIVE' | 'REESSAYER_MAINTENANT';

export type CarteErreurFeuille = {
  readonly message: 'ERR-011' | 'ERR-016';
  readonly titre: string;
  readonly texte: string;
  readonly action: { readonly type: ActionCarteFeuille; readonly libelle: string };
};

export type ModeleVueFeuilleSynchronisation = {
  readonly dernierEchange?: {
    readonly code: 'SYN-FEUILLE-DERNIER-ECHANGE';
    readonly libelle: string;
  };
  readonly attente:
    | { readonly code: 'SYN-FEUILLE-RIEN-EN-ATTENTE'; readonly libelle: string }
    | {
        readonly code: 'SYN-FEUILLE-EN-ATTENTE';
        /** Nombre de lignes (guide §6.6.1, « Décompte »). */
        readonly n: number;
        readonly libelle: string;
        /** Ordre `comparerLignesFeuille`. */
        readonly lignes: ReadonlyArray<LigneAttenteFeuille>;
      };
  readonly horsLigne?: { readonly code: 'SYN-FEUILLE-HORS-LIGNE'; readonly libelle: string };
  readonly bouton: {
    readonly code: 'SYN-FEUILLE-BOUTON';
    readonly libelle: string;
    /** Faux hors ligne : `aria-disabled="true"`, bouton toujours focalisable. */
    readonly disponible: boolean;
    /** Présente seulement si le bouton est indisponible. */
    readonly explication?: string;
  };
  /** ERR-011 (Drive plein) ou ERR-016 (échec persistant) ; vide sinon. */
  readonly cartes: ReadonlyArray<CarteErreurFeuille>;
};

export const construireFeuilleSynchronisation = (
  _e: EntreeFeuilleSynchronisation,
): ModeleVueFeuilleSynchronisation => nonImplemente('construireFeuilleSynchronisation');
