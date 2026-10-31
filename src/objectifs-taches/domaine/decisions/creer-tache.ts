import type { IdObjectif, IdTache } from '../../../commun/domaine/identifiants';
import { echec, succes } from '../../../commun/domaine/resultat';
import type { EvenementACreer } from '../../../synchronisation';
import { validerSaisieTache, type SaisieTache, type SaisieTacheValide } from '../saisie-tache';
import { objectifActif, type DecisionSurVue } from '../vue-metier';

// ST-US-002 §6.2.
export type CommandeCreerTache = {
  readonly id: IdTache;
  readonly saisie: SaisieTache;
  readonly objectifIds: ReadonlyArray<IdObjectif>;
};

const evenementCreation = (
  id: IdTache,
  saisie: SaisieTacheValide,
  objectifIds: ReadonlyArray<IdObjectif>,
): EvenementACreer => ({
  type: 'CREATION',
  element: { type: 'TACHE', id },
  avant: {},
  apres: { delai: saisie.delai, estimation: saisie.estimation, objectifIds },
  rang: 0,
});

export const deciderCreationTache =
  (c: CommandeCreerTache): DecisionSurVue<IdTache> =>
  (vue, contexte) => {
    const saisie = validerSaisieTache(c.saisie);
    if (!saisie.ok) return saisie;
    const objectifIds = [...new Set(c.objectifIds)];
    for (const objectifId of objectifIds) {
      const objectif = objectifActif(vue, objectifId);
      if (!objectif.ok) return echec(objectif.erreur);
    }
    const { intitule, delai, estimation } = saisie.valeur;
    return succes({
      modifications: [
        {
          type: 'CREER_TACHE',
          id: c.id,
          creeLe: contexte.instant,
          valeurs: { intitule, delai, estimationInitiale: estimation, objectifIds },
          evenement: evenementCreation(c.id, saisie.valeur, objectifIds),
        },
      ],
      valeur: c.id,
    });
  };
