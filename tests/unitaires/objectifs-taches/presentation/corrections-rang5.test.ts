/**
 * Corrections de la revue E13 du rang 5 (revue-code-LOT-001-rang5.md) : identifiants des objectifs d'une tâche
 * (RC-US-002-3) et table code → champ des messages de saisie (RC-US-002-8). Tests complémentaires.
 */
import { describe, expect, it } from 'vitest';
import { construireDetailTache } from '@src/objectifs-taches/presentation/modeles-de-vue/detail-tache';
import { construireLigneTache } from '@src/objectifs-taches/presentation/modeles-de-vue/ligne-tache';
import { champDuMessage } from '@src/objectifs-taches/presentation/modeles-de-vue/messages-de-refus';
import { resumeTache } from '@tests/support/fabriques/resumes';
import { horlogeSur } from '@tests/support/horloge';
import { date, idObjectif, idTache } from '@tests/support/valeurs';

describe('Corrections du rang 5 — modèles de vue', () => {
  it('UT-COMP-US-002-85 construireDetailTache — objectifs.ids suit objectifs.intitules, même ordre, y compris pour deux objectifs homonymes (RC-US-002-3)', () => {
    const tache = resumeTache({
      id: idTache(1),
      objectifs: [
        { id: idObjectif(7), intitule: 'Doublon' },
        { id: idObjectif(3), intitule: 'Doublon' },
      ],
    });

    const m = construireDetailTache(
      { tache, sousTaches: [], sousTachesAFaire: 0, actions: [] },
      { horloge: horlogeSur('2026-10-25T10:00:00.000Z') },
    );

    expect(m.objectifs.intitules).toEqual(['Doublon', 'Doublon']);
    expect(m.objectifs.ids).toEqual([idObjectif(7), idObjectif(3)]);
  });

  it('UT-COMP-US-002-86 champDuMessage — ERR-020 : intitulé, ERR-021 : délai, ERR-022 et ERR-023 : estimation, autre code : aucun champ (RC-US-002-8)', () => {
    expect(champDuMessage('ERR-020')).toBe('intitule');
    expect(champDuMessage('ERR-021')).toBe('delai');
    expect(champDuMessage('ERR-022')).toBe('estimation');
    expect(champDuMessage('ERR-023')).toBe('estimation');
    expect(champDuMessage('ERR-033')).toBeUndefined();
  });
});

describe('Corrections du rang 5 — ligne de tâche', () => {
  it('UT-COMP-US-002-93 construireLigneTache — une tâche incohérente porte la mention MEN-INCOHERENCE (branche conservée après l’extraction de terminaison)', () => {
    const ligne = construireLigneTache(
      resumeTache({
        id: idTache(1),
        incoherence: { etatParent: 'TERMINEE', sousTachesAFaire: [] },
      }),
      date('2026-10-25'),
    );

    expect(ligne.incoherence).toEqual({ code: 'MEN-INCOHERENCE' });
  });
});
