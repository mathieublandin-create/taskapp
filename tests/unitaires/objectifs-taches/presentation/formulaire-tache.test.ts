import { describe, expect, it } from 'vitest';
import { construireFormulaireTache } from '@src/objectifs-taches/presentation/modeles-de-vue/formulaire-tache';
import { idObjectif } from '@tests/support/valeurs';

describe('construireFormulaireTache (US-002 CA-2, Q-ERG-03)', () => {
  it('UT-US-002-26 construireFormulaireTache — ne présélectionne ni délai ni estimation et marque ces deux champs MEN-OBLIGATOIRE', () => {
    const modele = construireFormulaireTache({});

    expect(modele).toEqual({
      delaiPreselectionne: undefined,
      estimationPreselectionnee: undefined,
      objectifsPreRemplis: [],
      mentionsObligatoire: [
        { champ: 'DELAI', code: 'MEN-OBLIGATOIRE' },
        { champ: 'ESTIMATION', code: 'MEN-OBLIGATOIRE' },
      ],
    });
  });

  it('UT-US-002-26 construireFormulaireTache — pré-remplit l’objectif du détail d’où l’on vient', () => {
    expect(
      construireFormulaireTache({ objectifPreRempli: idObjectif(1) }).objectifsPreRemplis,
    ).toEqual([idObjectif(1)]);
  });
});
