// Interface publique du contexte objectifs-taches (ST-US-001 §3 n° 33) : cas d'usage, requêtes, modèles de vue et
// types dont la composition et l'interface ont besoin. Aucune commande ne permet de saisir l'état d'un objectif
// (US-001 CA-8) : l'état est calculé.
export { CreerObjectif } from './application/cas-usage/creer-objectif';
export { CreerSousObjectif } from './application/cas-usage/creer-sous-objectif';
export {
  ModifierDelaiObjectif,
  ModifierDescriptionObjectif,
  RenommerObjectif,
  RetirerDelaiObjectif,
} from './application/cas-usage/modifier-objectif';
export { PlacerObjectif, RendreObjectifPrincipal } from './application/cas-usage/placer-objectif';
export { SupprimerObjectif } from './application/cas-usage/supprimer-objectif';
export { ConsulterDetailObjectif } from './application/requetes/consulter-detail-objectif';
export type { DetailObjectif } from './application/requetes/consulter-detail-objectif';
export { ConsulterHistorique } from './application/requetes/consulter-historique';
export { ConsulterSelecteurParent } from './application/requetes/consulter-selecteur-parent';
export type { SelecteurParent } from './application/requetes/consulter-selecteur-parent';
export { ConsulterObjectifs } from './application/requetes/consulter-objectifs';
export type { ObjectifsConsultes } from './application/requetes/consulter-objectifs';
export type { ResumeObjectif } from './application/requetes/resumes';
export type { ActionObjectif } from './domaine/actions';
export type { ConfirmationRequise, Evaluation } from './domaine/confirmation';
export type { RefusMetier } from './domaine/refus';
export {
  construireConfirmation,
  type ModeleVueConfirmation,
} from './presentation/modeles-de-vue/confirmation';
export {
  construireDetailObjectif,
  type ModeleVueDetailObjectif,
} from './presentation/modeles-de-vue/detail-objectif';
export type { LigneObjectif, ModeleVueDelai } from './presentation/modeles-de-vue/ligne-objectif';
export {
  construireListeObjectifs,
  type ModeleVueListeObjectifs,
} from './presentation/modeles-de-vue/liste-objectifs';
export {
  construireSelecteurParent,
  type ModeleVueSelecteurParent,
  type OptionParent,
} from './presentation/modeles-de-vue/selecteur-parent';
export {
  messagesDeRefus,
  type MessageRefus,
} from './presentation/modeles-de-vue/messages-de-refus';
export { VUES_EXPOSEES, type NomVue } from './presentation/modeles-de-vue/vues-exposees';
