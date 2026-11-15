import type { IdTache } from '../../../commun/domaine/identifiants';
import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import type { Modification } from '../../../synchronisation';
import { etatJournalDe } from '../etat-journal';
import type { RefusMetier } from '../refus';
import {
  tacheActive,
  type DecisionSurVue,
  type EvaluationSurVue,
  type Tache,
  type VueMetier,
} from '../vue-metier';

// ST-US-003 §6.2 (RG-026 ; RG-027 complétée par DEC-030).
type TacheRouvrable = { readonly tache: Tache; readonly parente?: Tache };

/** Contrôles 1 à 3 : tâche terminée, et pas sous une tâche parente abandonnée. */
const controler = (
  c: { readonly tacheId: IdTache },
  vue: VueMetier,
): Resultat<TacheRouvrable, RefusMetier> => {
  const tache = tacheActive(vue, c.tacheId);
  if (!tache.ok) return tache;
  const refus = echec({ type: 'ActionNonDisponible', action: 'ROUVRIR' } as const);
  if (tache.valeur.cycleDeVie.etat !== 'TERMINEE') return refus;
  const { tacheParenteId } = tache.valeur;
  if (tacheParenteId === undefined) return succes({ tache: tache.valeur });
  const parente = tacheActive(vue, tacheParenteId);
  if (!parente.ok) return parente;
  if (parente.valeur.cycleDeVie.etat === 'ABANDONNEE') return refus;
  return succes({ tache: tache.valeur, parente: parente.valeur });
};

/** ROUVRIR est proposée (ST-US-003 §6.3) si les contrôles 1 à 3 passent. */
export const reouvrable = (vue: VueMetier, tacheId: IdTache): boolean =>
  controler({ tacheId }, vue).ok;

export const evaluerReouverture =
  (c: { readonly tacheId: IdTache }): EvaluationSurVue =>
  (vue) => {
    const controle = controler(c, vue);
    if (!controle.ok) return controle;
    const { parente } = controle.valeur;
    if (parente?.cycleDeVie.etat !== 'TERMINEE') return succes({ type: 'SANS_CONFIRMATION' });
    return succes({
      type: 'CONFIRMATION_REQUISE',
      confirmation: {
        type: 'REOUVERTURE_SOUS_TACHE',
        tacheParenteId: parente.id,
        intitule: parente.intitule,
      },
    });
  };

const reouverture = (tache: Tache, rang: number, cause?: number): Modification => ({
  type: 'ECRIRE_TACHE',
  id: tache.id,
  ecriture: { champ: 'cycleDeVie', valeur: { etat: 'A_FAIRE' } },
  evenement: {
    type: 'REOUVERTURE',
    element: { type: 'TACHE', id: tache.id },
    avant: etatJournalDe(tache.cycleDeVie),
    apres: { etat: 'A_FAIRE' },
    rang,
    ...(cause === undefined ? {} : { cause }),
  },
});

export const deciderReouverture =
  (c: { readonly tacheId: IdTache }): DecisionSurVue<void> =>
  (vue) => {
    const controle = controler(c, vue);
    if (!controle.ok) return controle;
    const { tache, parente } = controle.valeur;
    const consequence = parente?.cycleDeVie.etat === 'TERMINEE' ? [reouverture(parente, 1, 0)] : [];
    return succes({ modifications: [reouverture(tache, 0), ...consequence], valeur: undefined });
  };
