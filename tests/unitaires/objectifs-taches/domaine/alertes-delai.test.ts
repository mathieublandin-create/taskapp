import { describe, expect, it } from 'vitest';
import {
  alerteDelaiObjectif,
  alertesDelaiTache,
} from '@src/objectifs-taches/domaine/alertes-delai';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { etatMetier } from '@tests/support/fabriques/etat-metier';
import { date, idObjectif, idTache } from '@tests/support/valeurs';

const PARENT = idObjectif(1);
const SOUS = idObjectif(2);
const PUBLIER = idObjectif(1);
const DEVELOPPER = idObjectif(2);
const T = idTache(1);
const PARENTE = idTache(2);

const vueSousObjectif = (delaiParent?: string, delaiSous?: string, parentSupprime = false) =>
  construireVueMetier(
    etatMetier()
      .avecObjectif({
        id: PARENT,
        intitule: 'Publier le guide',
        ...(delaiParent === undefined ? {} : { delai: delaiParent }),
        supprime: parentSupprime,
      })
      .avecObjectif({
        id: SOUS,
        intitule: 'Version imprimable',
        parentIdEnregistre: PARENT,
        ...(delaiSous === undefined ? {} : { delai: delaiSous }),
      })
      .construire(),
  );

const vueTache = (delaiTache: string, delaiDevelopper?: string, developperSupprime = false) =>
  construireVueMetier(
    etatMetier()
      .avecObjectif({ id: PUBLIER, intitule: 'Publier le guide', delai: '2026-11-20' })
      .avecObjectif({
        id: DEVELOPPER,
        intitule: 'Développer mon activité',
        supprime: developperSupprime,
        ...(delaiDevelopper === undefined ? {} : { delai: delaiDevelopper }),
      })
      .avecTache({
        id: T,
        intitule: 'Rédiger l’interview',
        delai: delaiTache,
        objectifs: [PUBLIER, DEVELOPPER],
      })
      .construire(),
  );

const publier = { id: PUBLIER, intitule: 'Publier le guide', delai: date('2026-11-20') };

describe('alerteDelaiObjectif (RG-022, US-023 CA-4)', () => {
  it('UT-US-023-11 alerteDelaiObjectif — alerte quand le délai du sous-objectif est postérieur à celui du parent (S05)', () => {
    expect(alerteDelaiObjectif(vueSousObjectif('2026-12-15', '2027-01-15'), SOUS)).toEqual({
      parentId: PARENT,
      parentIntitule: 'Publier le guide',
      delaiParent: date('2026-12-15'),
    });
  });

  it.each([
    ['2026-12-15', '2026-12-15'],
    ['2026-12-15', '2026-12-01'],
    ['2026-12-15', undefined],
    [undefined, '2027-01-15'],
  ])(
    'UT-US-023-11 alerteDelaiObjectif — aucune alerte pour un parent de délai %s et un sous-objectif de délai %s (S05)',
    (delaiParent, delaiSous) => {
      expect(alerteDelaiObjectif(vueSousObjectif(delaiParent, delaiSous), SOUS)).toBeUndefined();
    },
  );

  it('UT-US-023-12 alerteDelaiObjectif — aucune alerte quand le parent est supprimé (devenu principal, RG-046)', () => {
    expect(
      alerteDelaiObjectif(vueSousObjectif('2026-12-15', '2027-01-15', true), SOUS),
    ).toBeUndefined();
  });
});

describe('alertesDelaiTache (RG-024, RG-023)', () => {
  it.each([
    [
      '2026-11-25',
      '2026-11-30',
      [publier, { id: DEVELOPPER, intitule: 'Développer mon activité', delai: date('2026-11-25') }],
    ],
    ['2026-12-31', '2026-11-30', [publier]],
    [undefined, '2026-11-30', [publier]],
  ])(
    'UT-US-002-14 alertesDelaiTache — second objectif de délai %s, tâche de délai %s : alerte ALR-005 sur les objectifs dépassés (S08)',
    (delaiDevelopper, delaiTache, objectifs) => {
      expect(alertesDelaiTache(vueTache(delaiTache, delaiDevelopper), T)).toEqual([
        { type: 'OBJECTIFS', objectifs },
      ]);
    },
  );

  it.each([
    [undefined, '2026-11-20'],
    ['2026-12-31', '2026-11-10'],
  ])(
    'UT-US-002-14 alertesDelaiTache — second objectif de délai %s, tâche de délai %s : aucune alerte (S08)',
    (delaiDevelopper, delaiTache) => {
      expect(alertesDelaiTache(vueTache(delaiTache, delaiDevelopper), T)).toEqual([]);
    },
  );

  it('UT-US-002-15 alertesDelaiTache — ignore un objectif supprimé et un délai égal (RG-024)', () => {
    expect(alertesDelaiTache(vueTache('2026-11-20', '2026-11-01', true), T)).toEqual([]);
  });

  it('UT-US-002-16 alertesDelaiTache — alerte une sous-tâche sur les objectifs hérités de sa tâche parente (RG-024, RG-023)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecObjectif({ id: PUBLIER, intitule: 'Publier le guide', delai: '2026-11-20' })
        .avecTache({
          id: PARENTE,
          intitule: 'Chapitre 1',
          delai: '2026-12-10',
          objectifs: [PUBLIER],
        })
        .avecTache({ id: T, intitule: 'Section A', delai: '2026-12-05', tacheParenteId: PARENTE })
        .construire(),
    );

    expect(alertesDelaiTache(vue, T)).toEqual([{ type: 'OBJECTIFS', objectifs: [publier] }]);
  });

  it('UT-US-024-13 alertesDelaiTache — alerte ALR-006 quand le délai de la sous-tâche dépasse celui de sa tâche parente ; aucune si égal ou antérieur (US-024 CA-6)', () => {
    const vue = (delaiSousTache: string) =>
      construireVueMetier(
        etatMetier()
          .avecTache({ id: PARENTE, intitule: 'Chapitre 1', delai: '2026-11-30' })
          .avecTache({
            id: T,
            intitule: 'Section A',
            delai: delaiSousTache,
            tacheParenteId: PARENTE,
          })
          .construire(),
      );

    expect(alertesDelaiTache(vue('2026-12-05'), T)).toEqual([
      {
        type: 'TACHE_PARENTE',
        tache: { id: PARENTE, intitule: 'Chapitre 1', delai: date('2026-11-30') },
      },
    ]);
    expect(alertesDelaiTache(vue('2026-11-30'), T)).toEqual([]);
    expect(alertesDelaiTache(vue('2026-11-20'), T)).toEqual([]);
  });
});
