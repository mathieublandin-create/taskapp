import { describe, expect, it } from 'vitest';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import { CONTEXTE_VIDE } from '@src/synchronisation/domaine/contexte-causal';
import type { Modification } from '@src/synchronisation/domaine/modification';
import {
  planifierEcritures,
  type ContextePlanification,
} from '@src/synchronisation/domaine/planifier-ecritures';
import { etatLocal, registre, texteDeCle } from '@tests/support/fabriques/etat-local';
import {
  date,
  duree,
  hlc,
  idEvenementTest,
  idObjectif,
  idOperation,
  idTache,
  instant,
  PC,
  SMARTPHONE,
} from '@tests/support/valeurs';

const O = idObjectif(1);
const X = idObjectif(2);
const OPERATION = idOperation(1);
const INSTANT = '2026-10-21T08:00:00.000Z';
const PHYSIQUE = '2026-10-21T08:05:00.000Z';
const contexte: ContextePlanification = {
  operation: OPERATION,
  instant: instant(INSTANT),
  jour: date('2026-10-21'),
  physiqueCorrigee: instant(PHYSIQUE),
};
const h0 = hlc(PHYSIQUE, 0, SMARTPHONE);
const h1 = hlc(PHYSIQUE, 1, SMARTPHONE);

const creerObjectif = (rang = 0): Modification => ({
  type: 'CREER_OBJECTIF',
  id: O,
  creeLe: instant(INSTANT),
  valeurs: { intitule: 'Publier le guide', delai: date('2026-12-15') },
  evenement: {
    type: 'CREATION',
    element: { type: 'OBJECTIF', id: O },
    avant: {},
    apres: { delai: date('2026-12-15') },
    rang,
  },
});

const objectifExistant = (id: typeof O, appareilHlc = PC) => {
  const hCreation = hlc('2026-10-20T08:00:00.000Z', 0, appareilHlc);
  return [
    registre(
      { type: 'OBJECTIF', id, champ: 'creation' },
      { creeLe: instant('2026-10-20T08:00:00.000Z') },
      hCreation,
    ),
    registre({ type: 'OBJECTIF', id, champ: 'intitule' }, `Objectif ${id}`, hCreation),
    registre(
      { type: 'OBJECTIF', id, champ: 'parent' },
      { origine: 'CREATION', hlcOrigine: hCreation },
      hCreation,
    ),
  ];
};

describe('planifierEcritures (ST-socle-ecriture.md §6.3)', () => {
  it('UT-SOC-20 planifierEcritures — CREER_OBJECTIF écrit creation, intitule, delai et parent, avec le même HLC et un contexte vide, sans description absente (DS-11)', () => {
    const etat = etatLocal({ appareilId: SMARTPHONE, version: 3 });

    const plan = planifierEcritures(etat, [creerObjectif()], contexte);

    const attendus = [
      registre({ type: 'OBJECTIF', id: O, champ: 'creation' }, { creeLe: instant(INSTANT) }, h0),
      registre({ type: 'OBJECTIF', id: O, champ: 'intitule' }, 'Publier le guide', h0),
      registre({ type: 'OBJECTIF', id: O, champ: 'delai' }, date('2026-12-15'), h0),
      registre(
        { type: 'OBJECTIF', id: O, champ: 'parent' },
        { origine: 'CREATION', hlcOrigine: h0 },
        h0,
      ),
    ];
    expect(plan.registresEcrits).toHaveLength(4);
    expect(plan.registresEcrits).toEqual(expect.arrayContaining(attendus));
    expect([...plan.etatApres.registres.values()]).toEqual(expect.arrayContaining(attendus));
    expect(
      plan.etatApres.registres.has(texteDeCle({ type: 'OBJECTIF', id: O, champ: 'description' })),
    ).toBe(false);
    expect(plan.etatApres.dernierHlc).toEqual(h0);
    expect(plan.etatApres.version).toBe(3);
    expect(plan.enAttenteEcrites).toHaveLength(4);
  });

  it('UT-SOC-21 planifierEcritures — donne des HLC strictement croissants à deux modifications, la seconde voyant l’effet de la première (DS-11)', () => {
    const etat = etatLocal({ appareilId: SMARTPHONE });
    const renommer: Modification = {
      type: 'ECRIRE_OBJECTIF',
      id: O,
      ecriture: { champ: 'intitule', valeur: 'Publier le guide v2' },
    };

    const plan = planifierEcritures(etat, [creerObjectif(), renommer], contexte);

    expect(
      plan.etatApres.registres.get(texteDeCle({ type: 'OBJECTIF', id: O, champ: 'intitule' })),
    ).toEqual(
      registre(
        { type: 'OBJECTIF', id: O, champ: 'intitule' },
        'Publier le guide v2',
        h1,
        CONTEXTE_VIDE,
      ),
    );
    expect(plan.etatApres.dernierHlc).toEqual(h1);
  });

  it('UT-SOC-22 planifierEcritures — un déplacement écrit l’origine DEPLACEMENT et l’événement CHANGEMENT_PARENT avec l’avant et l’après (RG-048, RG-050)', () => {
    const hCreation = hlc('2026-10-20T08:00:00.000Z', 0, PC);
    const etat = etatLocal({
      appareilId: SMARTPHONE,
      dernierHlc: hCreation,
      registres: [...objectifExistant(O), ...objectifExistant(X)],
    });
    const deplacer: Modification = {
      type: 'ECRIRE_OBJECTIF',
      id: O,
      ecriture: { champ: 'parent', parentId: X },
      evenement: { type: 'CHANGEMENT_PARENT', element: { type: 'OBJECTIF', id: O }, rang: 0 },
    };

    const plan = planifierEcritures(etat, [deplacer], contexte);

    expect(plan.registresEcrits).toEqual([
      registre(
        { type: 'OBJECTIF', id: O, champ: 'parent' },
        { parentId: X, origine: 'DEPLACEMENT', hlcOrigine: h0 },
        h0,
        { [PC]: hCreation },
      ),
    ]);
    expect(plan.evenementsAjoutes).toEqual([
      {
        type: 'CHANGEMENT_PARENT',
        element: { type: 'OBJECTIF', id: O },
        avant: { origine: 'CREATION', hlcOrigine: hCreation },
        apres: { parentId: X, origine: 'DEPLACEMENT', hlcOrigine: h0 },
        id: idEvenementTest(OPERATION, 0),
        hlc: h0,
        instant: instant(INSTANT),
        jour: date('2026-10-21'),
      },
    ]);
  });

  it('UT-SOC-23 planifierEcritures — identifie un événement par <operation>:<rang>, avec l’HLC de sa modification, l’instant, le jour et la cause convertie (RG-050)', () => {
    const etat = etatLocal({ appareilId: SMARTPHONE });
    const modifierDelai: Modification = {
      type: 'ECRIRE_OBJECTIF',
      id: O,
      ecriture: { champ: 'delai', valeur: date('2027-01-31') },
      evenement: {
        type: 'MODIFICATION_DELAI',
        element: { type: 'OBJECTIF', id: O },
        avant: { delai: date('2026-12-15') },
        apres: { delai: date('2027-01-31') },
        rang: 12,
        cause: 0,
      },
    };

    const plan = planifierEcritures(etat, [creerObjectif(0), modifierDelai], contexte);

    expect(plan.evenementsAjoutes).toEqual([
      {
        type: 'CREATION',
        element: { type: 'OBJECTIF', id: O },
        avant: {},
        apres: { delai: date('2026-12-15') },
        id: idEvenementTest(OPERATION, 0),
        hlc: h0,
        instant: instant(INSTANT),
        jour: date('2026-10-21'),
      },
      {
        type: 'MODIFICATION_DELAI',
        element: { type: 'OBJECTIF', id: O },
        avant: { delai: date('2026-12-15') },
        apres: { delai: date('2027-01-31') },
        id: `${OPERATION}:12`,
        hlc: h1,
        instant: instant(INSTANT),
        jour: date('2026-10-21'),
        cause: `${OPERATION}:0`,
      },
    ]);
    expect([...plan.etatApres.journal.keys()]).toEqual([`${OPERATION}:0`, `${OPERATION}:12`]);
  });

  it('UT-SOC-24 planifierEcritures — lève ErreurProgrammation sur une écriture d’un élément absent', () => {
    const etat = etatLocal({ appareilId: SMARTPHONE });
    const renommer: Modification = {
      type: 'ECRIRE_OBJECTIF',
      id: O,
      ecriture: { champ: 'intitule', valeur: 'A' },
    };

    expect(() => planifierEcritures(etat, [renommer], contexte)).toThrow(ErreurProgrammation);
  });

  it('UT-SOC-24 planifierEcritures — lève ErreurProgrammation sur une écriture d’un élément supprimé', () => {
    const hSuppression = hlc('2026-10-20T09:00:00.000Z', 0, PC);
    const etat = etatLocal({
      appareilId: SMARTPHONE,
      registres: [
        ...objectifExistant(O),
        registre({ type: 'OBJECTIF', id: O, champ: 'suppression' }, true, hSuppression),
      ],
    });
    const renommer: Modification = {
      type: 'ECRIRE_OBJECTIF',
      id: O,
      ecriture: { champ: 'intitule', valeur: 'A' },
    };

    expect(() => planifierEcritures(etat, [renommer], contexte)).toThrow(ErreurProgrammation);
  });

  it('UT-SOC-24 planifierEcritures — lève ErreurProgrammation sur une création en double et sur un lien en double', () => {
    const etat = etatLocal({ appareilId: SMARTPHONE, registres: objectifExistant(O) });
    const T = idTache(1);
    const tacheAvecDoublon: Modification = {
      type: 'CREER_TACHE',
      id: T,
      creeLe: instant(INSTANT),
      valeurs: {
        intitule: 'Rédiger',
        delai: date('2026-11-30'),
        estimationInitiale: duree(60),
        objectifIds: [O, O],
      },
      evenement: {
        type: 'CREATION',
        element: { type: 'TACHE', id: T },
        avant: {},
        apres: { delai: date('2026-11-30'), estimation: duree(60), objectifIds: [O, O] },
        rang: 0,
      },
    };

    expect(() => planifierEcritures(etat, [creerObjectif()], contexte)).toThrow(
      ErreurProgrammation,
    );
    expect(() => planifierEcritures(etat, [tacheAvecDoublon], contexte)).toThrow(
      ErreurProgrammation,
    );
  });
});
