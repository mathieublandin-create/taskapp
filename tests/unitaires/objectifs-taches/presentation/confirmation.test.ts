import { describe, expect, it } from 'vitest';
import { construireConfirmation } from '@src/objectifs-taches/presentation/modeles-de-vue/confirmation';
import { idObjectif, idTache } from '@tests/support/valeurs';

describe('construireConfirmation (conventions.md §8.6, guide §6.6.7)', () => {
  it('UT-US-001-32 construireConfirmation — SUPPRESSION_OBJECTIF donne CNF-SUPPR-OBJECTIF avec l’élément, les tâches détachées et les sous-objectifs promus (US-001 CA-9)', () => {
    const modele = construireConfirmation({
      type: 'SUPPRESSION_OBJECTIF',
      objectifId: idObjectif(1),
      intitule: 'Publier le guide',
      tachesDetachees: 3,
      sousObjectifsPromus: 1,
    });

    expect(modele).toMatchObject({
      code: 'CNF-SUPPR-OBJECTIF',
      variables: { element: 'Publier le guide', taches: 3, sousObjectifs: 1 },
    });
  });

  it('UT-US-002-28 construireConfirmation — SUPPRESSION_TACHE (3) donne CNF-SUPPR-TACHE avec n = 3 (US-002 CA-12)', () => {
    const modele = construireConfirmation({
      type: 'SUPPRESSION_TACHE',
      tacheId: idTache(1),
      intitule: 'Chapitre 1',
      sousTaches: 3,
    });

    expect(modele).toMatchObject({ code: 'CNF-SUPPR-TACHE', variables: { n: 3 } });
  });

  it('UT-US-024-18 construireConfirmation — AJOUT_SOUS_TACHE_TERMINEE donne CNF-AJOUT-SOUS-TACHE-TERMINEE avec l’élément (US-024 S17)', () => {
    const modele = construireConfirmation({
      type: 'AJOUT_SOUS_TACHE_TERMINEE',
      tacheParenteId: idTache(1),
      intitule: 'Chapitre 1',
    });

    expect(modele).toMatchObject({
      code: 'CNF-AJOUT-SOUS-TACHE-TERMINEE',
      variables: { element: 'Chapitre 1' },
    });
  });

  it('UT-US-003-13 construireConfirmation — REOUVERTURE_SOUS_TACHE donne CNF-ROUVRIR-SOUS-TACHE avec la tâche parente (US-003 CA-9)', () => {
    const modele = construireConfirmation({
      type: 'REOUVERTURE_SOUS_TACHE',
      tacheParenteId: idTache(1),
      intitule: 'Chapitre 1',
    });

    expect(modele).toMatchObject({
      code: 'CNF-ROUVRIR-SOUS-TACHE',
      variables: { element: 'Chapitre 1' },
    });
  });

  it('UT-US-025-14 construireConfirmation — ABANDON_TACHE (0) donne CNF-ABANDON-TACHE ; (2) donne CNF-ABANDON-TACHE-CASCADE avec n = 2 (US-025 CA-1, CA-6)', () => {
    const sansSousTache = construireConfirmation({
      type: 'ABANDON_TACHE',
      tacheId: idTache(1),
      intitule: 'Refaire le logo',
      sousTachesAbandonnees: 0,
    });
    const enCascade = construireConfirmation({
      type: 'ABANDON_TACHE',
      tacheId: idTache(2),
      intitule: 'Chapitre 1',
      sousTachesAbandonnees: 2,
    });

    expect(sansSousTache).toMatchObject({
      code: 'CNF-ABANDON-TACHE',
      variables: { element: 'Refaire le logo' },
    });
    expect(enCascade).toMatchObject({
      code: 'CNF-ABANDON-TACHE-CASCADE',
      variables: { element: 'Chapitre 1', n: 2 },
    });
  });

  it('UT-US-025-18 construireConfirmation — REPRISE_SOUS_TACHE donne CNF-REPRENDRE-SOUS-TACHE avec la sous-tâche et la tâche parente (CA-13, guide v0.2.11 §6.6.7)', () => {
    const modele = construireConfirmation({
      type: 'REPRISE_SOUS_TACHE',
      tacheId: idTache(2),
      intitule: 'Section A',
      tacheParenteId: idTache(1),
      intituleTacheParente: 'Chapitre 1',
    });

    expect(modele).toMatchObject({
      code: 'CNF-REPRENDRE-SOUS-TACHE',
      variables: { element: 'Section A', tacheParente: 'Chapitre 1' },
    });
  });
});
