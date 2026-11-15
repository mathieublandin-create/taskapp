import type { ErreurAuth } from '../../application/ports/fournisseur-auth';

// DAT v0.11.3 §4.1.7 (Q-ST022-STA-2) ; ST-US-022 §6.4. Fonctions pures utilisées par FournisseurAuthWeb.

/** `web-ios` : Safari sur iPhone (EPI-001, hors v1) ; lu dans la configuration. */
export type Plateforme = 'web' | 'web-ios';

/** Mécanisme employé en premier pour un geste (renouvellement ou reconnexion). */
export type MecanismeGeste = 'GIS' | 'REDIRECTION_INTERACTIVE';

/** Échec de GIS tel que le rapporte la passerelle (`error_callback` ou champ `error` de la réponse). */
export type ErreurGis =
  | { readonly type: 'SCRIPT_INDISPONIBLE' }
  | { readonly type: 'POPUP_FAILED_TO_OPEN' }
  | { readonly type: 'POPUP_CLOSED' }
  | { readonly type: 'ACCESS_DENIED' }
  | { readonly type: 'INCONNUE'; readonly code: string };

/** Suite d'un échec de GIS : une seule redirection interactive, ou un échec rendu tel quel. */
export type SuiteErreurGis =
  | { readonly type: 'REPLI_REDIRECTION_INTERACTIVE' }
  | { readonly type: 'ECHEC'; readonly erreur: ErreurAuth };

/** web → GIS ; web-ios → redirection interactive d'emblée, sans tenter GIS. */
export const mecanismeGeste = (plateforme: Plateforme): MecanismeGeste =>
  plateforme === 'web' ? 'GIS' : 'REDIRECTION_INTERACTIVE';

const REPLI: SuiteErreurGis = { type: 'REPLI_REDIRECTION_INTERACTIVE' };

/**
 * Repli (redirection interactive) pour SCRIPT_INDISPONIBLE avec réseau, POPUP_FAILED_TO_OPEN, INCONNUE ;
 * SCRIPT_INDISPONIBLE sans réseau → ReseauIndisponible ; POPUP_CLOSED → ConnexionAnnulee ;
 * ACCESS_DENIED → AccesGoogleRevoque. Jamais de repli sur POPUP_CLOSED ni ACCESS_DENIED.
 */
export const suiteErreurGis = (erreur: ErreurGis, reseau: 'CONNECTE' | 'COUPE'): SuiteErreurGis => {
  switch (erreur.type) {
    case 'SCRIPT_INDISPONIBLE':
      return reseau === 'CONNECTE'
        ? REPLI
        : { type: 'ECHEC', erreur: { type: 'ReseauIndisponible' } };
    case 'POPUP_FAILED_TO_OPEN':
    case 'INCONNUE':
      return REPLI;
    case 'POPUP_CLOSED':
      return { type: 'ECHEC', erreur: { type: 'ConnexionAnnulee' } };
    case 'ACCESS_DENIED':
      return { type: 'ECHEC', erreur: { type: 'AccesGoogleRevoque' } };
  }
};
