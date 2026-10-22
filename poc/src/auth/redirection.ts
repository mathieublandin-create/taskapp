/**
 * Jeton par redirection pleine page (étude PWA unique, §3.1) : flux implicite, `prompt=none`.
 * Logique pure : aucune lecture de `window`, pour rester testable. Le jeton n'est jamais journalisé.
 */

const URL_AUTORISATION = 'https://accounts.google.com/o/oauth2/v2/auth';

export type CategorieErreur =
  'interaction_requise' | 'acces_revoque' | 'configuration' | 'etat_invalide' | 'inconnue';

export type RetourRedirection =
  | { type: 'aucun' }
  | { type: 'jeton'; jeton: string; dureeSecondes: number | null; scopes: string[]; state: string }
  | { type: 'erreur'; code: string; categorie: CategorieErreur; state: string };

const ERREURS_INTERACTION = new Set([
  'interaction_required',
  'login_required',
  'consent_required',
  'account_selection_required',
  'access_denied',
]);
const ERREURS_CONFIGURATION = new Set([
  'invalid_request',
  'invalid_client',
  'invalid_scope',
  'redirect_uri_mismatch',
  'unauthorized_client',
  'unsupported_response_type',
  'origin_mismatch',
]);

/** Classe un code d'erreur OAuth renvoyé par Google. Le code brut reste à journaliser. */
export function classerErreur(code: string): CategorieErreur {
  if (ERREURS_INTERACTION.has(code)) return 'interaction_requise';
  if (code === 'invalid_grant') return 'acces_revoque';
  if (ERREURS_CONFIGURATION.has(code)) return 'configuration';
  return 'inconnue';
}

/** Analyse le fragment d'URL (avec ou sans `#`) du retour de Google. */
export function analyserFragment(fragment: string): RetourRedirection {
  const params = new URLSearchParams(fragment.replace(/^#/, ''));
  const state = params.get('state') ?? '';
  const erreur = params.get('error');
  if (erreur !== null) {
    return { type: 'erreur', code: erreur, categorie: classerErreur(erreur), state };
  }
  const jeton = params.get('access_token');
  if (jeton === null || jeton === '') return { type: 'aucun' };
  const duree = Number(params.get('expires_in'));
  return {
    type: 'jeton',
    jeton,
    dureeSecondes: Number.isFinite(duree) && duree > 0 ? duree : null,
    scopes: (params.get('scope') ?? '').split(' ').filter((s) => s !== ''),
    state,
  };
}

export interface ParametresRedirection {
  clientId: string;
  /** Adresse exacte déclarée dans le client OAuth Web (« URI de redirection autorisés »). */
  redirectUri: string;
  scopes: readonly string[];
  state: string;
  /** Adresse du compte, si connue : évite le sélecteur de compte. */
  loginHint?: string;
}

export function construireUrlRedirection(p: ParametresRedirection): string {
  const params = new URLSearchParams({
    client_id: p.clientId,
    redirect_uri: p.redirectUri,
    response_type: 'token',
    scope: p.scopes.join(' '),
    prompt: 'none',
    state: p.state,
    include_granted_scopes: 'true',
  });
  if (p.loginHint) params.set('login_hint', p.loginHint);
  return `${URL_AUTORISATION}?${params.toString()}`;
}

/** Contexte conservé à travers la redirection (la page est rechargée). Ne contient aucun jeton. */
export interface ContexteRedirection {
  state: string;
  debutMs: number;
  /** Nombre de redirections lancées depuis la remise à zéro du compteur. */
  numero: number;
}

const CLE_CONTEXTE = 'poc.redirection.contexte';
const CLE_COMPTEUR = 'poc.redirection.compteur';

type Stockage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function demarrerContexte(
  stockage: Stockage,
  state: string,
  maintenantMs: number,
): ContexteRedirection {
  const numero = Number(stockage.getItem(CLE_COMPTEUR) ?? '0') + 1;
  const contexte = { state, debutMs: maintenantMs, numero };
  stockage.setItem(CLE_COMPTEUR, String(numero));
  stockage.setItem(CLE_CONTEXTE, JSON.stringify(contexte));
  return contexte;
}

/** Relit puis efface le contexte : un retour ne se traite qu'une fois. */
export function consommerContexte(stockage: Stockage): ContexteRedirection | null {
  const brut = stockage.getItem(CLE_CONTEXTE);
  stockage.removeItem(CLE_CONTEXTE);
  if (brut === null) return null;
  try {
    return JSON.parse(brut) as ContexteRedirection;
  } catch {
    return null;
  }
}

export function reinitialiserCompteur(stockage: Stockage): void {
  stockage.removeItem(CLE_COMPTEUR);
}

const CLE_AUTO = 'poc.redirection.auto';

/** Un départ est en attente de retour (contexte écrit, jamais consommé). */
export function contexteEnAttente(stockage: Pick<Storage, 'getItem'>): boolean {
  return stockage.getItem(CLE_CONTEXTE) !== null;
}

export function lireOptionAutomatique(stockage: Pick<Storage, 'getItem'>): boolean {
  return stockage.getItem(CLE_AUTO) === 'true';
}

export function ecrireOptionAutomatique(
  stockage: Pick<Storage, 'setItem' | 'removeItem'>,
  actif: boolean,
): void {
  if (actif) stockage.setItem(CLE_AUTO, 'true');
  else stockage.removeItem(CLE_AUTO);
}
