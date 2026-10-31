import { Duree } from '../../commun/domaine/duree';
import { echec, succes, type Resultat } from '../../commun/domaine/resultat';
import type { DateCalendaire } from '../../commun/domaine/temps/date-calendaire';
import { construireIntitule, type Intitule } from './intitule';
import type { DefautSaisie, SaisieInvalide } from './refus';

// RG-003, RG-028, RG-029 ; cumul dans l'ordre intitulé, délai, estimation (ST-US-002 §6.1).
export type SaisieTache = {
  readonly intitule: string;
  readonly delai?: DateCalendaire;
  readonly estimationMinutes?: number;
};

export type SaisieTacheValide = {
  readonly intitule: Intitule;
  readonly delai: DateCalendaire;
  readonly estimation: Duree;
};

const defautEstimation = (
  estimation: Resultat<Duree, unknown> | undefined,
): ReadonlyArray<DefautSaisie> => {
  if (estimation === undefined) return ['ESTIMATION_ABSENTE'];
  return estimation.ok ? [] : ['ESTIMATION_INVALIDE'];
};

export const validerSaisieTache = (s: SaisieTache): Resultat<SaisieTacheValide, SaisieInvalide> => {
  const intitule = construireIntitule(s.intitule);
  const estimation =
    s.estimationMinutes === undefined ? undefined : Duree.saisie(s.estimationMinutes);
  if (intitule.ok && s.delai !== undefined && estimation?.ok === true) {
    return succes({ intitule: intitule.valeur, delai: s.delai, estimation: estimation.valeur });
  }
  return echec({
    type: 'SaisieInvalide',
    defauts: [
      ...(intitule.ok ? [] : (['INTITULE_VIDE'] as const)),
      ...(s.delai === undefined ? (['DELAI_ABSENT'] as const) : []),
      ...defautEstimation(estimation),
    ],
  });
};
