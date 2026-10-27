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
};

/** response_type=token, prompt=none, include_granted_scopes=true, login_hint, state, redirect_uri, scope. */
export const construireUrlAutorisation = (_p: ParametresAutorisation): string =>
  nonImplemente('construireUrlAutorisation');

/** Origine suivie du chemin de base, barre oblique finale comprise (conventions.md §9.1). */
export const uriRedirection = (_config: { readonly origine: string; readonly cheminDeBase: string }): string =>
  nonImplemente('uriRedirection');

/** Base64url sans remplissage (RFC 4648 §5). */
export const encoderBase64Url = (_octets: Uint8Array): string => nonImplemente('encoderBase64Url');
