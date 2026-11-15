// Interface publique du contexte synchronisation (ST-socle-ecriture.md §3 n° 29).
// Ni Hlc, ni Ecriture, ni ContexteCausal ne sont exposés.
export type { ErreurDepotLocal } from './application/ports/depot-local';
export type {
  ContexteDecision,
  Decision,
  DecisionMetier,
  ServiceEtatLocal,
} from './application/service-etat-local';
export type {
  CycleDeVie,
  EtatMetier,
  ObjectifEnregistre,
  TacheEnregistree,
} from './domaine/etat-metier';
export type {
  EtatJournal,
  EvenementACreer,
  EvenementJournal,
  TypeEvenementJournal,
} from './domaine/evenement-journal';
export { idEvenement } from './domaine/identifiant-evenement';
export type { IdEvenement } from './domaine/identifiant-evenement';
export type { RefElementMetier } from './domaine/information';
export type {
  EcritureChampObjectif,
  EcritureChampTache,
  Modification,
} from './domaine/modification';
// ST-US-022 §3.2 n° 49 (rang 1) : ports et modèles de vue de l'état de synchronisation utiles à la composition.
export type { AccesGoogle, EtatAccesGoogle } from './application/ports/acces-google';
export type { EtatMoteur, SuiviCycle } from './application/ports/suivi-cycle';
export { SUIVI_CYCLE_AU_REPOS } from './application/ports/suivi-cycle';
export type { IdFichierDrive, TransportSynchro } from './application/ports/transport-synchro';
export { MasquageRappel } from './application/masquage-rappel';
export { PreparationDossierDrive } from './application/preparation-dossier-drive';
export { consulterEtatSynchronisation } from './application/requetes/consulter-etat-synchronisation';
export type { EtatSynchronisationAffichable } from './presentation/modeles-de-vue/etat-synchronisation-affichable';
export {
  construireIndicateur,
  selectionnerEtatIndicateur,
  type ModeleVueIndicateur,
} from './presentation/modeles-de-vue/indicateur-synchronisation';
export { construireBandeau, type ModeleVueBandeau } from './presentation/modeles-de-vue/bandeau';
// ST-US-017 §4.5 (rang 3) : mention « en attente » lue par les modèles de vue des lignes.
export { mentionAttente, mentionAttenteSi } from './presentation/modeles-de-vue/mention-attente';
