import { describe, expect, it } from 'vitest';
import { construireListeTaches } from '@src/objectifs-taches/presentation/modeles-de-vue/liste-taches';
import { resumeTache } from '@tests/support/fabriques/resumes';
import { horlogeSur } from '@tests/support/horloge';
import { idObjectif, idTache } from '@tests/support/valeurs';

// ST-US-002 §11, §14 : la liste de 5 000 tâches est filtrée et triée en moins de 100 ms. Mesure indicative.
const NOMBRE_TACHES = 5_000;
const SEUIL_MS = 100;

describe('construireListeTaches — performance indicative (US-002)', () => {
  it('trie et filtre 5 000 tâches en moins de 100 ms', () => {
    const objectif = { id: idObjectif(1), intitule: 'Publier le guide' };
    const taches = Array.from({ length: NOMBRE_TACHES }, (_, n) =>
      resumeTache({
        id: idTache(n + 1),
        intitule: `Tâche ${String(NOMBRE_TACHES - n)}`,
        delai: `2026-${String((n % 12) + 1).padStart(2, '0')}-${String((n % 28) + 1).padStart(2, '0')}`,
        objectifs: n % 2 === 0 ? [objectif] : [],
      }),
    );
    const horloge = horlogeSur('2026-10-21T08:00:00.000Z');

    const debut = performance.now();
    const modele = construireListeTaches(
      { taches, existeAuMoinsUnObjectif: true },
      { etat: 'A_FAIRE', objectif: { type: 'OBJECTIF', id: objectif.id } },
      { horloge },
    );
    const duree = performance.now() - debut;

    expect(modele.lignes).toHaveLength(NOMBRE_TACHES / 2);
    expect(duree).toBeLessThan(SEUIL_MS);
  });
});
