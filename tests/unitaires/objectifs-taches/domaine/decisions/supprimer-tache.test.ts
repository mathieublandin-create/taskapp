import { describe, expect, it } from 'vitest';
import { succes } from '@src/commun/domaine/resultat';
import {
  deciderSuppressionTache,
  evaluerSuppressionTache,
} from '@src/objectifs-taches/domaine/decisions/supprimer-tache';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { abandonnee, etatMetier } from '@tests/support/fabriques/etat-metier';
import { contexteDecision } from '@tests/support/horloge';
import { duree, idTache } from '@tests/support/valeurs';

const t = (n: number) => idTache(n);
const contexte = contexteDecision('2026-10-21T08:00:00.000Z', '2026-10-21');
const suppression = (id: ReturnType<typeof t>) => ({
  type: 'SUPPRIMER',
  element: { type: 'TACHE', id },
  evenement: { type: 'SUPPRESSION', element: { type: 'TACHE', id }, avant: {}, apres: {}, rang: 0 },
});
const recopie = (parente: ReturnType<typeof t>, minutes: number) => ({
  type: 'ECRIRE_TACHE',
  id: parente,
  ecriture: { champ: 'estimationInitiale', valeur: duree(minutes) },
  evenement: {
    type: 'MODIFICATION_ESTIMATION',
    element: { type: 'TACHE', id: parente },
    avant: { estimation: duree(minutes) },
    apres: { estimation: duree(minutes) },
    rang: 1,
    cause: 0,
  },
});

describe('Suppression d’une tâche (US-002 CA-12, RG-046 ; US-024 CA-9, H-3)', () => {
  it('UT-US-002-12 evaluerSuppressionTache — annonce 2 sous-tâches supprimées avec la tâche, ou 0 (US-002 CA-12)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecTache({ id: t(1), intitule: 'Chapitre 1' })
        .avecTache({ id: t(2), tacheParenteId: t(1) })
        .avecTache({ id: t(3), tacheParenteId: t(1) })
        .avecTache({ id: t(4), intitule: 'Payer la facture' })
        .construire(),
    );

    expect(evaluerSuppressionTache({ tacheId: t(1) })(vue)).toEqual(
      succes({
        type: 'CONFIRMATION_REQUISE',
        confirmation: {
          type: 'SUPPRESSION_TACHE',
          tacheId: t(1),
          intitule: 'Chapitre 1',
          sousTaches: 2,
        },
      }),
    );
    expect(evaluerSuppressionTache({ tacheId: t(4) })(vue)).toEqual(
      succes({
        type: 'CONFIRMATION_REQUISE',
        confirmation: {
          type: 'SUPPRESSION_TACHE',
          tacheId: t(4),
          intitule: 'Payer la facture',
          sousTaches: 0,
        },
      }),
    );
  });

  it('UT-US-002-13 deciderSuppressionTache — produit une seule modification SUPPRIMER et l’événement SUPPRESSION, sans écrire les sous-tâches (RG-046)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecTache({ id: t(1) })
        .avecTache({ id: t(2), tacheParenteId: t(1) })
        .avecTache({ id: t(3), tacheParenteId: t(1) })
        .construire(),
    );

    expect(deciderSuppressionTache({ tacheId: t(1) })(vue, contexte)).toEqual(
      succes({ modifications: [suppression(t(1))], valeur: undefined }),
    );
  });

  it('UT-US-024-10 deciderSuppressionTache — recopie 1 h 30 dans la tâche parente à la suppression de sa dernière sous-tâche, avec MODIFICATION_ESTIMATION causée par la suppression (H-3, S10)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecTache({ id: t(1), estimationMinutes: 180 })
        .avecTache({ id: t(2), tacheParenteId: t(1), estimationMinutes: 90 })
        .construire(),
    );

    expect(deciderSuppressionTache({ tacheId: t(2) })(vue, contexte)).toEqual(
      succes({ modifications: [suppression(t(2)), recopie(t(1), 90)], valeur: undefined }),
    );
  });

  it('UT-US-024-11 deciderSuppressionTache — recopie 0 h quand la dernière sous-tâche est abandonnée (Q-US-024-2 a, S10b)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecTache({ id: t(1), estimationMinutes: 180 })
        .avecTache({
          id: t(2),
          tacheParenteId: t(1),
          estimationMinutes: 90,
          cycleDeVie: abandonnee('2026-10-20', 'op:0'),
        })
        .construire(),
    );

    expect(deciderSuppressionTache({ tacheId: t(2) })(vue, contexte)).toEqual(
      succes({ modifications: [suppression(t(2)), recopie(t(1), 0)], valeur: undefined }),
    );
  });

  it('UT-US-024-12 deciderSuppressionTache — ne recopie rien quand la sous-tâche supprimée n’est pas la dernière (US-024 CA-9)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecTache({ id: t(1), estimationMinutes: 180 })
        .avecTache({ id: t(2), tacheParenteId: t(1), estimationMinutes: 90 })
        .avecTache({ id: t(3), tacheParenteId: t(1), estimationMinutes: 60 })
        .construire(),
    );

    expect(deciderSuppressionTache({ tacheId: t(2) })(vue, contexte)).toEqual(
      succes({ modifications: [suppression(t(2))], valeur: undefined }),
    );
  });
});
