/** Compléments de construireDetailTache pour US-025 (UT-COMP-US-025-nn, tests de Benjamin). */
import { describe, expect, it } from 'vitest';
import { construireDetailTache } from '@src/objectifs-taches/presentation/modeles-de-vue/detail-tache';
import { abandonnee } from '@tests/support/fabriques/etat-metier';
import { resumeTache } from '@tests/support/fabriques/resumes';
import { horlogeSur } from '@tests/support/horloge';
import { idTache } from '@tests/support/valeurs';

const PARENTE = idTache(1);

describe('construireDetailTache — étiquette des sous-tâches (ST-US-025 §6.4)', () => {
  it('UT-COMP-US-025-12 une sous-tâche encore à faire sous une tâche parente abandonnée (incohérence, rang 9) n’a pas d’étiquette', () => {
    const tache = resumeTache({
      id: PARENTE,
      cycleDeVie: abandonnee('2026-10-25', 'op:0'),
      sousTaches: { terminees: 0, nonAbandonnees: 1 },
    });
    const sousTache = resumeTache({
      id: idTache(2),
      tacheParente: { id: PARENTE, intitule: 'Chapitre 1' },
    });

    const modele = construireDetailTache(
      { tache, sousTaches: [sousTache], sousTachesAFaire: 1, actions: [] },
      { horloge: horlogeSur('2026-10-25T10:00:00.000Z') },
    );

    expect(modele.sousTaches?.lignes.map((ligne) => ligne.etiquette)).toEqual([undefined]);
  });
});
