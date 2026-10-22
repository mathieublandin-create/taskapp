import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import {
  deciderDetachement,
  deciderRattachement,
} from '@src/objectifs-taches/domaine/decisions/rattacher-tache';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { etatMetier } from '@tests/support/fabriques/etat-metier';
import { contexteDecision } from '@tests/support/horloge';
import { idObjectif, idTache } from '@tests/support/valeurs';

const T = idTache(1);
const SOUS_TACHE = idTache(2);
const O1 = idObjectif(1);
const O2 = idObjectif(2);
const contexte = contexteDecision('2026-10-21T08:00:00.000Z', '2026-10-21');
const vue = () =>
  construireVueMetier(
    etatMetier()
      .avecObjectif({ id: O1 })
      .avecObjectif({ id: O2 })
      .avecTache({ id: T, objectifs: [O1] })
      .avecTache({ id: SOUS_TACHE, tacheParenteId: T })
      .construire(),
  );
const aucuneModification = succes({ modifications: [], valeur: undefined });

describe('Rattachement d’une tâche (RG-001, H-1)', () => {
  it('UT-US-002-10 deciderRattachement — active le lien avec RATTACHEMENT ; rien si déjà rattachée ; ObjectifsHerites pour une sous-tâche (US-024 CA-7)', () => {
    expect(deciderRattachement({ tacheId: T, objectifId: O2 })(vue(), contexte)).toEqual(
      succes({
        modifications: [
          {
            type: 'ECRIRE_LIEN',
            tacheId: T,
            objectifId: O2,
            actif: true,
            evenement: {
              type: 'RATTACHEMENT',
              element: { type: 'TACHE', id: T },
              avant: {},
              apres: { objectifId: O2 },
              rang: 0,
            },
          },
        ],
        valeur: undefined,
      }),
    );
    expect(deciderRattachement({ tacheId: T, objectifId: O1 })(vue(), contexte)).toEqual(
      aucuneModification,
    );
    expect(deciderRattachement({ tacheId: SOUS_TACHE, objectifId: O2 })(vue(), contexte)).toEqual(
      echec({ type: 'ObjectifsHerites' }),
    );
  });

  it('UT-US-002-11 deciderDetachement — désactive le lien avec DETACHEMENT ; rien si non rattachée ; ObjectifsHerites pour une sous-tâche (RG-001)', () => {
    expect(deciderDetachement({ tacheId: T, objectifId: O1 })(vue(), contexte)).toEqual(
      succes({
        modifications: [
          {
            type: 'ECRIRE_LIEN',
            tacheId: T,
            objectifId: O1,
            actif: false,
            evenement: {
              type: 'DETACHEMENT',
              element: { type: 'TACHE', id: T },
              avant: { objectifId: O1 },
              apres: {},
              rang: 0,
            },
          },
        ],
        valeur: undefined,
      }),
    );
    expect(deciderDetachement({ tacheId: T, objectifId: O2 })(vue(), contexte)).toEqual(
      aucuneModification,
    );
    expect(deciderDetachement({ tacheId: SOUS_TACHE, objectifId: O1 })(vue(), contexte)).toEqual(
      echec({ type: 'ObjectifsHerites' }),
    );
  });
});
