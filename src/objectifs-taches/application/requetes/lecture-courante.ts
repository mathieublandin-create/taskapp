import { nonImplemente } from '@non-implemente';
import type { Horloge } from '../../../commun/application/ports/horloge';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { DecisionMetier, ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { RefusMetier } from '../../domaine/refus';
import type { DecisionSurVue, VueMetier } from '../../domaine/vue-metier';

// ST-US-001 §3 n° 15, §4.1.
export type VueCourante = { readonly vue: VueMetier; readonly jour: DateCalendaire };

/** Vue métier de l'état local et jour de Paris de `horloge.maintenant()`. */
export const lireVueCourante = (
  _service: ServiceEtatLocal,
  _horloge: Horloge,
): Promise<Resultat<VueCourante, ErreurDepotLocal>> => nonImplemente('lireVueCourante');

/** Construit la vue à partir de l'EtatMetier reçu dans la transaction, puis applique la décision. */
export const avecVue = <T>(_decision: DecisionSurVue<T>): DecisionMetier<T, RefusMetier> =>
  nonImplemente('avecVue');
