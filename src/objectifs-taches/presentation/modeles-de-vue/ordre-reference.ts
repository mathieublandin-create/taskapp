import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { Instant } from '../../../commun/domaine/temps/instant';
import type { ResumeTache } from '../../application/requetes/resumes';

// Guide v0.2.9 §5.8 (ST-US-001 §6.6) : délai croissant, sans délai à la fin ; puis creeLe croissant ;
// puis intitulé (Intl.Collator('fr', { sensitivity: 'base' })) ; puis id (comparaison ordinale).
export type ElementOrdonnable = {
  readonly id: string;
  readonly intitule: string;
  readonly delai?: DateCalendaire;
  readonly creeLe: Instant;
};

const COLLATEUR = new Intl.Collator('fr', { sensitivity: 'base' });

const comparerDelais = (a: DateCalendaire | undefined, b: DateCalendaire | undefined): number => {
  if (a === b) return 0;
  if (a === undefined) return 1;
  if (b === undefined) return -1;
  return a < b ? -1 : 1;
};

const comparerOrdinal = (a: string, b: string): number => {
  if (a === b) return 0;
  return a < b ? -1 : 1;
};

/** Départage commun : création croissante, puis intitulé, puis identifiant. */
const comparerSansDelai = (a: ElementOrdonnable, b: ElementOrdonnable): number =>
  a.creeLe - b.creeLe || COLLATEUR.compare(a.intitule, b.intitule) || comparerOrdinal(a.id, b.id);

export const comparerOrdreReference = (a: ElementOrdonnable, b: ElementOrdonnable): number =>
  comparerDelais(a.delai, b.delai) || comparerSansDelai(a, b);

export type Terminaison = { readonly date: DateCalendaire; readonly instant: Instant };

/** Date et instant de fin (tâche terminée) ou d'abandon (tâche abandonnée) ; une tâche à faire n'en a pas. */
export const terminaison = ({ cycleDeVie }: ResumeTache): Terminaison | undefined => {
  if (cycleDeVie.etat === 'TERMINEE')
    return { date: cycleDeVie.dateFin, instant: cycleDeVie.instantFin };
  if (cycleDeVie.etat === 'ABANDONNEE') {
    return { date: cycleDeVie.dateAbandon, instant: cycleDeVie.instantAbandon };
  }
  return undefined;
};

/**
 * Tâches terminées ou abandonnées (guide §5.7 ; ST-US-002 §6.4) : date de fin ou d'abandon décroissante,
 * puis instant décroissant, puis création, intitulé, id.
 */
export const comparerParFinDecroissante = (a: ResumeTache, b: ResumeTache): number => {
  const fa = terminaison(a);
  const fb = terminaison(b);
  if (fa === undefined || fb === undefined) return comparerSansDelai(a, b);
  return comparerOrdinal(fb.date, fa.date) || fb.instant - fa.instant || comparerSansDelai(a, b);
};
