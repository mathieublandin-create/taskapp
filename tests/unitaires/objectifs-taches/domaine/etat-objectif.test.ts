import { describe, expect, it } from 'vitest';
import { compteurObjectif, etatObjectif } from '@src/objectifs-taches/domaine/etat-objectif';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { abandonnee, etatMetier, terminee } from '@tests/support/fabriques/etat-metier';
import { idObjectif, idTache } from '@tests/support/valeurs';

const O = idObjectif(1);
const SO = idObjectif(2);
const t = (n: number) => idTache(n);

describe('etatObjectif (RG-025)', () => {
  it('UT-US-001-05 etatObjectif — renvoie A_DECLINER sans tâche ni sous-objectif (US-001 CA-8)', () => {
    const vue = construireVueMetier(etatMetier().avecObjectif({ id: O }).construire());

    expect(etatObjectif(vue, O)).toBe('A_DECLINER');
  });

  it('UT-US-001-06 etatObjectif — renvoie A_DECLINER avec deux tâches abandonnées et sans sous-objectif (RG-025)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecObjectif({ id: O })
        .avecTache({ id: t(1), objectifs: [O], cycleDeVie: abandonnee('2026-10-20', 'op:0') })
        .avecTache({ id: t(2), objectifs: [O], cycleDeVie: abandonnee('2026-10-20', 'op:1') })
        .construire(),
    );

    expect(etatObjectif(vue, O)).toBe('A_DECLINER');
  });

  it('UT-US-001-07 etatObjectif — renvoie EN_COURS avec une tâche à faire et une terminée (RG-025)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecObjectif({ id: O })
        .avecTache({ id: t(1), objectifs: [O] })
        .avecTache({ id: t(2), objectifs: [O], cycleDeVie: terminee('2026-10-20') })
        .construire(),
    );

    expect(etatObjectif(vue, O)).toBe('EN_COURS');
  });

  it('UT-US-001-08 etatObjectif — renvoie ATTEINT avec deux tâches terminées et une abandonnée (RG-025)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecObjectif({ id: O })
        .avecTache({ id: t(1), objectifs: [O], cycleDeVie: terminee('2026-10-20') })
        .avecTache({ id: t(2), objectifs: [O], cycleDeVie: terminee('2026-10-21') })
        .avecTache({ id: t(3), objectifs: [O], cycleDeVie: abandonnee('2026-10-20', 'op:0') })
        .construire(),
    );

    expect(etatObjectif(vue, O)).toBe('ATTEINT');
  });

  it('UT-US-001-09 etatObjectif — renvoie EN_COURS quand une tâche directe terminée a une sous-tâche à faire (US-003 CA-5, RG-049)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecObjectif({ id: O })
        .avecTache({ id: t(1), objectifs: [O], cycleDeVie: terminee('2026-10-20') })
        .avecTache({ id: t(2), tacheParenteId: t(1) })
        .construire(),
    );

    expect(etatObjectif(vue, O)).toBe('EN_COURS');
  });

  it('UT-US-001-10 etatObjectif — renvoie EN_COURS quand toutes les tâches sont terminées mais un sous-objectif est en cours (RG-025, PEP-10)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecObjectif({ id: O })
        .avecObjectif({ id: SO, parentIdEnregistre: O })
        .avecTache({ id: t(1), objectifs: [O], cycleDeVie: terminee('2026-10-20') })
        .avecTache({ id: t(2), objectifs: [SO] })
        .construire(),
    );

    expect(etatObjectif(vue, O)).toBe('EN_COURS');
  });

  it('UT-US-001-10 etatObjectif — renvoie ATTEINT pour un objectif sans tâche propre dont le sous-objectif est atteint (RG-025)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecObjectif({ id: O })
        .avecObjectif({ id: SO, parentIdEnregistre: O })
        .avecTache({ id: t(1), objectifs: [SO], cycleDeVie: terminee('2026-10-20') })
        .construire(),
    );

    expect(etatObjectif(vue, SO)).toBe('ATTEINT');
    expect(etatObjectif(vue, O)).toBe('ATTEINT');
  });

  it('UT-US-001-10 etatObjectif — renvoie EN_COURS quand le sous-objectif est à décliner en tâches (RG-025)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecObjectif({ id: O })
        .avecObjectif({ id: SO, parentIdEnregistre: O })
        .avecTache({ id: t(1), objectifs: [O], cycleDeVie: terminee('2026-10-20') })
        .construire(),
    );

    expect(etatObjectif(vue, SO)).toBe('A_DECLINER');
    expect(etatObjectif(vue, O)).toBe('EN_COURS');
  });

  it('UT-US-001-11 etatObjectif — se termine sur une hiérarchie cyclique transitoire A ↔ B (garde-fou)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecObjectif({ id: O, parentIdEnregistre: SO })
        .avecObjectif({ id: SO, parentIdEnregistre: O })
        .construire(),
    );

    expect(etatObjectif(vue, O)).toBe('EN_COURS');
    expect(etatObjectif(vue, SO)).toBe('EN_COURS');
  });
});

describe('compteurObjectif (US-001 CA-3)', () => {
  it('UT-US-001-12 compteurObjectif — compte 1 terminée sur 2 non abandonnées, tâches directes seulement', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecObjectif({ id: O })
        .avecTache({
          id: t(1),
          intitule: 'Plan',
          objectifs: [O],
          cycleDeVie: terminee('2026-10-20'),
        })
        .avecTache({ id: t(2), intitule: 'Chapitre 1', objectifs: [O] })
        .avecTache({
          id: t(3),
          intitule: 'Section A',
          tacheParenteId: t(2),
          cycleDeVie: terminee('2026-10-20'),
        })
        .avecTache({
          id: t(4),
          intitule: 'Relecture',
          objectifs: [O],
          cycleDeVie: abandonnee('2026-10-20', 'op:0'),
        })
        .construire(),
    );

    expect(compteurObjectif(vue, O)).toEqual({ terminees: 1, nonAbandonnees: 2 });
  });
});
