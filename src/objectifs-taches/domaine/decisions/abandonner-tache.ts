import type { IdTache } from '../../../commun/domaine/identifiants';
import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import { idEvenement, type ContexteDecision, type Modification } from '../../../synchronisation';
import { etatJournalDe } from '../etat-journal';
import type { RefusMetier } from '../refus';
import {
  sousTachesParCreation,
  tacheActive,
  type DecisionSurVue,
  type EvaluationSurVue,
  type Tache,
  type VueMetier,
} from '../vue-metier';

// ST-US-025 §6.1 (RG-027).

/** Contrôles 1 et 2 : tâche active et à faire (une tâche terminée ou abandonnée n'a pas l'action). */
const controler = (
  c: { readonly tacheId: IdTache },
  vue: VueMetier,
): Resultat<Tache, RefusMetier> => {
  const tache = tacheActive(vue, c.tacheId);
  if (!tache.ok) return tache;
  return tache.valeur.cycleDeVie.etat === 'A_FAIRE'
    ? tache
    : echec({ type: 'ActionNonDisponible', action: 'ABANDONNER' });
};

/** ABANDONNER est proposée (ST-US-025 §6.3) si les contrôles 1 et 2 passent. */
export const abandonnable = (vue: VueMetier, tacheId: IdTache): boolean =>
  controler({ tacheId }, vue).ok;

const sousTachesAFaire = (vue: VueMetier, tache: Tache): ReadonlyArray<Tache> =>
  sousTachesParCreation(vue, tache.id).filter((s) => s.cycleDeVie.etat === 'A_FAIRE');

export const evaluerAbandon =
  (c: { readonly tacheId: IdTache }): EvaluationSurVue =>
  (vue) => {
    const tache = controler(c, vue);
    if (!tache.ok) return tache;
    return succes({
      type: 'CONFIRMATION_REQUISE',
      confirmation: {
        type: 'ABANDON_TACHE',
        tacheId: tache.valeur.id,
        intitule: tache.valeur.intitule,
        sousTachesAbandonnees: sousTachesAFaire(vue, tache.valeur).length,
      },
    });
  };

const abandon = (tache: Tache, contexte: ContexteDecision, rang: number): Modification => {
  const dateAbandon = contexte.jour;
  const cascade = rang === 0 ? {} : { abandonParCascade: idEvenement(contexte.operation, 0) };
  return {
    type: 'ECRIRE_TACHE',
    id: tache.id,
    ecriture: {
      champ: 'cycleDeVie',
      valeur: {
        etat: 'ABANDONNEE',
        dateAbandon,
        instantAbandon: contexte.instant,
        evenementAbandon: idEvenement(contexte.operation, rang),
        ...cascade,
      },
    },
    evenement: {
      type: 'ABANDON',
      element: { type: 'TACHE', id: tache.id },
      avant: etatJournalDe(tache.cycleDeVie),
      apres: { etat: 'ABANDONNEE', dateAbandon },
      rang,
      ...(rang === 0 ? {} : { cause: 0 }),
    },
  };
};

/** La tâche (rang 0), puis ses sous-tâches à faire (rang 1, 2…, cause 0) : une seule décision (DAT §6.1 c). */
export const deciderAbandon =
  (c: { readonly tacheId: IdTache }): DecisionSurVue<void> =>
  (vue, contexte) => {
    const tache = controler(c, vue);
    if (!tache.ok) return tache;
    const cascade = sousTachesAFaire(vue, tache.valeur).map((sousTache, k) =>
      abandon(sousTache, contexte, k + 1),
    );
    return succes({
      modifications: [abandon(tache.valeur, contexte, 0), ...cascade],
      valeur: undefined,
    });
  };
