import type { IdTache } from '../../../commun/domaine/identifiants';
import { echec, succes } from '../../../commun/domaine/resultat';
import type { ContexteDecision, Modification } from '../../../synchronisation';
import { sousTachesDe, tacheActive, type DecisionSurVue } from '../vue-metier';

const fin = (tacheId: IdTache, contexte: ContexteDecision): Modification => ({
  type: 'ECRIRE_TACHE',
  id: tacheId,
  ecriture: {
    champ: 'cycleDeVie',
    valeur: { etat: 'TERMINEE', dateFin: contexte.jour, instantFin: contexte.instant },
  },
  evenement: {
    type: 'FIN',
    element: { type: 'TACHE', id: tacheId },
    avant: { etat: 'A_FAIRE' },
    apres: { etat: 'TERMINEE', dateFin: contexte.jour },
    rang: 0,
  },
});

// ST-US-003 §6.1 (RG-026, RG-023) : aucune écriture sur la tâche parente ni sur les objectifs (atteinte dérivée).
export const deciderFinTache =
  (c: { readonly tacheId: IdTache }): DecisionSurVue<void> =>
  (vue, contexte) => {
    const tache = tacheActive(vue, c.tacheId);
    if (!tache.ok) return tache;
    if (tache.valeur.cycleDeVie.etat !== 'A_FAIRE') {
      return echec({ type: 'ActionNonDisponible', action: 'TERMINER' });
    }
    const restantes = sousTachesDe(vue, c.tacheId).filter((s) => s.cycleDeVie.etat === 'A_FAIRE');
    if (restantes.length > 0) {
      return echec({ type: 'SousTachesRestantes', nombre: restantes.length });
    }
    return succes({ modifications: [fin(c.tacheId, contexte)], valeur: undefined });
  };
