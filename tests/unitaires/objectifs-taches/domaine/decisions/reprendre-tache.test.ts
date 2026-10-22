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
const CHAPITRE_TERMINE = idTache(7);
const SECTION_D = idTache(8);
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
      .avecTache({
        id: CHAPITRE_TERMINE,
        intitule: 'Chapitre 2',
        cycleDeVie: terminee('2026-10-21'),
      })
      .avecTache({
        id: SECTION_D,
        intitule: 'Section D',
        tacheParenteId: CHAPITRE_TERMINE,
        cycleDeVie: abandonnee('2026-10-20', 'opD:0'),
      })
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

  it('UT-US-025-18 evaluerReprise — demande la confirmation REPRISE_SOUS_TACHE pour une sous-tâche abandonnée dont la tâche parente est terminée (CA-13, DEC-032)', () => {
    expect(evaluerReprise({ tacheId: SECTION_D })(vue())).toEqual(
      succes({
        type: 'CONFIRMATION_REQUISE',
        confirmation: {
          type: 'REPRISE_SOUS_TACHE',
          tacheId: SECTION_D,
          intitule: 'Section D',
          tacheParenteId: CHAPITRE_TERMINE,
          intituleTacheParente: 'Chapitre 2',
        },
      }),
    );
  });

  it('UT-US-025-18 deciderReprise — reprend la sous-tâche et rouvre sa tâche parente terminée, REOUVERTURE de rang 1 causée par la reprise (CA-13, DEC-032, S12f)', () => {
    expect(deciderReprise({ tacheId: SECTION_D })(vue(), contexte)).toEqual(
      succes({
        modifications: [
          reprise(SECTION_D, '2026-10-20', 0),
          {
            type: 'ECRIRE_TACHE',
            id: CHAPITRE_TERMINE,
            ecriture: { champ: 'cycleDeVie', valeur: { etat: 'A_FAIRE' } },
            evenement: {
              type: 'REOUVERTURE',
              element: { type: 'TACHE', id: CHAPITRE_TERMINE },
              avant: { etat: 'TERMINEE', dateFin: date('2026-10-21') },
              apres: { etat: 'A_FAIRE' },
              rang: 1,
              cause: 0,
            },
          },
        ],
        valeur: undefined,
      }),
    );
  });
});
