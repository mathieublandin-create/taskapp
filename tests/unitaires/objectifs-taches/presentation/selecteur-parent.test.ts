import { describe, expect, it } from 'vitest';
import { construireSelecteurParent } from '@src/objectifs-taches/presentation/modeles-de-vue/selecteur-parent';
import { resumeObjectif } from '@tests/support/fabriques/resumes';
import { idObjectif } from '@tests/support/valeurs';

const X = idObjectif(1);
const P1 = idObjectif(2);
const P2 = idObjectif(3);
const objectif = resumeObjectif({ id: X, intitule: 'Publier le guide' });
const candidats = [
  resumeObjectif({ id: P1, intitule: 'Délai 30', delai: '2026-11-30' }),
  objectif,
  resumeObjectif({ id: P2, intitule: 'Délai 20', delai: '2026-11-20' }),
];

describe('construireSelecteurParent (ECR-008 C, D ; guide §4.28)', () => {
  it('UT-US-023-15 construireSelecteurParent — propose AUCUN puis les principaux dans l’ordre de référence, l’objectif lui-même indisponible avec ERR-031', () => {
    const modele = construireSelecteurParent({ objectif, candidats, nombreSousObjectifs: 0 });

    expect(modele.options.map((option) => [option.cible, option.disponible])).toEqual([
      [{ type: 'AUCUN' }, true],
      [{ type: 'OBJECTIF', id: P2 }, true],
      [{ type: 'OBJECTIF', id: P1 }, true],
      [{ type: 'OBJECTIF', id: X }, false],
    ]);
    expect(modele.options[3]?.raison).toEqual({ code: 'ERR-031', variables: {} });
    expect(modele.messageBloquant).toBeUndefined();
  });

  it('UT-US-023-15 construireSelecteurParent — affiche ERR-030 objectif-a-des-sous-objectifs avant tout choix quand l’objectif a des sous-objectifs', () => {
    const modele = construireSelecteurParent({ objectif, candidats, nombreSousObjectifs: 1 });

    expect(modele.messageBloquant).toEqual({
      code: 'ERR-030',
      variante: 'objectif-a-des-sous-objectifs',
      variables: { element: 'Publier le guide', n: 1 },
    });
  });
});
