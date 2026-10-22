import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import {
  deciderModificationDelaiObjectif,
  deciderRenommageObjectif,
} from '@src/objectifs-taches/domaine/decisions/modifier-objectif';
import {
  deciderSuppressionObjectif,
  evaluerSuppressionObjectif,
} from '@src/objectifs-taches/domaine/decisions/supprimer-objectif';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { etatMetier, terminee } from '@tests/support/fabriques/etat-metier';
import { contexteDecision } from '@tests/support/horloge';
import { date, idObjectif, idTache } from '@tests/support/valeurs';

const O = idObjectif(1);
const SO = idObjectif(2);
const SUPPRIME = idObjectif(3);
const contexte = contexteDecision('2026-10-21T08:00:00.000Z', '2026-10-21');
const vue = () =>
  construireVueMetier(
    etatMetier()
      .avecObjectif({ id: O, intitule: 'Publier le guide' })
      .avecObjectif({ id: SO, parentIdEnregistre: O })
      .avecObjectif({ id: SUPPRIME, supprime: true })
      .avecTache({ id: idTache(1), objectifs: [O] })
      .avecTache({ id: idTache(2), objectifs: [O] })
      .avecTache({ id: idTache(3), objectifs: [O], cycleDeVie: terminee('2026-10-20') })
      .construire(),
  );

describe('Suppression d’un objectif (US-001 CA-9, RG-046)', () => {
  it('UT-US-001-21 evaluerSuppressionObjectif — demande une confirmation qui annonce 3 tâches détachées et 1 sous-objectif promu', () => {
    expect(evaluerSuppressionObjectif({ objectifId: O })(vue())).toEqual(
      succes({
        type: 'CONFIRMATION_REQUISE',
        confirmation: {
          type: 'SUPPRESSION_OBJECTIF',
          objectifId: O,
          intitule: 'Publier le guide',
          tachesDetachees: 3,
          sousObjectifsPromus: 1,
        },
      }),
    );
  });

  it('UT-US-001-22 deciderSuppressionObjectif — produit une seule modification SUPPRIMER et l’événement SUPPRESSION, sans écrire les liens ni les parents (RG-046, S22)', () => {
    expect(deciderSuppressionObjectif({ objectifId: O })(vue(), contexte)).toEqual(
      succes({
        modifications: [
          {
            type: 'SUPPRIMER',
            element: { type: 'OBJECTIF', id: O },
            evenement: {
              type: 'SUPPRESSION',
              element: { type: 'OBJECTIF', id: O },
              avant: {},
              apres: {},
              rang: 0,
            },
          },
        ],
        valeur: undefined,
      }),
    );
  });

  it('UT-US-001-23 décisions sur un objectif supprimé — renvoient ElementIntrouvable', () => {
    const introuvable = echec({
      type: 'ElementIntrouvable',
      element: { type: 'OBJECTIF', id: SUPPRIME },
    });

    expect(
      deciderRenommageObjectif({ objectifId: SUPPRIME, intitule: 'X' })(vue(), contexte),
    ).toEqual(introuvable);
    expect(
      deciderModificationDelaiObjectif({ objectifId: SUPPRIME, delai: date('2027-01-31') })(
        vue(),
        contexte,
      ),
    ).toEqual(introuvable);
    expect(evaluerSuppressionObjectif({ objectifId: SUPPRIME })(vue())).toEqual(introuvable);
    expect(deciderSuppressionObjectif({ objectifId: SUPPRIME })(vue(), contexte)).toEqual(
      introuvable,
    );
  });
});
