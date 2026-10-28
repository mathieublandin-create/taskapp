import type { RetourGoogle } from '../../application/ports/fournisseur-auth';

// RED-01, RED-02 (conventions.md §9.2.1) : seul fichier qui lit `location.hash` et appelle `history.replaceState`.
export type NavigationRetour = {
  /** Fragment courant, avec ou sans « # ». */
  readonly lireFragment: () => string;
  /** history.replaceState(history.state, '', pathname + search). */
  readonly effacerFragment: () => void;
};

/** Implémentation du navigateur, appelée par la première instruction de main.tsx. */
export const NAVIGATION_RETOUR_NAVIGATEUR: NavigationRetour = {
  lireFragment: () => location.hash,
  effacerFragment: () => {
    history.replaceState(history.state, '', location.pathname + location.search);
  },
};

const DUREE_POSITIVE = /^[1-9]\d{0,8}$/;

const champ = (parametres: URLSearchParams, nom: string): string | undefined => {
  const valeur = parametres.get(nom);
  return valeur === null || valeur === '' ? undefined : valeur;
};

const avecState = (state: string | undefined): { readonly state?: string } =>
  state === undefined ? {} : { state };

const lireParametres = (fragment: string): URLSearchParams | undefined => {
  try {
    return new URLSearchParams(fragment.startsWith('#') ? fragment.slice(1) : fragment);
  } catch {
    return undefined;
  }
};

/**
 * Analyse pure du fragment de retour de Google (RetourGoogle, ST-US-022 §4.3). Un fragment sans
 * `access_token` ni `error` (vide, mal formé, étranger à Google) vaut AUCUN.
 */
export const analyserFragment = (fragment: string): RetourGoogle => {
  const parametres = lireParametres(fragment);
  if (parametres === undefined) return { type: 'AUCUN' };
  const state = champ(parametres, 'state');
  const code = champ(parametres, 'error');
  if (code !== undefined) return { type: 'ERREUR', code, ...avecState(state) };
  const jeton = champ(parametres, 'access_token');
  if (jeton === undefined) return { type: 'AUCUN' };
  const duree = champ(parametres, 'expires_in');
  const portees = (champ(parametres, 'scope') ?? '').split(' ').filter((p) => p !== '');
  return {
    type: 'JETON',
    jeton,
    ...(duree !== undefined && DUREE_POSITIVE.test(duree)
      ? { expireEnSecondes: Number(duree) }
      : {}),
    portees,
    ...avecState(state),
  };
};

/**
 * Première instruction de main.tsx, synchrone : copie le fragment, l'efface aussitôt, quel qu'il soit,
 * puis l'analyse. L'effacement précède toujours l'analyse.
 */
export const consommerRetourRedirection = (navigation: NavigationRetour): RetourGoogle => {
  const fragment = navigation.lireFragment();
  navigation.effacerFragment();
  return analyserFragment(fragment);
};
