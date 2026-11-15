import { describe, expect, it } from 'vitest';
import type { DetailTache } from '@src/objectifs-taches/application/requetes/consulter-detail-tache';
import { construireDetailTache } from '@src/objectifs-taches/presentation/modeles-de-vue/detail-tache';
import { abandonnee, terminee } from '@tests/support/fabriques/etat-metier';
import { resumeTache } from '@tests/support/fabriques/resumes';
import { horlogeSur } from '@tests/support/horloge';
import { idTache } from '@tests/support/valeurs';

const PARENTE = idTache(1);
const horloge = horlogeSur('2026-10-25T10:00:00.000Z');

const incoherence = (etatParent: 'TERMINEE' | 'ABANDONNEE') => ({
  etatParent,
  sousTachesAFaire: [{ id: idTache(2), intitule: 'Section A' }],
});

const detail = (tache: ReturnType<typeof resumeTache>): DetailTache => ({
  tache,
  sousTaches: [],
  sousTachesAFaire: 1,
  actions: [],
});

describe('construireDetailTache — carte d’incohérence (RG-049)', () => {
  it('UT-COMP-US-017-2-28 construireDetailTache — ALR-003 pour une tâche terminée, ALR-004 pour une abandonnée, aucune carte sans incohérence', () => {
    const terminees = resumeTache({
      id: PARENTE,
      cycleDeVie: terminee('2026-10-20'),
      incoherence: incoherence('TERMINEE'),
    });
    const abandonnees = resumeTache({
      id: PARENTE,
      cycleDeVie: abandonnee('2026-10-20', 'op:0'),
      incoherence: incoherence('ABANDONNEE'),
    });

    expect(construireDetailTache(detail(terminees), { horloge }).incoherence).toMatchObject({
      code: 'ALR-003',
      n: 1,
    });
    expect(construireDetailTache(detail(abandonnees), { horloge }).incoherence).toMatchObject({
      code: 'ALR-004',
      n: 1,
    });
    expect(
      construireDetailTache(detail(resumeTache({ id: PARENTE })), { horloge }),
    ).not.toHaveProperty('incoherence');
  });
});
