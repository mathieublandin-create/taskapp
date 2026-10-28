import { describe, expect, it } from 'vitest';
import {
  comparerLignesFeuille,
  type LigneFeuilleOrdonnable,
} from '@src/synchronisation/presentation/modeles-de-vue/ordre-feuille';
import { instant } from '@tests/support/valeurs';

const ligne = (id: string, intitule: string, quand: string): LigneFeuilleOrdonnable => ({
  id,
  intitule,
  instant: instant(quand),
});

describe('Ordre des listes de la feuille (guide v0.2.14 §5.8 f ; RL-LOT-001-S3)', () => {
  it('UT-US-017-33 comparerLignesFeuille — la plus récente d’abord ; à égalité, intitulé sans tenir compte de la casse ni des accents ; puis id', () => {
    const lignes = [
      ligne('id-1', 'Relire', '2026-10-21T08:00:00.000Z'),
      ligne('id-2', 'écrire', '2026-10-21T09:00:00.000Z'),
      ligne('id-3', 'Envoyer', '2026-10-21T09:00:00.000Z'),
      ligne('id-5', 'Zèbre', '2026-10-21T10:00:00.000Z'),
      ligne('id-4', 'zebre', '2026-10-21T10:00:00.000Z'),
    ];

    expect([...lignes].sort(comparerLignesFeuille).map((l) => l.id)).toEqual([
      'id-4',
      'id-5',
      'id-2',
      'id-3',
      'id-1',
    ]);
  });
});
