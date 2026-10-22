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
