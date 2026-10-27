import { nonImplemente } from '@non-implemente';
import type { ContenuFichierAppareil } from './contenu-fichier';
import type { RegistreQuelconque } from './ecriture';
import type { EtatLocal } from './etat-local';
import type { EvenementJournal } from './evenement-journal';
import type { IdEvenement } from './identifiant-evenement';
import type { CleTexte } from './information';
import type { PlanEcriture } from './planifier-ecritures';

// ADR-003, DS-11, DAT §4.2 (ST-US-017 §6.1).
export type EtatFusionnable = {
  readonly registres: ReadonlyMap<CleTexte, RegistreQuelconque>;
  readonly journal: ReadonlyMap<IdEvenement, EvenementJournal>;
};

/** Par information : l'écriture de plus grand HLC ; journal : union. Commutative, associative, idempotente. */
export const fusionnerEtats = (_a: EtatFusionnable, _b: EtatFusionnable): EtatFusionnable =>
  nonImplemente('fusionnerEtats');

/** Registres gagnants, entrées nouvelles, dernierHlc = max (réception, DAT §6.4) ; index inchangé. */
export const planifierFusion = (_etat: EtatLocal, _recu: ContenuFichierAppareil): PlanEcriture =>
  nonImplemente('planifierFusion');
