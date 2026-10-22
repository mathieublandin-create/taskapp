import { describe, expect, it } from 'vitest';
import { messagesDeRefus } from '@src/objectifs-taches/presentation/modeles-de-vue/messages-de-refus';
import { idObjectif } from '@tests/support/valeurs';

describe('messagesDeRefus (conventions.md §8.5, guide §6.6.8)', () => {
  it('UT-US-001-33 messagesDeRefus — [INTITULE_VIDE] donne ERR-020 ; ElementIntrouvable donne une liste vide (US-001 CA-1)', () => {
    expect(messagesDeRefus({ type: 'SaisieInvalide', defauts: ['INTITULE_VIDE'] })).toEqual([
      { code: 'ERR-020', variables: {} },
    ]);
    expect(
      messagesDeRefus({
        type: 'ElementIntrouvable',
        element: { type: 'OBJECTIF', id: idObjectif(1) },
      }),
    ).toEqual([]);
  });

  it('UT-US-023-14 messagesDeRefus — DeuxiemeNiveau donne ERR-030 avec sa variante et ses variables ; PlacementSousLuiMeme donne ERR-031 (US-023 CA-6)', () => {
    expect(
      messagesDeRefus({
        type: 'DeuxiemeNiveau',
        variante: 'objectif-a-des-sous-objectifs',
        objectif: 'Publier le guide',
        nombreSousObjectifs: 1,
      }),
    ).toEqual([
      {
        code: 'ERR-030',
        variante: 'objectif-a-des-sous-objectifs',
        variables: { element: 'Publier le guide', n: 1 },
      },
    ]);
    expect(
      messagesDeRefus({
        type: 'DeuxiemeNiveau',
        variante: 'cible-est-sous-objectif',
        cible: 'Version imprimable',
      }),
    ).toEqual([
      {
        code: 'ERR-030',
        variante: 'cible-est-sous-objectif',
        variables: { element: 'Version imprimable' },
      },
    ]);
    expect(messagesDeRefus({ type: 'PlacementSousLuiMeme' })).toEqual([
      { code: 'ERR-031', variables: {} },
    ]);
  });

  it('UT-US-002-27 messagesDeRefus — [DELAI_ABSENT, ESTIMATION_ABSENTE] donne ERR-021 puis ERR-022 ; ESTIMATION_INVALIDE, EstimationCalculee et ObjectifsHerites donnent ERR-023, ERR-033, ERR-034 (US-002 CA-3, CA-9)', () => {
    expect(
      messagesDeRefus({ type: 'SaisieInvalide', defauts: ['DELAI_ABSENT', 'ESTIMATION_ABSENTE'] }),
    ).toEqual([
      { code: 'ERR-021', variables: {} },
      { code: 'ERR-022', variables: {} },
    ]);
    expect(messagesDeRefus({ type: 'SaisieInvalide', defauts: ['ESTIMATION_INVALIDE'] })).toEqual([
      { code: 'ERR-023', variables: {} },
    ]);
    expect(messagesDeRefus({ type: 'EstimationCalculee' })).toEqual([
      { code: 'ERR-033', variables: {} },
    ]);
    expect(messagesDeRefus({ type: 'ObjectifsHerites' })).toEqual([
      { code: 'ERR-034', variables: {} },
    ]);
    expect(messagesDeRefus({ type: 'ActionNonDisponible', action: 'SUPPRIMER' })).toEqual([]);
  });

  it('UT-US-024-18 messagesDeRefus — AjoutSousTacheATacheAbandonnee donne ERR-032 (US-024 S18)', () => {
    expect(messagesDeRefus({ type: 'AjoutSousTacheATacheAbandonnee' })).toEqual([
      { code: 'ERR-032', variables: {} },
    ]);
  });

  it('UT-US-003-13 messagesDeRefus — SousTachesRestantes(2) donne ERR-035 avec n = 2 (US-003 CA-8)', () => {
    expect(messagesDeRefus({ type: 'SousTachesRestantes', nombre: 2 })).toEqual([
      { code: 'ERR-035', variables: { n: 2 } },
    ]);
  });
});
