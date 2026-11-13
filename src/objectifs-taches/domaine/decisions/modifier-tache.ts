import { Duree } from '../../../commun/domaine/duree';
import type { IdTache } from '../../../commun/domaine/identifiants';
import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { Decision, Modification } from '../../../synchronisation';
import { construireIntitule } from '../intitule';
import type { RefusMetier } from '../refus';
import { estimationEnVigueur } from '../estimation';
import { sousTachesDe, tacheActive, type DecisionSurVue } from '../vue-metier';

// ST-US-002 §6.2 (RG-004, RG-050).
const sansModification: Decision<void> = { modifications: [], valeur: undefined };

const modifier = (modification: Modification): Resultat<Decision<void>, RefusMetier> =>
  succes({ modifications: [modification], valeur: undefined });

export const deciderRenommageTache =
  (c: { readonly tacheId: IdTache; readonly intitule: string }): DecisionSurVue<void> =>
  (vue) => {
    const tache = tacheActive(vue, c.tacheId);
    if (!tache.ok) return tache;
    const intitule = construireIntitule(c.intitule);
    if (!intitule.ok) return echec({ type: 'SaisieInvalide', defauts: ['INTITULE_VIDE'] });
    if (intitule.valeur === tache.valeur.intitule) return succes(sansModification);
    return modifier({
      type: 'ECRIRE_TACHE',
      id: c.tacheId,
      ecriture: { champ: 'intitule', valeur: intitule.valeur },
    });
  };

export const deciderModificationDelaiTache =
  (c: { readonly tacheId: IdTache; readonly delai: DateCalendaire }): DecisionSurVue<void> =>
  (vue) => {
    const tache = tacheActive(vue, c.tacheId);
    if (!tache.ok) return tache;
    if (c.delai === tache.valeur.delai) return succes(sansModification);
    return modifier({
      type: 'ECRIRE_TACHE',
      id: c.tacheId,
      ecriture: { champ: 'delai', valeur: c.delai },
      evenement: {
        type: 'MODIFICATION_DELAI',
        element: { type: 'TACHE', id: c.tacheId },
        avant: { delai: tache.valeur.delai },
        apres: { delai: c.delai },
        rang: 0,
      },
    });
  };

/** Une tâche parente a une estimation calculée : modification refusée avant tout contrôle de la valeur (RG-023). */
export const deciderModificationEstimation =
  (c: { readonly tacheId: IdTache; readonly estimationMinutes: number }): DecisionSurVue<void> =>
  (vue) => {
    const tache = tacheActive(vue, c.tacheId);
    if (!tache.ok) return tache;
    if (sousTachesDe(vue, c.tacheId).length > 0) return echec({ type: 'EstimationCalculee' });
    const nouvelle = Duree.saisie(c.estimationMinutes);
    if (!nouvelle.ok) return echec({ type: 'SaisieInvalide', defauts: ['ESTIMATION_INVALIDE'] });
    const avant = estimationEnVigueur(vue, c.tacheId).duree;
    if (nouvelle.valeur === avant) return succes(sansModification);
    return modifier({
      type: 'ECRIRE_TACHE',
      id: c.tacheId,
      ecriture: { champ: 'estimationInitiale', valeur: nouvelle.valeur },
      evenement: {
        type: 'MODIFICATION_ESTIMATION',
        element: { type: 'TACHE', id: c.tacheId },
        avant: { estimation: avant },
        apres: { estimation: nouvelle.valeur },
        rang: 0,
      },
    });
  };
