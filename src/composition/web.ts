import type { Horloge } from '../commun/application/ports/horloge';
import type { IdAppareil } from '../commun/domaine/identifiants';
import { GenerateurUuidV7 } from '../commun/infrastructure/generateur-uuid-v7';
import { HorlogeSysteme } from '../commun/infrastructure/horloge-systeme';
import { ServiceEtatLocalTransactionnel } from '../synchronisation/application/service-etat-local-transactionnel';
import type { ServiceEtatLocal } from '../synchronisation/application/service-etat-local';
import { DepotLocalDexie } from '../synchronisation/infrastructure/depot-local-dexie';

// Composition web (ADR-013). Au rang 0, assemblage du socle seulement ; le branchement sur `main.tsx`, l'ouverture
// de l'espace par compte et les cas d'usage arrivent au rang 1 (ST-US-022 §3.1 S10, Q-BEN-LOT001-5).
export type ParametresSocle = {
  /** Nom de la base de l'espace du compte, fourni par le contexte `compte` (rang 1). */
  readonly nomBase: string;
  readonly appareilId: IdAppareil;
};

export type SocleWeb = {
  readonly horloge: Horloge;
  readonly service: ServiceEtatLocal;
};

export const assemblerSocle = ({ nomBase, appareilId }: ParametresSocle): SocleWeb => {
  const horloge = new HorlogeSysteme();
  const depot = new DepotLocalDexie({ nomBase, appareilId });
  const service = new ServiceEtatLocalTransactionnel({
    depot,
    horloge,
    generateur: new GenerateurUuidV7(),
  });
  return { horloge, service };
};
