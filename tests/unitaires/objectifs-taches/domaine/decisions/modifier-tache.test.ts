import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import {
  deciderModificationDelaiTache,
  deciderModificationEstimation,
} from '@src/objectifs-taches/domaine/decisions/modifier-tache';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { etatMetier } from '@tests/support/fabriques/etat-metier';
import { contexteDecision } from '@tests/support/horloge';
import { date, duree, idTache } from '@tests/support/valeurs';

const T = idTache(1);
const PARENTE = idTache(2);
const contexte = contexteDecision('2026-10-21T08:00:00.000Z', '2026-10-21');
const vue = () =>
  construireVueMetier(
    etatMetier()
      .avecTache({ id: T, delai: '2026-11-30', estimationMinutes: 120 })
      .avecTache({ id: PARENTE, estimationMinutes: 120 })
      .avecTache({ id: idTache(3), tacheParenteId: PARENTE, estimationMinutes: 60 })
      .construire(),
  );
const aucuneModification = succes({ modifications: [], valeur: undefined });

describe('Modification d’une tâche (US-002 CA-8, CA-9)', () => {
  it('UT-US-002-06 deciderModificationDelaiTache — écrit le délai avec MODIFICATION_DELAI ; rien pour le même délai (US-002 CA-8, CA-14)', () => {
    expect(
      deciderModificationDelaiTache({ tacheId: T, delai: date('2026-12-15') })(vue(), contexte),
    ).toEqual(
      succes({
        modifications: [
          {
            type: 'ECRIRE_TACHE',
            id: T,
            ecriture: { champ: 'delai', valeur: date('2026-12-15') },
            evenement: {
              type: 'MODIFICATION_DELAI',
              element: { type: 'TACHE', id: T },
              avant: { delai: date('2026-11-30') },
              apres: { delai: date('2026-12-15') },
              rang: 0,
            },
          },
        ],
        valeur: undefined,
      }),
    );
    expect(
      deciderModificationDelaiTache({ tacheId: T, delai: date('2026-11-30') })(vue(), contexte),
    ).toEqual(aucuneModification);
  });

  it('UT-US-002-07 deciderModificationEstimation — écrit l’estimation avec MODIFICATION_ESTIMATION avant 2 h après 3 h ; rien pour la même valeur (US-002 CA-9)', () => {
    expect(
      deciderModificationEstimation({ tacheId: T, estimationMinutes: 180 })(vue(), contexte),
    ).toEqual(
      succes({
        modifications: [
          {
            type: 'ECRIRE_TACHE',
            id: T,
            ecriture: { champ: 'estimationInitiale', valeur: duree(180) },
            evenement: {
              type: 'MODIFICATION_ESTIMATION',
              element: { type: 'TACHE', id: T },
              avant: { estimation: duree(120) },
              apres: { estimation: duree(180) },
              rang: 0,
            },
          },
        ],
        valeur: undefined,
      }),
    );
    expect(
      deciderModificationEstimation({ tacheId: T, estimationMinutes: 120 })(vue(), contexte),
    ).toEqual(aucuneModification);
  });

  it('UT-US-002-08 deciderModificationEstimation — refuse EstimationCalculee pour une tâche qui a une sous-tâche, avant tout contrôle de la valeur (RG-023)', () => {
    expect(
      deciderModificationEstimation({ tacheId: PARENTE, estimationMinutes: 180 })(vue(), contexte),
    ).toEqual(echec({ type: 'EstimationCalculee' }));
    expect(
      deciderModificationEstimation({ tacheId: PARENTE, estimationMinutes: 45 })(vue(), contexte),
    ).toEqual(echec({ type: 'EstimationCalculee' }));
  });

  it('UT-US-002-09 deciderModificationEstimation — refuse 0 h sur une tâche simple (RG-028)', () => {
    expect(
      deciderModificationEstimation({ tacheId: T, estimationMinutes: 0 })(vue(), contexte),
    ).toEqual(echec({ type: 'SaisieInvalide', defauts: ['ESTIMATION_INVALIDE'] }));
  });
});
