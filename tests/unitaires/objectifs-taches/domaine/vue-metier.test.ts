import { describe, expect, it } from 'vitest';
import {
  construireVueMetier,
  sousTachesParCreation,
} from '@src/objectifs-taches/domaine/vue-metier';
import { etatMetier } from '@tests/support/fabriques/etat-metier';
import { creeAuRang } from '@tests/support/fabriques/resumes';
import { idObjectif, idTache } from '@tests/support/valeurs';

const SUPPRIME = idObjectif(1);
const PRINCIPAL = idObjectif(2);
const ORPHELIN = idObjectif(3);
const SOUS_OBJECTIF = idObjectif(4);
const TACHE = idTache(1);
const TACHE_SUPPRIMEE = idTache(2);
const SOUS_TACHE_DE_SUPPRIMEE = idTache(3);

describe('construireVueMetier (RG-046)', () => {
  it('UT-US-001-04 construireVueMetier — exclut les supprimés, ignore un parent supprimé et les liens vers un objectif supprimé (RG-046)', () => {
    const etat = etatMetier()
      .avecObjectif({ id: SUPPRIME, intitule: 'Ancien objectif', supprime: true })
      .avecObjectif({ id: PRINCIPAL, intitule: 'Publier le guide' })
      .avecObjectif({ id: ORPHELIN, intitule: 'Version imprimable', parentIdEnregistre: SUPPRIME })
      .avecObjectif({
        id: SOUS_OBJECTIF,
        intitule: 'Version en ligne',
        parentIdEnregistre: PRINCIPAL,
      })
      .avecTache({ id: TACHE, objectifs: [SUPPRIME, PRINCIPAL] })
      .avecTache({ id: TACHE_SUPPRIMEE, supprime: true })
      .avecTache({ id: SOUS_TACHE_DE_SUPPRIMEE, tacheParenteId: TACHE_SUPPRIMEE })
      .construire();

    const vue = construireVueMetier(etat);

    expect([...vue.objectifs.keys()].sort()).toEqual([PRINCIPAL, ORPHELIN, SOUS_OBJECTIF].sort());
    expect(vue.objectifs.get(ORPHELIN)?.parentId).toBeUndefined();
    expect(vue.objectifs.get(SOUS_OBJECTIF)?.parentId).toBe(PRINCIPAL);
    expect(vue.sousObjectifsPar.get(PRINCIPAL)).toEqual([SOUS_OBJECTIF]);
    expect([...vue.taches.keys()]).toEqual([TACHE]);
    expect(vue.objectifsDirectsPar.get(TACHE)).toEqual([PRINCIPAL]);
    expect(vue.tachesDirectesPar.get(PRINCIPAL)).toEqual([TACHE]);
    expect(vue.tachesDirectesPar.has(SUPPRIME)).toBe(false);
    expect(vue.intitulesConnus.get(SUPPRIME)).toBe('Ancien objectif');
  });

  it('UT-COMP-US-025-01 sousTachesParCreation — création croissante, puis identifiant à création égale (ST-US-025 §6.1)', () => {
    const [parente, tardive, premiere, jumelle] = [idTache(1), idTache(2), idTache(3), idTache(4)];
    const vue = construireVueMetier(
      etatMetier()
        .avecTache({ id: parente })
        .avecTache({ id: tardive, tacheParenteId: parente, creeLe: creeAuRang(5) })
        .avecTache({ id: jumelle, tacheParenteId: parente, creeLe: creeAuRang(1) })
        .avecTache({ id: premiere, tacheParenteId: parente, creeLe: creeAuRang(1) })
        .construire(),
    );

    expect(sousTachesParCreation(vue, parente).map((t) => t.id)).toEqual([
      premiere,
      jumelle,
      tardive,
    ]);
  });
});
