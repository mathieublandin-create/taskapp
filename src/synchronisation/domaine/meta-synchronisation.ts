import type { Marque } from '../../commun/domaine/marque';
import type { Instant } from '../../commun/domaine/temps/instant';
import type { Hlc } from './hlc';
import type { IdEvenement } from './identifiant-evenement';
import type { PlanEcriture } from './planifier-ecritures';
import type { AjoutsSignalements } from './signalements';

// Données locales non synchronisées (DAT §6.1) ; ST-US-017 §4.1.
export type IdFichierDrive = Marque<string, 'IdFichierDrive'>;

export type MetaSynchronisation = {
  readonly dossier?: IdFichierDrive;
  /** Mémorisé au premier dépôt confirmé (DAT §4.2.2). */
  readonly fichierPropre?: IdFichierDrive;
  readonly manifeste?: IdFichierDrive;
  readonly deposeJusquA?: Hlc;
  readonly pageToken?: string;
  readonly dernierContactDrive?: Instant;
  /** Une fusion a écrit des registres depuis le dernier dépôt confirmé. */
  readonly fusionNonDeposee: boolean;
};

export const META_INITIALE: MetaSynchronisation = { fusionNonDeposee: false };

export type PlanSynchronisation = {
  readonly plan: PlanEcriture;
  readonly meta: Partial<MetaSynchronisation>;
  /** ST-US-017 v0.5 §4.6 (incrément 2) : entrées écrites dans la même transaction ; absent ≡ vide. */
  readonly signalements?: AjoutsSignalements;
  /**
   * Condition C2 de Starck (DAT v0.11.8 §4.2) : entrées de réparation écrites sans entrée du déplacement annulé
   * (`ReparationHierarchie.deplacementsSansEntree`), à journaliser en « erreur » par le service ; absent ≡ aucune.
   */
  readonly deplacementsSansEntree?: ReadonlyArray<IdEvenement>;
};
