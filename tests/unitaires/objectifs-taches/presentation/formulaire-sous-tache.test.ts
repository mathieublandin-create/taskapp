import { describe, expect, it } from 'vitest';
import type { DetailTache } from '@src/objectifs-taches/application/requetes/consulter-detail-tache';
import { construireFormulaireSousTache } from '@src/objectifs-taches/presentation/modeles-de-vue/formulaire-sous-tache';
import { resumeTache } from '@tests/support/fabriques/resumes';
import { idTache } from '@tests/support/valeurs';

const PARENTE = idTache(1);
const detail = (avecSousTache: boolean): DetailTache => ({
  tache: resumeTache({
    id: PARENTE,
    intitule: 'Chapitre 1',
    estimationMinutes: 180,
    ...(avecSousTache ? { sousTaches: { terminees: 0, nonAbandonnees: 1 } } : {}),
  }),
  sousTaches: avecSousTache
    ? [resumeTache({ id: idTache(2), tacheParente: { id: PARENTE, intitule: 'Chapitre 1' } })]
    : [],
  sousTachesAFaire: avecSousTache ? 1 : 0,
  actions: ['CREER_SOUS_TACHE'],
});

describe('construireFormulaireSousTache (ECR-007 I, US-024 CA-2, CA-5)', () => {
  it('UT-US-024-15 construireFormulaireSousTache — informe ALR-012 (3 h) avant la première sous-tâche, sans présélection (US-024 CA-5)', () => {
    const modele = construireFormulaireSousTache(detail(false));

    expect(modele).toMatchObject({
      tacheParente: { id: PARENTE, intitule: 'Chapitre 1' },
      information: { code: 'ALR-012', duree: { minutes: 180 } },
      objectifsPreRemplis: [],
    });
    expect(modele.delaiPreselectionne).toBeUndefined();
    expect(modele.estimationPreselectionnee).toBeUndefined();
  });

  it('UT-US-024-15 construireFormulaireSousTache — n’informe pas quand la tâche a déjà une sous-tâche (US-024 CA-5)', () => {
    expect(construireFormulaireSousTache(detail(true)).information).toBeUndefined();
  });
});
