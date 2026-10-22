import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import {
  deciderReouverture,
  evaluerReouverture,
} from '@src/objectifs-taches/domaine/decisions/rouvrir-tache';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { abandonnee, etatMetier, terminee } from '@tests/support/fabriques/etat-metier';
import { contexteDecision } from '@tests/support/horloge';
import { date, idTache } from '@tests/support/valeurs';

const SIMPLE_TERMINEE = idTache(1);
const A_FAIRE = idTache(2);
const PARENTE_TERMINEE = idTache(3);
const SOUS_DE_TERMINEE = idTache(4);
const PARENTE_ABANDONNEE = idTache(5);
const SOUS_DE_ABANDONNEE = idTache(6);
const contexte = contexteDecision('2026-10-21T08:00:00.000Z', '2026-10-21');
const vue = () =>
  construireVueMetier(
    etatMetier()
      .avecTache({ id: SIMPLE_TERMINEE, cycleDeVie: terminee('2026-10-18') })
      .avecTache({ id: A_FAIRE })
      .avecTache({
        id: PARENTE_TERMINEE,
        intitule: 'Chapitre 1',
        cycleDeVie: terminee('2026-10-19'),
      })
      .avecTache({
        id: SOUS_DE_TERMINEE,
        tacheParenteId: PARENTE_TERMINEE,
        cycleDeVie: terminee('2026-10-17'),
      })
      .avecTache({ id: PARENTE_ABANDONNEE, cycleDeVie: abandonnee('2026-10-19', 'op:0') })
      .avecTache({
        id: SOUS_DE_ABANDONNEE,
        tacheParenteId: PARENTE_ABANDONNEE,
        cycleDeVie: terminee('2026-10-17'),
      })
      .construire(),
  );
const reouverture = (id: typeof A_FAIRE, dateFin: string, rang: number, cause?: number) => ({
  type: 'ECRIRE_TACHE',
  id,
  ecriture: { champ: 'cycleDeVie', valeur: { etat: 'A_FAIRE' } },
  evenement: {
    type: 'REOUVERTURE',
    element: { type: 'TACHE', id },
    avant: { etat: 'TERMINEE', dateFin: date(dateFin) },
    apres: { etat: 'A_FAIRE' },
    rang,
    ...(cause === undefined ? {} : { cause }),
  },
});

describe('Réouverture d’une tâche (RG-026 ; RG-027, DEC-030)', () => {
  it('UT-US-003-05 evaluerReouverture — sans confirmation pour une tâche terminée simple ; ActionNonDisponible pour une tâche à faire (US-003 CA-3)', () => {
    expect(evaluerReouverture({ tacheId: SIMPLE_TERMINEE })(vue())).toEqual(
      succes({ type: 'SANS_CONFIRMATION' }),
    );
    expect(evaluerReouverture({ tacheId: A_FAIRE })(vue())).toEqual(
      echec({ type: 'ActionNonDisponible', action: 'ROUVRIR' }),
    );
  });

  it('UT-US-003-06 evaluerReouverture — demande REOUVERTURE_SOUS_TACHE pour la sous-tâche d’une tâche terminée (US-003 CA-9)', () => {
    expect(evaluerReouverture({ tacheId: SOUS_DE_TERMINEE })(vue())).toEqual(
      succes({
        type: 'CONFIRMATION_REQUISE',
        confirmation: {
          type: 'REOUVERTURE_SOUS_TACHE',
          tacheParenteId: PARENTE_TERMINEE,
          intitule: 'Chapitre 1',
        },
      }),
    );
  });

  it('UT-US-003-07 evaluerReouverture — refuse ActionNonDisponible pour la sous-tâche terminée d’une tâche abandonnée (RG-027, DEC-030)', () => {
    expect(evaluerReouverture({ tacheId: SOUS_DE_ABANDONNEE })(vue())).toEqual(
      echec({ type: 'ActionNonDisponible', action: 'ROUVRIR' }),
    );
  });

  it('UT-US-003-08 deciderReouverture — remet à faire avec REOUVERTURE avant { TERMINEE, dateFin } après { A_FAIRE } (US-003 CA-3, CA-13)', () => {
    expect(deciderReouverture({ tacheId: SIMPLE_TERMINEE })(vue(), contexte)).toEqual(
      succes({ modifications: [reouverture(SIMPLE_TERMINEE, '2026-10-18', 0)], valeur: undefined }),
    );
  });

  it('UT-US-003-09 deciderReouverture — rouvre aussi la tâche parente terminée : deux écritures, le second événement causé par le premier (US-003 CA-9, S22)', () => {
    expect(deciderReouverture({ tacheId: SOUS_DE_TERMINEE })(vue(), contexte)).toEqual(
      succes({
        modifications: [
          reouverture(SOUS_DE_TERMINEE, '2026-10-17', 0),
          reouverture(PARENTE_TERMINEE, '2026-10-19', 1, 0),
        ],
        valeur: undefined,
      }),
    );
  });
});
