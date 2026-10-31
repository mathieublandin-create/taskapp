import type { IdTache } from '../../../commun/domaine/identifiants';
import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import type { Instant } from '../../../commun/domaine/temps/instant';
import type { Modification } from '../../../synchronisation';
import type { Evaluation } from '../confirmation';
import type { RefusMetier } from '../refus';
import { validerSaisieTache, type SaisieTache, type SaisieTacheValide } from '../saisie-tache';
import {
  tacheActive,
  type DecisionSurVue,
  type EvaluationSurVue,
  type Tache,
  type VueMetier,
} from '../vue-metier';

// ST-US-024 §6.1 (RG-023).
export type CommandeCreerSousTache = {
  readonly id: IdTache;
  readonly tacheParenteId: IdTache;
  readonly saisie: SaisieTache;
};

/** L'évaluation n'écrit rien : elle n'a pas besoin de l'identifiant de la future sous-tâche. */
type CommandeEvaluee = Pick<CommandeCreerSousTache, 'tacheParenteId' | 'saisie'>;

/** Contrôles 1 à 4 : la tâche parente accepte une sous-tâche et la saisie est valide. */
const controler = (
  c: CommandeEvaluee,
  vue: VueMetier,
): Resultat<{ readonly parente: Tache; readonly saisie: SaisieTacheValide }, RefusMetier> => {
  const parente = tacheActive(vue, c.tacheParenteId);
  if (!parente.ok) return parente;
  if (parente.valeur.tacheParenteId !== undefined) {
    return echec({ type: 'ActionNonDisponible', action: 'CREER_SOUS_TACHE' });
  }
  if (parente.valeur.cycleDeVie.etat === 'ABANDONNEE') {
    return echec({ type: 'AjoutSousTacheATacheAbandonnee' });
  }
  const saisie = validerSaisieTache(c.saisie);
  if (!saisie.ok) return saisie;
  return succes({ parente: parente.valeur, saisie: saisie.valeur });
};

const confirmationOuNon = (parente: Tache): Evaluation =>
  parente.cycleDeVie.etat === 'TERMINEE'
    ? {
        type: 'CONFIRMATION_REQUISE',
        confirmation: {
          type: 'AJOUT_SOUS_TACHE_TERMINEE',
          tacheParenteId: parente.id,
          intitule: parente.intitule,
        },
      }
    : { type: 'SANS_CONFIRMATION' };

export const evaluerCreationSousTache =
  (c: CommandeEvaluee): EvaluationSurVue =>
  (vue) => {
    const controle = controler(c, vue);
    return controle.ok ? succes(confirmationOuNon(controle.valeur.parente)) : controle;
  };

const creationDeLaSousTache = (
  c: CommandeCreerSousTache,
  parente: Tache,
  { intitule, delai, estimation }: SaisieTacheValide,
  instant: Instant,
): Modification => ({
  type: 'CREER_TACHE',
  id: c.id,
  creeLe: instant,
  valeurs: {
    intitule,
    delai,
    estimationInitiale: estimation,
    tacheParenteId: parente.id,
    objectifIds: [],
  },
  evenement: {
    type: 'CREATION',
    element: { type: 'TACHE', id: c.id },
    avant: {},
    apres: { tacheParenteId: parente.id, delai, estimation, objectifIds: [] },
    rang: 0,
  },
});

/** Conséquence enregistrée (RG-050 c) : la tâche parente terminée est rouverte, événement de rang 1 causé par la création. */
const reouvertureDeLaParente = (parente: Tache): ReadonlyArray<Modification> => {
  const { cycleDeVie } = parente;
  if (cycleDeVie.etat !== 'TERMINEE') return [];
  const element = { type: 'TACHE', id: parente.id } as const;
  return [
    {
      type: 'ECRIRE_TACHE',
      id: parente.id,
      ecriture: { champ: 'cycleDeVie', valeur: { etat: 'A_FAIRE' } },
      evenement: {
        type: 'REOUVERTURE',
        element,
        avant: { etat: 'TERMINEE', dateFin: cycleDeVie.dateFin },
        apres: { etat: 'A_FAIRE' },
        rang: 1,
        cause: 0,
      },
    },
  ];
};

export const deciderCreationSousTache =
  (c: CommandeCreerSousTache): DecisionSurVue<IdTache> =>
  (vue, contexte) => {
    const controle = controler(c, vue);
    if (!controle.ok) return controle;
    const { parente, saisie } = controle.valeur;
    return succes({
      modifications: [
        creationDeLaSousTache(c, parente, saisie, contexte.instant),
        ...reouvertureDeLaParente(parente),
      ],
      valeur: c.id,
    });
  };
