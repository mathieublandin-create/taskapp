import { describe, expect, it } from 'vitest';
import { succes } from '@src/commun/domaine/resultat';
import { deciderPlacementObjectif } from '@src/objectifs-taches/domaine/decisions/placer-objectif';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { etatMetier } from '@tests/support/fabriques/etat-metier';
import { contexteDecision } from '@tests/support/horloge';
import { idObjectif } from '@tests/support/valeurs';

const O = idObjectif(1);
const P = idObjectif(2);
const SO = idObjectif(3);
const contexte = contexteDecision('2026-10-21T08:00:00.000Z', '2026-10-21');
const vue = () =>
  construireVueMetier(
    etatMetier()
      .avecObjectif({ id: O })
      .avecObjectif({ id: P })
      .avecObjectif({ id: SO, parentIdEnregistre: P })
      .construire(),
  );

describe('deciderPlacementObjectif (RG-022, US-023 CA-5)', () => {
  it('UT-US-023-06 deciderPlacementObjectif — écrit le parent et l’événement CHANGEMENT_PARENT de rang 0 (US-023 CA-5, CA-11)', () => {
    expect(deciderPlacementObjectif({ objectifId: O, parentId: P })(vue(), contexte)).toEqual(
      succes({
        modifications: [
          {
            type: 'ECRIRE_OBJECTIF',
            id: O,
            ecriture: { champ: 'parent', parentId: P },
            evenement: { type: 'CHANGEMENT_PARENT', element: { type: 'OBJECTIF', id: O }, rang: 0 },
          },
        ],
        valeur: undefined,
      }),
    );
  });

  it('UT-US-023-07 deciderPlacementObjectif — rend un sous-objectif principal : parent absent et événement (US-023 CA-5)', () => {
    expect(deciderPlacementObjectif({ objectifId: SO })(vue(), contexte)).toEqual(
      succes({
        modifications: [
          {
            type: 'ECRIRE_OBJECTIF',
            id: SO,
            ecriture: { champ: 'parent', parentId: undefined },
            evenement: {
              type: 'CHANGEMENT_PARENT',
              element: { type: 'OBJECTIF', id: SO },
              rang: 0,
            },
          },
        ],
        valeur: undefined,
      }),
    );
  });

  it('UT-US-023-08 deciderPlacementObjectif — ne produit aucune modification quand le placement est sans effet (S12)', () => {
    expect(deciderPlacementObjectif({ objectifId: SO, parentId: P })(vue(), contexte)).toEqual(
      succes({ modifications: [], valeur: undefined }),
    );
  });
});
