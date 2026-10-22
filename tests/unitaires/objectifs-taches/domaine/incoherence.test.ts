import { describe, expect, it } from 'vitest';
import { incoherenceDe } from '@src/objectifs-taches/domaine/incoherence';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import type { CycleDeVie } from '@src/synchronisation/domaine/etat-metier';
import { abandonnee, aFaire, etatMetier, terminee } from '@tests/support/fabriques/etat-metier';
import { idTache } from '@tests/support/valeurs';

const PARENTE = idTache(1);
const SOUS_TACHE = idTache(2);
const vue = (parente: CycleDeVie, sousTache: CycleDeVie) =>
  construireVueMetier(
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

describe('incoherenceDe (RG-049, rang 9)', () => {
  it('UT-US-024-21 incoherenceDe — signale une tâche terminée ou abandonnée qui a une sous-tâche à faire (RG-049)', () => {
    expect(incoherenceDe(vue(terminee('2026-10-20'), aFaire()), PARENTE)).toEqual({
      etatParent: 'TERMINEE',
      sousTachesAFaire: [{ id: SOUS_TACHE, intitule: 'Section A' }],
    });
    expect(incoherenceDe(vue(abandonnee('2026-10-20', 'op:0'), aFaire()), PARENTE)).toEqual({
      etatParent: 'ABANDONNEE',
      sousTachesAFaire: [{ id: SOUS_TACHE, intitule: 'Section A' }],
    });
  });

  it('UT-US-024-21 incoherenceDe — ne signale rien après la fin ou l’abandon de la sous-tâche, ou la réouverture de la tâche parente (RG-049)', () => {
    expect(
      incoherenceDe(vue(terminee('2026-10-20'), terminee('2026-10-21')), PARENTE),
    ).toBeUndefined();
    expect(
      incoherenceDe(vue(terminee('2026-10-20'), abandonnee('2026-10-21', 'op:1')), PARENTE),
    ).toBeUndefined();
    expect(incoherenceDe(vue(aFaire(), aFaire()), PARENTE)).toBeUndefined();
  });
});
