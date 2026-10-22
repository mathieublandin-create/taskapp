import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import {
  deciderCreationSousTache,
  evaluerCreationSousTache,
} from '@src/objectifs-taches/domaine/decisions/creer-sous-tache';
import type { SaisieTache } from '@src/objectifs-taches/domaine/saisie-tache';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { abandonnee, etatMetier, terminee } from '@tests/support/fabriques/etat-metier';
import { contexteDecision } from '@tests/support/horloge';
import { date, duree, idTache, instant } from '@tests/support/valeurs';

const A_FAIRE = idTache(1);
const TERMINEE = idTache(2);
const ABANDONNEE = idTache(3);
const SOUS_TACHE = idTache(4);
const NOUVELLE = idTache(10);
const MAINTENANT = '2026-10-21T08:00:00.000Z';
const contexte = contexteDecision(MAINTENANT, '2026-10-21');
const saisie: SaisieTache = {
  intitule: 'Section A',
  delai: date('2026-11-20'),
  estimationMinutes: 60,
};
const vue = () =>
  construireVueMetier(
    etatMetier()
      .avecTache({ id: A_FAIRE, intitule: 'Chapitre 1' })
      .avecTache({ id: TERMINEE, intitule: 'Chapitre 2', cycleDeVie: terminee('2026-10-18') })
      .avecTache({
        id: ABANDONNEE,
        intitule: 'Chapitre 3',
        cycleDeVie: abandonnee('2026-10-19', 'op:0'),
      })
      .avecTache({ id: SOUS_TACHE, intitule: 'Section existante', tacheParenteId: A_FAIRE })
      .construire(),
  );
const commande = (tacheParenteId: typeof A_FAIRE, s: SaisieTache = saisie) => ({
  id: NOUVELLE,
  tacheParenteId,
  saisie: s,
});

const creation = (tacheParenteId: typeof A_FAIRE) => ({
  type: 'CREER_TACHE',
  id: NOUVELLE,
  creeLe: instant(MAINTENANT),
  valeurs: {
    intitule: 'Section A',
    delai: date('2026-11-20'),
    estimationInitiale: duree(60),
    tacheParenteId,
    objectifIds: [],
  },
  evenement: {
    type: 'CREATION',
    element: { type: 'TACHE', id: NOUVELLE },
    avant: {},
    apres: { tacheParenteId, delai: date('2026-11-20'), estimation: duree(60), objectifIds: [] },
    rang: 0,
  },
});

describe('Création d’une sous-tâche (RG-023, US-024 CA-1, CA-2)', () => {
  it('UT-US-024-01 evaluerCreationSousTache — ne demande pas de confirmation sous une tâche à faire avec une saisie valide (US-024 CA-1)', () => {
    expect(evaluerCreationSousTache(commande(A_FAIRE))(vue())).toEqual(
      succes({ type: 'SANS_CONFIRMATION' }),
    );
  });

  it('UT-US-024-02 evaluerCreationSousTache — demande la confirmation AJOUT_SOUS_TACHE_TERMINEE sous une tâche terminée (S17)', () => {
    expect(evaluerCreationSousTache(commande(TERMINEE))(vue())).toEqual(
      succes({
        type: 'CONFIRMATION_REQUISE',
        confirmation: {
          type: 'AJOUT_SOUS_TACHE_TERMINEE',
          tacheParenteId: TERMINEE,
          intitule: 'Chapitre 2',
        },
      }),
    );
  });

  it('UT-US-024-03 evaluerCreationSousTache — refuse AjoutSousTacheATacheAbandonnee sous une tâche abandonnée, avant le contrôle de la saisie (S18)', () => {
    expect(evaluerCreationSousTache(commande(ABANDONNEE, { intitule: '' }))(vue())).toEqual(
      echec({ type: 'AjoutSousTacheATacheAbandonnee' }),
    );
  });

  it('UT-US-024-04 evaluerCreationSousTache — refuse ActionNonDisponible sous une sous-tâche (un seul niveau, US-024 CA-1)', () => {
    expect(evaluerCreationSousTache(commande(SOUS_TACHE))(vue())).toEqual(
      echec({ type: 'ActionNonDisponible', action: 'CREER_SOUS_TACHE' }),
    );
  });

  it.each([
    [{ intitule: 'Section A', estimationMinutes: 60 }, 'DELAI_ABSENT'],
    [{ intitule: 'Section A', delai: date('2026-11-20') }, 'ESTIMATION_ABSENTE'],
    [
      { intitule: 'Section A', delai: date('2026-11-20'), estimationMinutes: 0 },
      'ESTIMATION_INVALIDE',
    ],
    [
      { intitule: 'Section A', delai: date('2026-11-20'), estimationMinutes: 45 },
      'ESTIMATION_INVALIDE',
    ],
  ])(
    'UT-US-024-05 evaluerCreationSousTache — refuse la saisie %j avec le défaut %s (S03)',
    (s, defaut) => {
      expect(evaluerCreationSousTache(commande(A_FAIRE, s))(vue())).toEqual(
        echec({ type: 'SaisieInvalide', defauts: [defaut] }),
      );
    },
  );

  it('UT-US-024-06 deciderCreationSousTache — produit CREER_TACHE avec tacheParenteId, sans objectif, et CREATION apres { tacheParenteId, delai, estimation, objectifIds: [] } (US-024 CA-1, CA-12)', () => {
    expect(deciderCreationSousTache(commande(A_FAIRE))(vue(), contexte)).toEqual(
      succes({ modifications: [creation(A_FAIRE)], valeur: NOUVELLE }),
    );
  });

  it('UT-US-024-07 deciderCreationSousTache — rouvre la tâche parente terminée, avec REOUVERTURE de rang 1 causée par la création (S17, RG-050 c)', () => {
    expect(deciderCreationSousTache(commande(TERMINEE))(vue(), contexte)).toEqual(
      succes({
        modifications: [
          creation(TERMINEE),
          {
            type: 'ECRIRE_TACHE',
            id: TERMINEE,
            ecriture: { champ: 'cycleDeVie', valeur: { etat: 'A_FAIRE' } },
            evenement: {
              type: 'REOUVERTURE',
              element: { type: 'TACHE', id: TERMINEE },
              avant: { etat: 'TERMINEE', dateFin: date('2026-10-18') },
              apres: { etat: 'A_FAIRE' },
              rang: 1,
              cause: 0,
            },
          },
        ],
        valeur: NOUVELLE,
      }),
    );
  });
});
