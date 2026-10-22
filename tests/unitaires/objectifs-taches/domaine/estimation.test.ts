import { describe, expect, it } from 'vitest';
import { estimationEnVigueur } from '@src/objectifs-taches/domaine/estimation';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { abandonnee, etatMetier, type TacheTest } from '@tests/support/fabriques/etat-metier';
import { duree, idTache } from '@tests/support/valeurs';

const PARENTE = idTache(1);
const vueAvecSousTaches = (...sousTaches: ReadonlyArray<Omit<TacheTest, 'tacheParenteId'>>) => {
  const constructeur = etatMetier().avecTache({
    id: PARENTE,
    intitule: 'Chapitre 1',
    estimationMinutes: 180,
  });
  for (const s of sousTaches) constructeur.avecTache({ ...s, tacheParenteId: PARENTE });
  return construireVueMetier(constructeur.construire());
};

describe('estimationEnVigueur (RG-023, RG-029)', () => {
  it('UT-US-002-18 estimationEnVigueur — renvoie l’estimation initiale d’une tâche simple, non calculée (US-002 CA-9)', () => {
    expect(estimationEnVigueur(vueAvecSousTaches(), PARENTE)).toEqual({
      duree: duree(180),
      calculee: false,
    });
  });

  it('UT-US-024-08 estimationEnVigueur — somme les sous-tâches non abandonnées : 1 h + 1 h 30 = 2 h 30 (US-024 CA-4)', () => {
    const vue = vueAvecSousTaches(
      { id: idTache(2), estimationMinutes: 60 },
      { id: idTache(3), estimationMinutes: 90 },
    );

    expect(estimationEnVigueur(vue, PARENTE)).toEqual({ duree: duree(150), calculee: true });
  });

  it('UT-US-024-08 estimationEnVigueur — ignore une sous-tâche abandonnée : 1 h 30 ; toutes abandonnées : 0 h (US-024 CA-4, S16)', () => {
    const uneAbandonnee = vueAvecSousTaches(
      { id: idTache(2), estimationMinutes: 60, cycleDeVie: abandonnee('2026-10-20', 'op:0') },
      { id: idTache(3), estimationMinutes: 90 },
    );
    const toutesAbandonnees = vueAvecSousTaches(
      { id: idTache(2), estimationMinutes: 60, cycleDeVie: abandonnee('2026-10-20', 'op:0') },
      { id: idTache(3), estimationMinutes: 90, cycleDeVie: abandonnee('2026-10-20', 'op:1') },
    );

    expect(estimationEnVigueur(uneAbandonnee, PARENTE)).toEqual({
      duree: duree(90),
      calculee: true,
    });
    expect(estimationEnVigueur(toutesAbandonnees, PARENTE)).toEqual({
      duree: duree(0),
      calculee: true,
    });
  });

  it('UT-US-024-09 estimationEnVigueur — exclut une sous-tâche supprimée ; sans sous-tâche restante, revient à l’estimation initiale (US-024 CA-9)', () => {
    const uneSupprimee = vueAvecSousTaches(
      { id: idTache(2), estimationMinutes: 60, supprime: true },
      { id: idTache(3), estimationMinutes: 90 },
    );
    const plusAucune = vueAvecSousTaches({ id: idTache(2), estimationMinutes: 60, supprime: true });

    expect(estimationEnVigueur(uneSupprimee, PARENTE)).toEqual({
      duree: duree(90),
      calculee: true,
    });
    expect(estimationEnVigueur(plusAucune, PARENTE)).toEqual({
      duree: duree(180),
      calculee: false,
    });
  });
});
