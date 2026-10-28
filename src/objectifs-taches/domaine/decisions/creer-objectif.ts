import { nonImplemente } from '@non-implemente';
import type { IdObjectif } from '../../../commun/domaine/identifiants';
import { echec, succes } from '../../../commun/domaine/resultat';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import { normaliserDescription } from '../description';
import { construireIntitule } from '../intitule';
import type { DecisionSurVue } from '../vue-metier';

// ST-US-001 §6.4 ; parent : ST-US-023 §6.2.
export type CommandeCreerObjectif = {
  readonly id: IdObjectif;
  readonly intitule: string;
  readonly description?: string;
  readonly delai?: DateCalendaire;
  readonly parentId?: IdObjectif;
};

export const deciderCreationObjectif =
  (commande: CommandeCreerObjectif): DecisionSurVue<IdObjectif> =>
  (_vue, contexte) => {
    if (commande.parentId !== undefined) return nonImplemente('deciderCreationObjectif (parent)');
    const intitule = construireIntitule(commande.intitule);
    if (!intitule.ok) return echec({ type: 'SaisieInvalide', defauts: ['INTITULE_VIDE'] });
    const description = normaliserDescription(commande.description);
    const { id, delai } = commande;
    return succes({
      modifications: [
        {
          type: 'CREER_OBJECTIF',
          id,
          creeLe: contexte.instant,
          valeurs: {
            intitule: intitule.valeur,
            ...(description === undefined ? {} : { description }),
            ...(delai === undefined ? {} : { delai }),
          },
          evenement: {
            type: 'CREATION',
            element: { type: 'OBJECTIF', id },
            avant: {},
            apres: delai === undefined ? {} : { delai },
            rang: 0,
          },
        },
      ],
      valeur: id,
    });
  };
