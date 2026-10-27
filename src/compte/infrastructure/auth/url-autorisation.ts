import { nonImplemente } from '@non-implemente';
import { EcartTemps } from '../../../commun/domaine/temps/ecart-temps';

// DAT §4.1.7, ADR-013, RED-03.
export const URL_AUTORISATION_GOOGLE = 'https://accounts.google.com/o/oauth2/v2/auth';
/** RED-03 : validité du `state` (référence ADR-013). */
export const VALIDITE_STATE_REDIRECTION = EcartTemps.depuisMillisecondes(10 * 60_000);

export type ParametresAutorisation = {
  readonly clientId: string;
  readonly redirectUri: string;
  readonly portees: ReadonlyArray<string>;
  readonly state: string;
  readonly indice: string;
  /**
   * SILENCIEUSE : ouverture de l'application (`prompt=none`). INTERACTIVE : repli d'un geste quand GIS
   * échoue pour une cause technique, ou geste sur web-ios (`prompt` absent ; DAT v0.11.3 §4.1.7, Q-ST022-STA-2).
   */
  readonly interaction: 'SILENCIEUSE' | 'INTERACTIVE';
};

/**
 * response_type=token, include_granted_scopes=true, login_hint, state, redirect_uri, scope ;
 * prompt=none en interaction SILENCIEUSE seulement (aucun paramètre prompt en INTERACTIVE).
 */
export const construireUrlAutorisation = (_p: ParametresAutorisation): string =>
  nonImplemente('construireUrlAutorisation');

/** Origine suivie du chemin de base, barre oblique finale comprise (conventions.md §9.1). */
export const uriRedirection = (_config: {
  readonly origine: string;
  readonly cheminDeBase: string;
}): string => nonImplemente('uriRedirection');

/** Base64url sans remplissage (RFC 4648 §5). */
export const encoderBase64Url = (_octets: Uint8Array): string => nonImplemente('encoderBase64Url');
