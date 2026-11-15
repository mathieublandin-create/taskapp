import type { Instant } from '../../../commun/domaine/temps/instant';
import { formaterAnciennete } from '../../../commun/presentation/format/heure';
import type { CodeCatalogue } from '../../../commun/presentation/messages/codes';
import { libelle } from '../../../commun/presentation/messages/libelle';
import type { CopieLocale } from '../../domaine/copie-locale';
import type { EtatSynchronisationAffichable } from './etat-synchronisation-affichable';

// ST-US-017 v0.10 §4.7, §6.7 n° 16 ; ECR-011 E (maquette), guide §4.25 (OptionCard), §6.6.8 (ERR-012, Q-US-017-11).

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
 * Textes du composant `ChoixRestauration` (guide §6.6.4, famille `RST-`, et parties d'`ERR-012`) : le composant n'écrit
 * aucun texte. Construits par la composition.
 */
export type TextesChoixRestauration = {
  /** `libelle('SYN-ACTION')` : titre de la feuille. */
  readonly titreFeuille: string;
  /** « Fermer » (en-tête de la feuille) : même effet que « Décider plus tard ». */
  readonly fermer: string;
  /** `RST-RESTAURER`. */
  readonly phraseRestaurer: string;
  /** `RST-RESTAURATION-EN-COURS` : libellé du bouton entre le geste et la fin de la demande. */
  readonly restaurationEnCours: string;
  /** `RST-DEMANDEE` (variante `en-ligne` si le réseau est connecté). */
  readonly mentionDemandee: string;
  /** `RST-DEMANDEE`, partie `action` : « Annuler la demande ». */
  readonly annulerDemande: string;
  /** `ERR-012`, partie `actionSecondaire`. */
  readonly repartirDeZero: string;
  /** `RST-REPARTIR-ZERO`. */
  readonly phraseRepartirDeZero: string;
  /** `RST-REPARTIR-INDISPONIBLE`. */
  readonly repartirDeZeroIndisponible: string;
  /** `ERR-012`, partie `fermeture`. */
  readonly deciderPlusTard: string;
  /** `RST-PLUS-TARD`. */
  readonly phraseDeciderPlusTard: string;
};

/** Contenu de `CNF-REPARTIR-ZERO` pour la boîte de confirmation commune (`n` = `RepartirDeZero.evaluer`). */
export type ConfirmationRepartirDeZero = {
  readonly code: CodeCatalogue;
  readonly titre: string;
  readonly texte: string;
  readonly actionLibelle: string;
};

/** Libellé générique de l'en-tête de la feuille (guide §6.6.4 : « Fermer »), sans code de catalogue (comme « Annuler »). */
export const LIBELLE_FERMER = 'Fermer';

/** Textes du composant selon le réseau : la mention de la demande dit « au retour du réseau » ou « à la prochaine synchronisation ». */
export const construireTextesChoixRestauration = (
  reseau: EtatSynchronisationAffichable['reseau'],
): TextesChoixRestauration => ({
  titreFeuille: libelle('SYN-ACTION'),
  fermer: LIBELLE_FERMER,
  phraseRestaurer: libelle('RST-RESTAURER'),
  restaurationEnCours: libelle('RST-RESTAURATION-EN-COURS'),
  mentionDemandee: libelle('RST-DEMANDEE', reseau === 'CONNECTE' ? { variante: 'en-ligne' } : {}),
  annulerDemande: libelle('RST-DEMANDEE', {}, 'action'),
  repartirDeZero: libelle('ERR-012', {}, 'actionSecondaire'),
  phraseRepartirDeZero: libelle('RST-REPARTIR-ZERO'),
  repartirDeZeroIndisponible: libelle('RST-REPARTIR-INDISPONIBLE'),
  deciderPlusTard: libelle('ERR-012', {}, 'fermeture'),
  phraseDeciderPlusTard: libelle('RST-PLUS-TARD'),
});

/** Confirmation de « Repartir de zéro » : la phrase des modifications perdues n'existe que si `n ≥ 1` (variante `perte`). */
export const construireConfirmationRepartirDeZero = (n: number): ConfirmationRepartirDeZero => ({
  code: 'CNF-REPARTIR-ZERO',
  titre: libelle('CNF-REPARTIR-ZERO'),
  texte: libelle('CNF-REPARTIR-ZERO', n > 0 ? { n, variante: 'perte' } : {}, 'texte'),
  actionLibelle: libelle('CNF-REPARTIR-ZERO', {}, 'action'),
});

/**
 * Modèle de vue d'`ERR-012` et de son choix (n° 16) : `undefined` si `etat.actionRequise ≠ DONNEES_ABSENTES`
 * (« aucun choix entre restaurer et repartir de zéro n'est demandé ») ; sinon le modèle ci-dessus.
 */
export const construireChoixRestauration = ({
  etat,
  restaurationDemandee,
  decisionReportee,
  copie,
  maintenant,
}: EntreeChoixRestauration): ModeleVueChoixRestauration | undefined => {
  if (etat.actionRequise !== 'DONNEES_ABSENTES') return undefined;
  const anciennete = formaterAnciennete(copie.derniereMiseAJour ?? maintenant, maintenant);
  const copieVide = copie.objectifs === 0 && copie.taches === 0;
  return {
    code: 'ERR-012',
    titre: libelle('ERR-012'),
    texte: libelle(
      'ERR-012',
      {
        objectifs: copie.objectifs,
        taches: copie.taches,
        anciennete,
        ...(copieVide ? { variante: 'copie-vide' } : {}),
      },
      'texte',
    ),
    propose: !decisionReportee,
    restaurer: { libelle: libelle('ERR-012', {}, 'action'), disponible: true },
    repartirDeZero: { disponible: etat.reseau === 'CONNECTE' },
    deciderPlusTard: { disponible: true },
    ...(restaurationDemandee ? { restaurationEnAttente: true as const } : {}),
  };
};
