/**
 * Carte d'incohérence d'ECR-007 H (`InconsistencyCard`, RG-049 ; guide §4.23, §6.6.9) : action principale et
 * sous-tâche visée par les actions tertiaires (ST-US-024 v0.5 §4.5, §6.6 ; DT-026). UT-US-024-24, rang 10.
 */
import { describe, expect, it } from 'vitest';
import type { DetailTache } from '@src/objectifs-taches/application/requetes/consulter-detail-tache';
import { construireDetailTache } from '@src/objectifs-taches/presentation/modeles-de-vue/detail-tache';
import { abandonnee, terminee } from '@tests/support/fabriques/etat-metier';
import { resumeTache } from '@tests/support/fabriques/resumes';
import { horlogeSur } from '@tests/support/horloge';
import { idObjectif, idTache } from '@tests/support/valeurs';

const horloge = horlogeSur('2026-10-25T10:00:00.000Z');
const SECTION_A = { id: idTache(2), intitule: 'Section A' };
const SECTION_B = { id: idTache(3), intitule: 'Section B' };

const carte = (
  etat: 'TERMINEE' | 'ABANDONNEE',
  sousTachesAFaire: ReadonlyArray<{
    readonly id: ReturnType<typeof idTache>;
    readonly intitule: string;
  }>,
) => {
  const tache = resumeTache({
    id: idTache(1),
    cycleDeVie: etat === 'TERMINEE' ? terminee('2026-10-20') : abandonnee('2026-10-20', 'op:0'),
    objectifs: [{ id: idObjectif(1), intitule: 'Publier le guide' }],
    incoherence: { etatParent: etat, sousTachesAFaire },
  });
  const detail: DetailTache = {
    tache,
    sousTaches: [],
    sousTachesAFaire: sousTachesAFaire.length,
    actions: [],
  };
  return construireDetailTache(detail, { horloge }).incoherence;
};

describe('construireDetailTache — actions de la carte d’incohérence (ST-US-024 v0.5 §4.5, DT-026)', () => {
  it('UT-US-024-24 ALR-003 : action principale ROUVRIR (« Rouvrir la tâche », partie action du code) ; une seule sous-tâche à faire : elle est la cible de « Terminer la sous-tâche » et « Abandonner la sous-tâche »', () => {
    expect(carte('TERMINEE', [SECTION_A])).toMatchObject({
      code: 'ALR-003',
      n: 1,
      actionPrincipale: { action: 'ROUVRIR', libelle: 'Rouvrir la tâche' },
      sousTache: SECTION_A,
    });
  });

  it('UT-US-024-24 ALR-004 : action principale REPRENDRE (« Reprendre la tâche ») ; même cible pour une seule sous-tâche à faire', () => {
    expect(carte('ABANDONNEE', [SECTION_A])).toMatchObject({
      code: 'ALR-004',
      n: 1,
      actionPrincipale: { action: 'REPRENDRE', libelle: 'Reprendre la tâche' },
      sousTache: SECTION_A,
    });
  });

  it('UT-US-024-24 deux sous-tâches à faire ou plus : action principale seule, aucune sous-tâche visée (Q-ST024-STE-1 a)', () => {
    const plusieurs = carte('TERMINEE', [SECTION_A, SECTION_B]);
    expect(plusieurs).toMatchObject({
      code: 'ALR-003',
      n: 2,
      actionPrincipale: { action: 'ROUVRIR', libelle: 'Rouvrir la tâche' },
    });
    expect(plusieurs).not.toHaveProperty('sousTache');
  });
});
