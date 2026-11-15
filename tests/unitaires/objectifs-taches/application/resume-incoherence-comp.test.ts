import { describe, expect, it } from 'vitest';
import { resumerTache } from '@src/objectifs-taches/application/requetes/resumes';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import type { CycleDeVie } from '@src/synchronisation/domaine/etat-metier';
import { abandonnee, aFaire, etatMetier, terminee } from '@tests/support/fabriques/etat-metier';
import { date, idTache } from '@tests/support/valeurs';

const PARENTE = idTache(1);
const SOUS_TACHE = idTache(2);
const JOUR = date('2026-10-25');

const resume = (parente: CycleDeVie, sousTache: CycleDeVie) => {
  const vue = construireVueMetier(
    etatMetier()
      .avecTache({ id: PARENTE, intitule: 'Chapitre 1', cycleDeVie: parente })
      .avecTache({
        id: SOUS_TACHE,
        intitule: 'Section A',
        tacheParenteId: PARENTE,
        cycleDeVie: sousTache,
      })
      .construire(),
  );
  const tache = vue.taches.get(PARENTE);
  if (tache === undefined) throw new Error('tâche parente absente de la vue');
  return resumerTache(vue, tache, JOUR);
};

describe('resumerTache — incohérence (RG-049)', () => {
  it('UT-COMP-US-017-2-27 resumerTache — porte l’incohérence d’une tâche terminée ou abandonnée avec une sous-tâche à faire, et seulement alors', () => {
    expect(resume(terminee('2026-10-20'), aFaire()).incoherence).toEqual({
      etatParent: 'TERMINEE',
      sousTachesAFaire: [{ id: SOUS_TACHE, intitule: 'Section A' }],
    });
    expect(resume(abandonnee('2026-10-20', 'op:0'), aFaire()).incoherence?.etatParent).toBe(
      'ABANDONNEE',
    );
    expect(resume(terminee('2026-10-20'), terminee('2026-10-20'))).not.toHaveProperty(
      'incoherence',
    );
  });
});
