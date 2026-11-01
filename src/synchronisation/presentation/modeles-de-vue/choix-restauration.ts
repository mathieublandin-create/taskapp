import { nonImplemente } from '@non-implemente';
import type { Instant } from '../../../commun/domaine/temps/instant';
import type { CopieLocale } from '../../domaine/copie-locale';
import type { EtatSynchronisationAffichable } from './etat-synchronisation-affichable';

// ST-US-017 v0.10 §4.7, §6.7 n° 16 ; ECR-011 E (maquette), guide §4.25 (OptionCard), §6.6.8 (ERR-012, Q-US-017-11).
// Textes hors catalogue (cartes d'option, « Décider plus tard », mention et lien de la demande hors ligne) :
// Q-ST017-STE-4 ; seuls les éléments testés ici sont figés.

export type EntreeChoixRestauration = {
  readonly etat: Pick<EtatSynchronisationAffichable, 'actionRequise' | 'reseau'>;
  /** `MetaSynchronisation.restaurationDemandee`. */
  readonly restaurationDemandee: boolean;
  /** « Décider plus tard » choisi pendant cette ouverture, tant que `ERR-012` reste affiché (état du contrôleur). */
  readonly decisionReportee: boolean;
  readonly copie: CopieLocale;
  readonly maintenant: Instant;
};

export type ModeleVueChoixRestauration = {
  readonly code: 'ERR-012';
  /** `libelle('ERR-012')`. */
  readonly titre: string;
  /**
   * `libelle('ERR-012', { objectifs, taches, anciennete }, 'texte')` ; `anciennete` =
   * `formaterAnciennete(copie.derniereMiseAJour ?? maintenant, maintenant)`.
   */
  readonly texte: string;
  /** Feuille de choix proposée (« l'utilisateur se voit proposer ») : faux après « Décider plus tard ». */
  readonly propose: boolean;
  /** Action principale ; libellé = `libelle('ERR-012', {}, 'action')` ; toujours disponible (hors ligne : mémorisée). */
  readonly restaurer: { readonly libelle: string; readonly disponible: true };
  /** Disponible si et seulement si le réseau est connecté (S22b) ; jamais mémorisé. */
  readonly repartirDeZero: { readonly disponible: boolean };
  readonly deciderPlusTard: { readonly disponible: true };
  /** Présente si une restauration est demandée et pas encore faite (S20b) ; action « Annuler la demande ». */
  readonly restaurationEnAttente?: true;
};

/**
 * Modèle de vue d'`ERR-012` et de son choix (n° 16) : `undefined` si `etat.actionRequise ≠ DONNEES_ABSENTES`
 * (« aucun choix entre restaurer et repartir de zéro n'est demandé ») ; sinon le modèle ci-dessus.
 */
export const construireChoixRestauration = (
  e: EntreeChoixRestauration,
): ModeleVueChoixRestauration | undefined =>
  nonImplemente(`construireChoixRestauration (${String(e.etat.actionRequise)})`);
