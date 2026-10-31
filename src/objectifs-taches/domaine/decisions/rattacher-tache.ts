import type { IdObjectif, IdTache } from '../../../commun/domaine/identifiants';
import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import type { Decision, EvenementACreer } from '../../../synchronisation';
import type { RefusMetier } from '../refus';
import { objectifActif, tacheActive, type DecisionSurVue, type VueMetier } from '../vue-metier';

// ST-US-002 §6.2 (RG-001, H-1) : le lien est actif ou non ; une sous-tâche hérite des objectifs de sa tâche parente.
type Commande = { readonly tacheId: IdTache; readonly objectifId: IdObjectif };

const estRattachee = (vue: VueMetier, c: Commande): boolean =>
  vue.objectifsDirectsPar.get(c.tacheId)?.includes(c.objectifId) ?? false;

const deciderLien =
  (
    c: Commande,
    activer: boolean,
    evenement: (c: Commande) => EvenementACreer,
  ): DecisionSurVue<void> =>
  (vue): Resultat<Decision<void>, RefusMetier> => {
    const tache = tacheActive(vue, c.tacheId);
    if (!tache.ok) return tache;
    if (tache.valeur.tacheParenteId !== undefined) return echec({ type: 'ObjectifsHerites' });
    const objectif = objectifActif(vue, c.objectifId);
    if (!objectif.ok) return objectif;
    if (estRattachee(vue, c) === activer) return succes({ modifications: [], valeur: undefined });
    return succes({
      modifications: [
        {
          type: 'ECRIRE_LIEN',
          tacheId: c.tacheId,
          objectifId: c.objectifId,
          actif: activer,
          evenement: evenement(c),
        },
      ],
      valeur: undefined,
    });
  };

export const deciderRattachement = (c: Commande): DecisionSurVue<void> =>
  deciderLien(c, true, ({ tacheId, objectifId }) => ({
    type: 'RATTACHEMENT',
    element: { type: 'TACHE', id: tacheId },
    avant: {},
    apres: { objectifId },
    rang: 0,
  }));

export const deciderDetachement = (c: Commande): DecisionSurVue<void> =>
  deciderLien(c, false, ({ tacheId, objectifId }) => ({
    type: 'DETACHEMENT',
    element: { type: 'TACHE', id: tacheId },
    avant: { objectifId },
    apres: {},
    rang: 0,
  }));
