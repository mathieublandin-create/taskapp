import { describe, expect, it } from 'vitest';
import {
  contexteDePierreTombale,
  descendantsSupprimesParDerivation,
} from '@src/synchronisation/domaine/pierre-tombale';
import { projeterEtatMetier } from '@src/synchronisation/domaine/projection';
import { planifierEcritures } from '@src/synchronisation/domaine/planifier-ecritures';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import { etatLocal, registre } from '@tests/support/fabriques/etat-local';
import {
  date,
  hlc,
  idObjectif,
  idOperation,
  idTache,
  instant,
  PC,
  SMARTPHONE,
} from '@tests/support/valeurs';

const T = idTache(1);
const S1 = idTache(2);
const S2 = idTache(3);
const O = idObjectif(1);
const h = hlc('2026-10-20T08:00:00.000Z', 0, PC);
const CREE_LE = instant('2026-10-20T08:00:00.000Z');

const creationTache = (id: typeof T, tacheParenteId?: typeof T) =>
  registre(
    { type: 'TACHE', id, champ: 'creation' },
    { creeLe: CREE_LE, ...(tacheParenteId === undefined ? {} : { tacheParenteId }) },
    h,
  );

describe('Pierres tombales, projection et événements — compléments', () => {
  it('UT-COMP-70 descendantsSupprimesParDerivation — sous-tâches non supprimées d’une tâche ; rien pour un objectif', () => {
    const etat = etatLocal({
      appareilId: SMARTPHONE,
      registres: [
        creationTache(T),
        creationTache(S1, T),
        creationTache(S2, T),
        registre({ type: 'TACHE', id: S2, champ: 'suppression' }, true, h),
      ],
    });

    expect(descendantsSupprimesParDerivation(etat, { type: 'TACHE', id: T })).toEqual([
      { type: 'TACHE', id: S1 },
    ]);
    expect(descendantsSupprimesParDerivation(etat, { type: 'OBJECTIF', id: O })).toEqual([]);
  });

  it('UT-COMP-71 contexteDePierreTombale — ignore les registres qui ne pointent pas vers l’élément', () => {
    const etat = etatLocal({
      appareilId: SMARTPHONE,
      registres: [
        creationTache(T),
        creationTache(S1),
        registre(
          { type: 'LIEN_TACHE_OBJECTIF', id: `${T}|${O}` as never, champ: 'actif' },
          true,
          hlc('2026-10-20T09:00:00.000Z', 0, PC),
        ),
      ],
    });

    const contexte = contexteDePierreTombale(etat, { type: 'TACHE', id: T }, SMARTPHONE);

    expect(Object.keys(contexte)).toEqual([PC]);
    expect(contexte[PC]).toEqual(h);
  });

  it('UT-COMP-72 projeterEtatMetier — ignore un élément sans les champs obligatoires', () => {
    const etat = etatLocal({
      appareilId: SMARTPHONE,
      registres: [
        registre({ type: 'OBJECTIF', id: O, champ: 'creation' }, { creeLe: CREE_LE }, h),
        creationTache(T),
        registre({ type: 'TACHE', id: T, champ: 'intitule' }, 'Sans délai', h),
      ],
    });

    const metier = projeterEtatMetier(etat);

    expect(metier.objectifs.size).toBe(0);
    expect(metier.taches.size).toBe(0);
  });

  it('UT-COMP-73 planifierEcritures — un CHANGEMENT_PARENT sans placement enregistré est une erreur de programmation', () => {
    const etat = etatLocal({
      appareilId: SMARTPHONE,
      registres: [
        registre({ type: 'OBJECTIF', id: O, champ: 'creation' }, { creeLe: CREE_LE }, h),
        registre({ type: 'OBJECTIF', id: O, champ: 'intitule' }, 'Sans placement', h),
      ],
    });

    expect(() =>
      planifierEcritures(
        etat,
        [
          {
            type: 'ECRIRE_OBJECTIF',
            id: O,
            ecriture: { champ: 'delai', valeur: date('2027-01-31') },
            evenement: { type: 'CHANGEMENT_PARENT', element: { type: 'OBJECTIF', id: O }, rang: 0 },
          },
        ],
        {
          operation: idOperation(1),
          instant: CREE_LE,
          jour: date('2026-10-20'),
          physiqueCorrigee: CREE_LE,
        },
      ),
    ).toThrow(ErreurProgrammation);
  });
});
