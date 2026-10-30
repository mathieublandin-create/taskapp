import { describe, expect, it } from 'vitest';
import { messagesDeRefus } from '@src/objectifs-taches';

describe('Messages de refus des tâches (complément de couverture, messagesDeRefus livré au rang 4)', () => {
  it('UT-COMP-US-023-09 messagesDeRefus — ERR-032 à ERR-035 sont attribués à leur refus (les tests de leurs US s’exécutent aux rangs 5, 6 et 8)', () => {
    expect(messagesDeRefus({ type: 'EstimationCalculee' })).toEqual([
      { code: 'ERR-033', variables: {} },
    ]);
    expect(messagesDeRefus({ type: 'ObjectifsHerites' })).toEqual([
      { code: 'ERR-034', variables: {} },
    ]);
    expect(messagesDeRefus({ type: 'AjoutSousTacheATacheAbandonnee' })).toEqual([
      { code: 'ERR-032', variables: {} },
    ]);
    expect(messagesDeRefus({ type: 'SousTachesRestantes', nombre: 3 })).toEqual([
      { code: 'ERR-035', variables: { n: 3 } },
    ]);
  });
});
