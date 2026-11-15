// Interface publique du contexte compte (ST-US-022 §3.2 n° 36) : ce dont la composition et les autres contextes
// ont besoin. Aucun jeton n'est exposé (RED-05).
export type { EtatAcces } from './domaine/acces';
export type { AdresseGoogle, IdCompte, Identite } from './domaine/identite';
export type { EtatSession, SessionCourante } from './application/session-courante';
export { SignalerRefusJeton } from './application/cas-usage/signaler-refus-jeton';
