import type { IdObjectif } from '../../../commun/domaine/identifiants';
import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import type { Decision, Modification } from '../../../synchronisation';
import { normaliserDescription } from '../description';
import { construireIntitule } from '../intitule';
import type { RefusMetier } from '../refus';
import { objectifActif, type DecisionSurVue } from '../vue-metier';

// ST-US-001 §6.4 (RG-004, RG-050).
const sansModification: Decision<void> = { modifications: [], valeur: undefined };

const modifier = (modification: Modification): Resultat<Decision<void>, RefusMetier> =>
  succes({ modifications: [modification], valeur: undefined });

export const deciderRenommageObjectif =
  (c: { readonly objectifId: IdObjectif; readonly intitule: string }): DecisionSurVue<void> =>
  (vue) => {
    const objectif = objectifActif(vue, c.objectifId);
    if (!objectif.ok) return objectif;
    const intitule = construireIntitule(c.intitule);
    if (!intitule.ok) return echec({ type: 'SaisieInvalide', defauts: ['INTITULE_VIDE'] });
    if (intitule.valeur === objectif.valeur.intitule) return succes(sansModification);
    return modifier({
      type: 'ECRIRE_OBJECTIF',
      id: c.objectifId,
      ecriture: { champ: 'intitule', valeur: intitule.valeur },
    });
  };

export const deciderModificationDescription =
  (c: { readonly objectifId: IdObjectif; readonly description?: string }): DecisionSurVue<void> =>
  (vue) => {
    const objectif = objectifActif(vue, c.objectifId);
    if (!objectif.ok) return objectif;
    const description = normaliserDescription(c.description);
    if (description === objectif.valeur.description) return succes(sansModification);
    return modifier({
      type: 'ECRIRE_OBJECTIF',
      id: c.objectifId,
      ecriture: { champ: 'description', valeur: description },
    });
  };

const ecrireDelai = (
  objectifId: IdObjectif,
  avant: DateCalendaire | undefined,
  apres: DateCalendaire | undefined,
): Resultat<Decision<void>, RefusMetier> =>
  avant === apres
    ? succes(sansModification)
    : modifier({
        type: 'ECRIRE_OBJECTIF',
        id: objectifId,
        ecriture: { champ: 'delai', valeur: apres },
        evenement: {
          type: 'MODIFICATION_DELAI',
          element: { type: 'OBJECTIF', id: objectifId },
          avant: avant === undefined ? {} : { delai: avant },
          apres: apres === undefined ? {} : { delai: apres },
          rang: 0,
        },
      });

export const deciderModificationDelaiObjectif =
  (c: { readonly objectifId: IdObjectif; readonly delai: DateCalendaire }): DecisionSurVue<void> =>
  (vue) => {
    const objectif = objectifActif(vue, c.objectifId);
    return objectif.ok ? ecrireDelai(c.objectifId, objectif.valeur.delai, c.delai) : objectif;
  };

export const deciderRetraitDelaiObjectif =
  (c: { readonly objectifId: IdObjectif }): DecisionSurVue<void> =>
  (vue) => {
    const objectif = objectifActif(vue, c.objectifId);
    return objectif.ok ? ecrireDelai(c.objectifId, objectif.valeur.delai, undefined) : objectif;
  };
