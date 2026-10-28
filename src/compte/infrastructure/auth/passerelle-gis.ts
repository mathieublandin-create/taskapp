import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurGis } from './strategie-geste';

// ST-US-022 §3.2 n° 25, §4.4 : interface interne qui isole le script Google Identity Services (modèle « jeton »).
// Adaptateur : passerelle-gis-navigateur.ts (chargement à la demande, R12) ; doublée dans les tests.
export type DemandeGis = {
  readonly clientId: string;
  readonly portees: ReadonlyArray<string>;
  /** login_hint : absent à la première connexion seulement. */
  readonly indice?: string;
};

/** Réponse de `requestAccessToken` ; le jeton n'est jamais journalisé. */
export type ReponseGis = {
  readonly jeton: string;
  readonly expireEnSecondes?: number;
  readonly portees: ReadonlyArray<string>;
};

export type PasserelleGis = {
  /** Ouvre la fenêtre de Google (`prompt: ''`) ; aucune exception ne sort. */
  readonly demanderJeton: (demande: DemandeGis) => Promise<Resultat<ReponseGis, ErreurGis>>;
};
