import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { deciderCreationTache } from '@src/objectifs-taches/domaine/decisions/creer-tache';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { etatMetier } from '@tests/support/fabriques/etat-metier';
import { contexteDecision } from '@tests/support/horloge';
import { date, duree, idObjectif, idTache, instant } from '@tests/support/valeurs';

const T = idTache(1);
const O1 = idObjectif(1);
const O2 = idObjectif(2);
const SUPPRIME = idObjectif(3);
const MAINTENANT = '2026-10-21T08:00:00.000Z';
const contexte = contexteDecision(MAINTENANT, '2026-10-21');
const vue = () =>
  construireVueMetier(
    etatMetier()
      .avecObjectif({ id: O1 })
      .avecObjectif({ id: O2 })
      .avecObjectif({ id: SUPPRIME, supprime: true })
      .construire(),
  );
const saisie = {
  intitule: ' Rédiger l’interview ',
  delai: date('2026-11-30'),
  estimationMinutes: 60,
};

const creationAttendue = (objectifIds: ReadonlyArray<typeof O1>) =>
  succes({
    modifications: [
      {
        type: 'CREER_TACHE',
        id: T,
        creeLe: instant(MAINTENANT),
        valeurs: {
          intitule: 'Rédiger l’interview',
          delai: date('2026-11-30'),
          estimationInitiale: duree(60),
          objectifIds,
        },
        evenement: {
          type: 'CREATION',
          element: { type: 'TACHE', id: T },
          avant: {},
          apres: { delai: date('2026-11-30'), estimation: duree(60), objectifIds },
          rang: 0,
        },
      },
    ],
    valeur: T,
  });

describe('deciderCreationTache (US-002 CA-1, RG-001)', () => {
  it('UT-US-002-04 deciderCreationTache — produit CREER_TACHE et l’événement CREATION avec les objectifs dans l’ordre saisi (US-002 CA-1, CA-14)', () => {
    expect(deciderCreationTache({ id: T, saisie, objectifIds: [O2, O1] })(vue(), contexte)).toEqual(
      creationAttendue([O2, O1]),
    );
  });

  it('UT-US-002-05 deciderCreationTache — refuse un objectif supprimé et retire un objectif en double en gardant le premier rang (RG-001)', () => {
    expect(
      deciderCreationTache({ id: T, saisie, objectifIds: [O1, SUPPRIME] })(vue(), contexte),
    ).toEqual(echec({ type: 'ElementIntrouvable', element: { type: 'OBJECTIF', id: SUPPRIME } }));
    expect(
      deciderCreationTache({ id: T, saisie, objectifIds: [O1, O2, O1] })(vue(), contexte),
    ).toEqual(creationAttendue([O1, O2]));
  });
});
