import { describe, expect, it } from 'vitest';
import { construireSelecteurParent } from '@src/objectifs-taches/presentation/modeles-de-vue/selecteur-parent';
import { resumeObjectif } from '@tests/support/fabriques/resumes';
import { date, idObjectif } from '@tests/support/valeurs';

const X = idObjectif(1);
const P1 = idObjectif(2);
const P2 = idObjectif(3);
const objectif = resumeObjectif({ id: X, intitule: 'Publier le guide' });
const JOUR = date('2026-10-21');
const candidats = [
  resumeObjectif({ id: P1, intitule: 'Délai 30', delai: '2026-11-30' }),
  objectif,
  resumeObjectif({ id: P2, intitule: 'Délai 20', delai: '2026-11-20' }),
];

describe('construireSelecteurParent (ECR-008 C, D ; guide §4.28)', () => {
  it('UT-US-023-15 construireSelecteurParent — propose AUCUN puis les principaux dans l’ordre de référence, l’objectif lui-même indisponible avec ERR-031', () => {
    const modele = construireSelecteurParent({
      objectif,
      candidats,
      nombreSousObjectifs: 0,
      jour: JOUR,
      autresSousObjectifs: new Map(),
    });

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
    const modele = construireSelecteurParent({
      objectif,
      candidats,
      nombreSousObjectifs: 1,
      jour: JOUR,
      autresSousObjectifs: new Map(),
    });

    expect(modele.messageBloquant).toEqual({
      code: 'ERR-030',
      variante: 'objectif-a-des-sous-objectifs',
      variables: { element: 'Publier le guide', n: 1 },
    });
  });

  it('UT-COMP-US-023-11 construireSelecteurParent — textes du catalogue (SEL-PARENT-TITRE, -AUCUN) et indications SEL-PARENT-DELAI puis -EFFECTIF d’un candidat (guide §6.6.4)', () => {
    const modele = construireSelecteurParent({
      objectif,
      candidats,
      nombreSousObjectifs: 0,
      jour: JOUR,
      autresSousObjectifs: new Map([
        [P1, 2],
        [P2, 0],
      ]),
    });
    const indications = (rang: number) =>
      modele.options[rang]?.indications.map((indication) => indication.libelle);

    expect(modele.titre).toBe('Placer «\u00a0Publier le guide\u00a0» sous…');
    expect(modele.options[0]?.intitule).toBe('Aucun, objectif principal');
    expect(indications(0)).toEqual([]);
    expect(indications(1)).toEqual(['Son délai\u00a0: 20 nov.']);
    expect(indications(2)).toEqual(['Son délai\u00a0: 30 nov.', 'Aura 3 sous-objectifs']);
    expect(indications(3)).toEqual([]);
  });
});
