import { nonImplemente } from '@non-implemente';
import type { IdOperation } from '../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../commun/domaine/temps/date-calendaire';
import type { Instant } from '../../commun/domaine/temps/instant';
import type { RegistreQuelconque } from './ecriture';
import type { EtatLocal } from './etat-local';
import type { EvenementJournal } from './evenement-journal';
import type { CleTexte } from './information';
import type { Modification } from './modification';

// ST-socle-ecriture.md §6.3.
export type PlanEcriture = {
  readonly etatApres: EtatLocal; // version non incrémentée (le dépôt l'incrémente)
  readonly registresEcrits: ReadonlyArray<RegistreQuelconque>;
  readonly evenementsAjoutes: ReadonlyArray<EvenementJournal>;
  readonly enAttenteEcrites: ReadonlyArray<CleTexte>; // clés ajoutées ou modifiées
  readonly enAttenteRetirees: ReadonlyArray<CleTexte>;
};

export type ContextePlanification = {
  readonly operation: IdOperation;
  readonly instant: Instant;
  readonly jour: DateCalendaire;
  readonly physiqueCorrigee: Instant;
};

export const PLAN_VIDE = (_etat: EtatLocal): PlanEcriture => nonImplemente('PLAN_VIDE');

/** Lève ErreurProgrammation sur une modification incohérente (§8 n° 2). */
export const planifierEcritures = (
  _etat: EtatLocal,
  _modifications: ReadonlyArray<Modification>,
  _contexte: ContextePlanification,
): PlanEcriture => nonImplemente('planifierEcritures');
