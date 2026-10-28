import { describe, expect, it } from 'vitest';
import {
  cleEnTexte,
  elementDeCle,
  idLien,
  partiesDuLien,
  type CleInformation,
} from '@src/synchronisation/domaine/information';
import { idObjectif, idTache } from '@tests/support/valeurs';

const O = idObjectif(1);
const T = idTache(1);

describe('Clés d’information (ST-socle-ecriture.md §4.1.3)', () => {
  it('UT-COMP-01 idLien et partiesDuLien — forment `tâche|objectif` et le décomposent', () => {
    const lien = idLien(T, O);

    expect(lien).toBe(`${T}|${O}`);
    expect(partiesDuLien(lien)).toEqual({ tacheId: T, objectifId: O });
  });

  it('UT-COMP-02 cleEnTexte — forme `type/id/champ`', () => {
    expect(cleEnTexte({ type: 'OBJECTIF', id: O, champ: 'intitule' })).toBe(
      `OBJECTIF/${O}/intitule`,
    );
    expect(cleEnTexte({ type: 'LIEN_TACHE_OBJECTIF', id: idLien(T, O), champ: 'actif' })).toBe(
      `LIEN_TACHE_OBJECTIF/${T}|${O}/actif`,
    );
  });

  it('UT-COMP-03 elementDeCle — un lien se rattache à sa tâche, les autres à leur élément', () => {
    const cles: ReadonlyArray<readonly [CleInformation, unknown]> = [
      [
        { type: 'OBJECTIF', id: O, champ: 'delai' },
        { type: 'OBJECTIF', id: O },
      ],
      [
        { type: 'TACHE', id: T, champ: 'cycleDeVie' },
        { type: 'TACHE', id: T },
      ],
      [
        { type: 'LIEN_TACHE_OBJECTIF', id: idLien(T, O), champ: 'actif' },
        { type: 'TACHE', id: T },
      ],
    ];

    cles.forEach(([cle, attendu]) => {
      expect(elementDeCle(cle)).toEqual(attendu);
    });
  });
});
