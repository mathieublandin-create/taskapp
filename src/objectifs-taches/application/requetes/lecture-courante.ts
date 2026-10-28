import type { Horloge } from '../../../commun/application/ports/horloge';
import { succes, type Resultat } from '../../../commun/domaine/resultat';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import { jourDeReference } from '../../../commun/domaine/temps/jour-de-reference';
import type { DecisionMetier, ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { RefusMetier } from '../../domaine/refus';
import { construireVueMetier, type DecisionSurVue, type VueMetier } from '../../domaine/vue-metier';

// ST-US-001 §3 n° 15, §4.1.
export type VueCourante = { readonly vue: VueMetier; readonly jour: DateCalendaire };

/** Vue métier de l'état local et jour de Paris de `horloge.maintenant()`. */
export const lireVueCourante = async (
  service: ServiceEtatLocal,
  horloge: Horloge,
): Promise<Resultat<VueCourante, ErreurDepotLocal>> => {
  const etat = await service.lire();
  if (!etat.ok) return etat;
  return succes({
    vue: construireVueMetier(etat.valeur),
    jour: jourDeReference(horloge.maintenant()),
  });
};

/** Construit la vue à partir de l'EtatMetier reçu dans la transaction, puis applique la décision. */
export const avecVue =
  <T>(decision: DecisionSurVue<T>): DecisionMetier<T, RefusMetier> =>
  (etat, contexte) =>
    decision(construireVueMetier(etat), contexte);
