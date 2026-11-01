/**
 * Carte d'incohérence ALR-003 selon le nombre d'objectifs de la tâche (guide §6.6.9, Q-ST017-D2-1) : un objectif
 * (nominal), aucun (`sans-objectif`), deux ou plus (`objectifs`) ; ALR-004 n'en nomme aucun. Tranche D3.
 */
import { describe, expect, it } from 'vitest';
import type { DetailTache } from '@src/objectifs-taches/application/requetes/consulter-detail-tache';
import { construireDetailTache } from '@src/objectifs-taches/presentation/modeles-de-vue/detail-tache';
import { abandonnee, terminee } from '@tests/support/fabriques/etat-metier';
import { resumeTache } from '@tests/support/fabriques/resumes';
import { horlogeSur } from '@tests/support/horloge';
import { idObjectif, idTache } from '@tests/support/valeurs';

const horloge = horlogeSur('2026-10-25T10:00:00.000Z');
const NBSP = ' ';
const A_FAIRE = { id: idTache(2), intitule: 'Section A' };

const carte = (etat: 'TERMINEE' | 'ABANDONNEE', intitules: ReadonlyArray<string>) => {
  const tache = resumeTache({
    id: idTache(1),
    cycleDeVie: etat === 'TERMINEE' ? terminee('2026-10-20') : abandonnee('2026-10-20', 'op:0'),
    objectifs: intitules.map((intitule, i) => ({ id: idObjectif(i + 1), intitule })),
    incoherence: { etatParent: etat, sousTachesAFaire: [A_FAIRE] },
  });
  const detail: DetailTache = { tache, sousTaches: [], sousTachesAFaire: 1, actions: [] };
  return construireDetailTache(detail, { horloge }).incoherence;
};

describe('construireDetailTache — ALR-003 et ALR-004 (Q-ST017-D2-1)', () => {
  it('UT-COMP-US-017-2-48 ALR-003 — un objectif : texte nominal sans variante ; aucun : variante sans-objectif ; plusieurs : variante objectifs, intitulés séparés par « , » et « et »', () => {
    expect(carte('TERMINEE', ['Publier le guide'])).toMatchObject({
      code: 'ALR-003',
      texte: `Cette tâche est terminée, mais 1 sous-tâche est à faire. Rien n’a été modifié. Tant que c’est le cas, l’objectif «${NBSP}Publier le guide${NBSP}» n’est pas atteint.`,
    });
    expect(carte('TERMINEE', ['Publier le guide'])?.variante).toBeUndefined();
    expect(carte('TERMINEE', [])).toMatchObject({
      variante: 'sans-objectif',
      texte: 'Cette tâche est terminée, mais 1 sous-tâche est à faire. Rien n’a été modifié.',
    });
    expect(carte('TERMINEE', ['A', 'B'])).toMatchObject({
      variante: 'objectifs',
      texte: `Cette tâche est terminée, mais 1 sous-tâche est à faire. Rien n’a été modifié. Tant que c’est le cas, les objectifs «${NBSP}A${NBSP}» et «${NBSP}B${NBSP}» ne sont pas atteints.`,
    });
    expect(carte('TERMINEE', ['A', 'B', 'C'])?.texte).toContain(
      `«${NBSP}A${NBSP}», «${NBSP}B${NBSP}» et «${NBSP}C${NBSP}»`,
    );
  });

  it('UT-COMP-US-017-2-49 ALR-004 — aucun objectif nommé, quel que soit leur nombre, ni variante', () => {
    expect(carte('ABANDONNEE', ['A', 'B'])).toMatchObject({
      code: 'ALR-004',
      texte: 'Cette tâche est abandonnée, mais 1 sous-tâche est à faire. Rien n’a été modifié.',
    });
    expect(carte('ABANDONNEE', ['A', 'B'])?.variante).toBeUndefined();
  });
});
