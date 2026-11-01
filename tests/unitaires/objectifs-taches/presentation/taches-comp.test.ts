import { describe, expect, it } from 'vitest';
import type { DetailTache } from '@src/objectifs-taches/application/requetes/consulter-detail-tache';
import { formaterDuree } from '@src/commun/presentation/format/duree';
import { construireDetailTache } from '@src/objectifs-taches/presentation/modeles-de-vue/detail-tache';
import { construireLigneTache } from '@src/objectifs-taches/presentation/modeles-de-vue/ligne-tache';
import { construireListeTaches } from '@src/objectifs-taches/presentation/modeles-de-vue/liste-taches';
import { comparerParFinDecroissante } from '@src/objectifs-taches/presentation/modeles-de-vue/ordre-reference';
import { abandonnee, terminee } from '@tests/support/fabriques/etat-metier';
import { resumeTache } from '@tests/support/fabriques/resumes';
import { horlogeSur } from '@tests/support/horloge';
import { date, duree, idObjectif, idTache } from '@tests/support/valeurs';

const t = (n: number) => idTache(n);
const AUJOURDHUI = date('2026-10-21');
const horloge = horlogeSur('2026-10-21T08:00:00.000Z');

describe('Tâches — compléments de la présentation (US-002)', () => {
  it.each([
    [0, '0 h'],
    [30, '30 min'],
    [60, '1 h'],
    [90, '1 h 30'],
    [150, '2 h 30'],
  ])('UT-COMP-US-002-40 formaterDuree — %d min s’écrit « %s »', (minutes, attendu) => {
    expect(formaterDuree(duree(minutes))).toBe(attendu);
  });

  it('UT-COMP-US-002-41 comparerParFinDecroissante — une tâche à faire, sans date de fin, se classe après les autres par la création', () => {
    const aFaire = resumeTache({ id: t(1) });

    expect(comparerParFinDecroissante(aFaire, resumeTache({ id: t(2) }))).toBeLessThan(0);
    expect(
      comparerParFinDecroissante(
        resumeTache({ id: t(3), cycleDeVie: terminee('2026-10-20') }),
        resumeTache({ id: t(4), cycleDeVie: terminee('2026-10-20') }),
      ),
    ).toBeLessThan(0);
  });

  it('UT-COMP-US-002-42 construireLigneTache — nom accessible « intitulé, état, délai » avec « en retard » ; états terminée et abandonnée en toutes lettres', () => {
    const enRetard = construireLigneTache(
      resumeTache({ id: t(1), intitule: 'Payer', delai: '2026-10-19', enRetard: true }),
      AUJOURDHUI,
    );
    const finie = construireLigneTache(
      resumeTache({ id: t(2), intitule: 'Plan', cycleDeVie: terminee('2026-10-18') }),
      AUJOURDHUI,
    );
    const abandonnee1 = construireLigneTache(
      resumeTache({ id: t(3), intitule: 'Logo', cycleDeVie: abandonnee('2026-10-12', 'op:0') }),
      AUJOURDHUI,
    );

    expect(enRetard.nomAccessible).toBe('Payer, à faire, délai 19 oct., en retard, estimation 1 h');
    expect(finie.nomAccessible).toMatch(/^Plan, terminée, délai /);
    expect(abandonnee1.nomAccessible).toMatch(/^Logo, abandonnée, délai /);
  });

  it('UT-COMP-US-002-95 construireLigneTache — nom accessible ETA-TACHE-LIGNE : une partie par information affichée, dans l’ordre du guide §6.6.4', () => {
    const ligne = construireLigneTache(
      resumeTache({
        id: t(1),
        intitule: 'Corriger les illustrations',
        delai: '2026-11-12',
        estimationMinutes: 120,
        enRetard: true,
        objectifs: [
          { id: idObjectif(1), intitule: 'Publier le guide' },
          { id: idObjectif(2), intitule: 'Autre' },
        ],
        sousTaches: { terminees: 1, nonAbandonnees: 3 },
        alertes: [
          {
            type: 'OBJECTIFS',
            objectifs: [
              { id: idObjectif(1), intitule: 'Publier le guide', delai: date('2026-11-01') },
            ],
          },
        ],
      }),
      AUJOURDHUI,
    );
    const sousTache = construireLigneTache(
      resumeTache({
        id: t(2),
        intitule: 'Section A',
        delai: '2026-11-12',
        objectifs: [{ id: idObjectif(1), intitule: 'Publier le guide' }],
        objectifsHerites: true,
        alertes: [
          {
            type: 'TACHE_PARENTE',
            tache: { id: t(1), intitule: 'Chapitre', delai: date('2026-11-01') },
          },
        ],
      }),
      AUJOURDHUI,
    );
    const incoherente = construireLigneTache(
      resumeTache({
        id: t(4),
        intitule: 'Plan',
        cycleDeVie: terminee('2026-10-18'),
        incoherence: { etatParent: 'TERMINEE', sousTachesAFaire: [] },
      }),
      AUJOURDHUI,
    );
    const objectifUnique = construireLigneTache(
      resumeTache({
        id: t(3),
        intitule: 'Plan',
        objectifs: [{ id: idObjectif(1), intitule: 'Publier le guide' }],
        sousTaches: { terminees: 0, nonAbandonnees: 1 },
      }),
      AUJOURDHUI,
    );

    expect(ligne.nomAccessible).toBe(
      'Corriger les illustrations, à faire, délai 12 nov., en retard, après le délai de l’objectif, estimation 2 h, 2 objectifs, dont «\u00a0Publier le guide\u00a0», 1 sous-tâche terminée sur 3',
    );
    expect(incoherente.nomAccessible).toBe(
      'Plan, terminée, délai 31 déc., estimation 1 h, incohérence avec une sous-tâche',
    );
    expect(sousTache.nomAccessible).toBe(
      'Section A, à faire, délai 12 nov., après le délai de la tâche parente, estimation 1 h',
    );
    expect(objectifUnique.nomAccessible).toContain(
      'objectif «\u00a0Publier le guide\u00a0», 0 sous-tâche terminée sur 1',
    );
  });

  it('UT-COMP-US-002-43 construireLigneTache — ALR-006, compteur de sous-tâches, estimation calculée et mention en attente', () => {
    const ligne = construireLigneTache(
      resumeTache({
        id: t(1),
        estimationCalculee: true,
        estimationMinutes: 150,
        enAttente: true,
        sousTaches: { terminees: 1, nonAbandonnees: 3 },
        alertes: [
          {
            type: 'TACHE_PARENTE',
            tache: { id: t(2), intitule: 'Chapitre 1', delai: date('2026-11-30') },
          },
        ],
      }),
      AUJOURDHUI,
    );

    expect(ligne.alertes).toMatchObject([{ code: 'ALR-006', tache: 'Chapitre 1' }]);
    expect(ligne.compteurSousTaches).toMatchObject({ libelle: '1/3' });
    expect(ligne.estimation).toMatchObject({ libelle: '2 h 30', calculee: true });
    expect(ligne.attente?.code).toBe('MEN-ATTENTE');
  });

  it('UT-COMP-US-002-44 construireDetailTache — tâche simple : champs modifiables, alertes du délai et actions ; tâche parente : estimation verrouillée', () => {
    const simple: DetailTache = {
      tache: resumeTache({
        id: t(1),
        intitule: 'Rédiger',
        enRetard: true,
        objectifs: [{ id: idObjectif(1), intitule: 'Publier le guide' }],
      }),
      sousTaches: [],
      sousTachesAFaire: 0,
      actions: ['RENOMMER', 'SUPPRIMER'],
    };
    const parente: DetailTache = {
      ...simple,
      tache: resumeTache({
        id: t(2),
        estimationCalculee: true,
        estimationMinutes: 90,
        tacheParente: { id: t(3), intitule: 'Chapitre 1' },
      }),
    };

    const modeleSimple = construireDetailTache(simple, { horloge });
    const modeleParente = construireDetailTache(parente, { horloge });

    expect(modeleSimple).toMatchObject({
      intitule: 'Rédiger',
      etat: { code: 'ETA-TACHE-A-FAIRE' },
      enRetard: { code: 'MEN-EN-RETARD' },
      objectifs: { intitules: ['Publier le guide'] },
      actions: ['RENOMMER', 'SUPPRIMER'],
    });
    expect(modeleSimple.estimation.verrou).toBeUndefined();
    expect(modeleParente.estimation.verrou?.code).toBe('MEN-ESTIMATION-CALCULEE');
    expect(modeleParente.tacheParente).toEqual({ id: t(3), intitule: 'Chapitre 1' });
  });

  it('UT-COMP-US-002-45 construireListeTaches — filtre « terminée » avec la mention de l’heure de Paris hors de Paris ; sous-titre « plus récentes d’abord »', () => {
    const modele = construireListeTaches(
      {
        taches: [resumeTache({ id: t(1), cycleDeVie: terminee('2026-10-20') })],
        existeAuMoinsUnObjectif: true,
      },
      { etat: 'TERMINEE', objectif: { type: 'TOUS' } },
      { horloge: horlogeSur('2026-10-21T08:00:00.000Z', 'America/New_York' as never) },
    );

    expect(modele.sousTitre.libelle).toBe('Plus récentes d’abord');
    expect(modele.mentionHeureParis?.code).toBe('MEN-HEURE-PARIS');
    expect(modele.etatVide).toBeUndefined();
  });
});
