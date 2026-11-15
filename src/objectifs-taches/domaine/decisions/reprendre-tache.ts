import type { IdTache } from '../../../commun/domaine/identifiants';
import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import type { CycleDeVie, Modification } from '../../../synchronisation';
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

// ST-US-025 §6.2 (RG-027 ; CA-13, DEC-032 pour une tâche parente terminée).
type TacheAbandonnee = Tache & { readonly cycleDeVie: Extract<CycleDeVie, { etat: 'ABANDONNEE' }> };
type TacheReprenable = { readonly tache: TacheAbandonnee; readonly parente?: Tache };

const estAbandonnee = (tache: Tache): tache is TacheAbandonnee =>
  tache.cycleDeVie.etat === 'ABANDONNEE';

/** Contrôles 1 à 3 : tâche abandonnée, et pas sous une tâche parente abandonnée (CA-8). */
const controler = (
  c: { readonly tacheId: IdTache },
  vue: VueMetier,
): Resultat<TacheReprenable, RefusMetier> => {
  const tache = tacheActive(vue, c.tacheId);
  if (!tache.ok) return tache;
  const refus = echec({ type: 'ActionNonDisponible', action: 'REPRENDRE' } as const);
  const abandonnee = tache.valeur;
  if (!estAbandonnee(abandonnee)) return refus;
  const { tacheParenteId } = abandonnee;
  if (tacheParenteId === undefined) return succes({ tache: abandonnee });
  const parente = tacheActive(vue, tacheParenteId);
  if (!parente.ok) return parente;
  if (parente.valeur.cycleDeVie.etat === 'ABANDONNEE') return refus;
  return succes({ tache: abandonnee, parente: parente.valeur });
};

/** REPRENDRE est proposée (ST-US-025 §6.3) si les contrôles 1 à 3 passent. */
export const reprenable = (vue: VueMetier, tacheId: IdTache): boolean =>
  controler({ tacheId }, vue).ok;

const parenteTerminee = (parente: Tache | undefined): Tache | undefined =>
  parente?.cycleDeVie.etat === 'TERMINEE' ? parente : undefined;

export const evaluerReprise =
  (c: { readonly tacheId: IdTache }): EvaluationSurVue =>
  (vue) => {
    const controle = controler(c, vue);
    if (!controle.ok) return controle;
    const { tache, parente } = controle.valeur;
    const terminee = parenteTerminee(parente);
    if (terminee === undefined) return succes({ type: 'SANS_CONFIRMATION' });
    return succes({
      type: 'CONFIRMATION_REQUISE',
      confirmation: {
        type: 'REPRISE_SOUS_TACHE',
        tacheId: tache.id,
        intitule: tache.intitule,
        tacheParenteId: terminee.id,
        intituleTacheParente: terminee.intitule,
      },
    });
  };

const retour = (
  tache: Tache,
  type: 'REPRISE' | 'REOUVERTURE',
  rang: number,
  cause?: number,
): Modification => ({
  type: 'ECRIRE_TACHE',
  id: tache.id,
  ecriture: { champ: 'cycleDeVie', valeur: { etat: 'A_FAIRE' } },
  evenement: {
    type,
    element: { type: 'TACHE', id: tache.id },
    avant: etatJournalDe(tache.cycleDeVie),
    apres: { etat: 'A_FAIRE' },
    rang,
    ...(cause === undefined ? {} : { cause }),
  },
});

/** Sous-tâches abandonnées avec la tâche : leur `abandonParCascade` désigne l'entrée ABANDON de celle-ci (CA-7). */
const abandonneesAvec = (vue: VueMetier, tache: TacheAbandonnee): ReadonlyArray<Tache> =>
  sousTachesParCreation(vue, tache.id).filter(
    (s) =>
      s.cycleDeVie.etat === 'ABANDONNEE' &&
      s.cycleDeVie.abandonParCascade === tache.cycleDeVie.evenementAbandon,
  );

export const deciderReprise =
  (c: { readonly tacheId: IdTache }): DecisionSurVue<void> =>
  (vue) => {
    const controle = controler(c, vue);
    if (!controle.ok) return controle;
    const { tache, parente } = controle.valeur;
    const cascade = abandonneesAvec(vue, tache).map((s, k) => retour(s, 'REPRISE', k + 1, 0));
    const terminee = parenteTerminee(parente);
    const reouverture = terminee === undefined ? [] : [retour(terminee, 'REOUVERTURE', 1, 0)];
    return succes({
      modifications: [retour(tache, 'REPRISE', 0), ...cascade, ...reouverture],
      valeur: undefined,
    });
  };
