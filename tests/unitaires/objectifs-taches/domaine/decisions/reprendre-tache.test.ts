import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import {
  deciderReprise,
  evaluerReprise,
} from '@src/objectifs-taches/domaine/decisions/reprendre-tache';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { abandonnee, etatMetier, terminee } from '@tests/support/fabriques/etat-metier';
import { contexteDecision } from '@tests/support/horloge';
import { date, idTache } from '@tests/support/valeurs';

const CHAPITRE = idTache(1);
const SECTION_A = idTache(2);
const SECTION_B = idTache(3);
const SECTION_C = idTache(4);
const A_FAIRE = idTache(5);
const SUPPRIMEE = idTache(6);
const contexte = contexteDecision('2026-10-21T08:00:00.000Z', '2026-10-21');
const vue = () =>
  construireVueMetier(
    etatMetier()
      .avecTache({
        id: CHAPITRE,
        intitule: 'Chapitre 1',
        cycleDeVie: abandonnee('2026-10-19', 'opA:0'),
      })
      .avecTache({
        id: SECTION_A,
        intitule: 'Section A',
        tacheParenteId: CHAPITRE,
        cycleDeVie: terminee('2026-10-15'),
      })
      .avecTache({
        id: SECTION_B,
        intitule: 'Section B',
        tacheParenteId: CHAPITRE,
        cycleDeVie: abandonnee('2026-10-19', 'opA:1', { abandonParCascade: 'opA:0' }),
      })
      .avecTache({
        id: SECTION_C,
        intitule: 'Section C',
        tacheParenteId: CHAPITRE,
        cycleDeVie: abandonnee('2026-10-17', 'opC:0'),
      })
      .avecTache({ id: A_FAIRE })
      .avecTache({ id: SUPPRIMEE, cycleDeVie: abandonnee('2026-10-18', 'opS:0'), supprime: true })
      .construire(),
  );
const reprise = (id: typeof CHAPITRE, dateAbandon: string, rang: number, cause?: number) => ({
  type: 'ECRIRE_TACHE',
  id,
  ecriture: { champ: 'cycleDeVie', valeur: { etat: 'A_FAIRE' } },
  evenement: {
    type: 'REPRISE',
    element: { type: 'TACHE', id },
    avant: { etat: 'ABANDONNEE', dateAbandon: date(dateAbandon) },
    apres: { etat: 'A_FAIRE' },
    rang,
    ...(cause === undefined ? {} : { cause }),
  },
});

describe('Reprise d’une tâche (RG-027)', () => {
  it('UT-US-025-07 evaluerReprise — sans confirmation pour une tâche abandonnée ; ActionNonDisponible à faire ; ElementIntrouvable supprimée (US-025 CA-5)', () => {
    expect(evaluerReprise({ tacheId: CHAPITRE })(vue())).toEqual(
      succes({ type: 'SANS_CONFIRMATION' }),
    );
    expect(evaluerReprise({ tacheId: A_FAIRE })(vue())).toEqual(
      echec({ type: 'ActionNonDisponible', action: 'REPRENDRE' }),
    );
    expect(evaluerReprise({ tacheId: SUPPRIMEE })(vue())).toEqual(
      echec({ type: 'ElementIntrouvable', element: { type: 'TACHE', id: SUPPRIMEE } }),
    );
  });

  it('UT-US-025-08 evaluerReprise — refuse ActionNonDisponible pour la sous-tâche d’une tâche abandonnée (US-025 CA-8)', () => {
    expect(evaluerReprise({ tacheId: SECTION_B })(vue())).toEqual(
      echec({ type: 'ActionNonDisponible', action: 'REPRENDRE' }),
    );
  });

  it('UT-US-025-09 deciderReprise — reprend B, abandonnée avec la tâche, mais ni C, abandonnée avant, ni A, terminée ; REPRISE causée par la reprise de la tâche (US-025 CA-7, S11)', () => {
    expect(deciderReprise({ tacheId: CHAPITRE })(vue(), contexte)).toEqual(
      succes({
        modifications: [reprise(CHAPITRE, '2026-10-19', 0), reprise(SECTION_B, '2026-10-19', 1, 0)],
        valeur: undefined,
      }),
    );
  });
});
