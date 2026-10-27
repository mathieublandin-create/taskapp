import { describe, expect, it } from 'vitest';
import { mentionAttente } from '@src/synchronisation/presentation/modeles-de-vue/mention-attente';
import { idObjectif, idTache } from '@tests/support/valeurs';

describe('mentionAttente (guide §6.6.4)', () => {
  it('UT-US-017-16 mentionAttente — MEN-ATTENTE seulement pour un élément qui a une écriture en attente (US-018 CA-3)', () => {
    const enAttente = new Set<string>([idTache(1)]);

    expect(mentionAttente({ type: 'TACHE', id: idTache(1) }, enAttente)).toEqual({
      code: 'MEN-ATTENTE',
    });
    expect(mentionAttente({ type: 'OBJECTIF', id: idObjectif(1) }, enAttente)).toBeUndefined();
  });
});
