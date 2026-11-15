// Interface publique de l'infrastructure Google partagée (conventions.md §4.2) : client (ST-US-022 §6.8) et
// politique de reprise (DAT §4.4.5), utilisés par les adaptateurs Drive et par PreparationDossierDrive.
export { ClientGoogle, traduireReponse } from './client-google';
export type {
  DependancesClientGoogle,
  ErreurGoogle,
  ReponseGoogle,
  RequeteGoogle,
} from './client-google';
export {
  DELAI_INITIAL_REPRISE,
  delaiAvantTentative,
  estErreurTransitoire,
  executerAvecReprise,
  FACTEUR_REPRISE,
  PLAFOND_REPRISE,
  TENTATIVES_AVANT_ABANDON,
} from './reprise';
