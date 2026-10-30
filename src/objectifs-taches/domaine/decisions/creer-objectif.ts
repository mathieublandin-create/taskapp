import type { IdObjectif } from '../../../commun/domaine/identifiants';
import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import { normaliserDescription } from '../description';
import { construireIntitule } from '../intitule';
import { estObjectifPrincipal } from '../hierarchie-objectifs';
import type { RefusMetier } from '../refus';
import type { ContexteDecision, Decision, EvenementACreer } from '../../../synchronisation';
import { objectifActif, type DecisionSurVue, type VueMetier } from '../vue-metier';

// ST-US-001 §6.4 ; parent : ST-US-023 §6.2.
export type CommandeCreerObjectif = {
  readonly id: IdObjectif;
  readonly intitule: string;
  readonly description?: string;
  readonly delai?: DateCalendaire;
  readonly parentId?: IdObjectif;
};

/** Le parent d'un sous-objectif doit être actif et principal (RG-022 : un seul niveau). */
const verifierParent = (vue: VueMetier, parentId: IdObjectif): Resultat<null, RefusMetier> => {
  const parent = objectifActif(vue, parentId);
  if (!parent.ok) return parent;
  return estObjectifPrincipal(parent.valeur)
    ? succes(null)
    : echec({ type: 'ActionNonDisponible', action: 'CREER_SOUS_OBJECTIF' });
};

const evenementCreation = (c: CommandeCreerObjectif): EvenementACreer => ({
  type: 'CREATION',
  element: { type: 'OBJECTIF', id: c.id },
  avant: {},
  apres: {
    ...(c.parentId === undefined ? {} : { parentId: c.parentId }),
    ...(c.delai === undefined ? {} : { delai: c.delai }),
  },
  rang: 0,
});

const creationObjectif = (
  commande: CommandeCreerObjectif,
  intitule: string,
  contexte: ContexteDecision,
): Decision<IdObjectif> => {
  const { id, delai, parentId } = commande;
  const description = normaliserDescription(commande.description);
  return {
    modifications: [
      {
        type: 'CREER_OBJECTIF',
        id,
        creeLe: contexte.instant,
        valeurs: {
          intitule,
          ...(description === undefined ? {} : { description }),
          ...(delai === undefined ? {} : { delai }),
          ...(parentId === undefined ? {} : { parentId }),
        },
        evenement: evenementCreation(commande),
      },
    ],
    valeur: id,
  };
};

export const deciderCreationObjectif =
  (commande: CommandeCreerObjectif): DecisionSurVue<IdObjectif> =>
  (vue, contexte) => {
    if (commande.parentId !== undefined) {
      const parent = verifierParent(vue, commande.parentId);
      if (!parent.ok) return parent;
    }
    const intitule = construireIntitule(commande.intitule);
    if (!intitule.ok) return echec({ type: 'SaisieInvalide', defauts: ['INTITULE_VIDE'] });
    return succes(creationObjectif(commande, intitule.valeur, contexte));
  };
