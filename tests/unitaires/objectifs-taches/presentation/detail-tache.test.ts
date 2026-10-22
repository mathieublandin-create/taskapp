import { describe, expect, it } from 'vitest';
import type { DetailTache } from '@src/objectifs-taches/application/requetes/consulter-detail-tache';
import type { ResumeTache } from '@src/objectifs-taches/application/requetes/resumes';
import { construireDetailTache } from '@src/objectifs-taches/presentation/modeles-de-vue/detail-tache';
import { abandonnee, terminee } from '@tests/support/fabriques/etat-metier';
import { resumeTache } from '@tests/support/fabriques/resumes';
import { horlogeSur } from '@tests/support/horloge';
import { idObjectif, idTache, NEW_YORK } from '@tests/support/valeurs';

const AUJOURDHUI = '2026-10-25T10:00:00.000Z';
const PARENTE = idTache(1);
const t = (n: number) => idTache(n);
const parente = { id: PARENTE, intitule: 'Chapitre 1' };

const detail = (tache: ResumeTache, sousTaches: ReadonlyArray<ResumeTache> = []): DetailTache => ({
  tache,
  sousTaches,
  sousTachesAFaire: sousTaches.filter((s) => s.cycleDeVie.etat === 'A_FAIRE').length,
  actions: [],
});
const modele = (d: DetailTache, aNewYork = false) =>
  construireDetailTache(d, {
    horloge: aNewYork ? horlogeSur(AUJOURDHUI, NEW_YORK) : horlogeSur(AUJOURDHUI),
  });

describe('construireDetailTache (ECR-007)', () => {
  it('UT-US-024-16 construireDetailTache — tâche parente : lignes des sous-tâches, compteur 1 / 3, MEN-ESTIMATION-CALCULEE et ALR-013 (n = 2) (US-024 CA-3, CA-4, CA-8)', () => {
    const tache = resumeTache({
      id: PARENTE,
      intitule: 'Chapitre 1',
      estimationMinutes: 150,
      estimationCalculee: true,
      sousTaches: { terminees: 1, nonAbandonnees: 3 },
    });
    const sousTaches = [
      resumeTache({ id: t(2), cycleDeVie: terminee('2026-10-20'), tacheParente: parente }),
      resumeTache({ id: t(3), tacheParente: parente }),
      resumeTache({ id: t(4), tacheParente: parente }),
    ];

    const m = modele(detail(tache, sousTaches));

    expect(m.sousTaches?.lignes).toHaveLength(3);
    expect(m.sousTaches?.compteur).toMatchObject({ terminees: 1, nonAbandonnees: 3 });
    expect(m.estimation).toMatchObject({
      minutes: 150,
      verrou: { code: 'MEN-ESTIMATION-CALCULEE' },
    });
    expect(m.infoFinImpossible).toMatchObject({ code: 'ALR-013', n: 2 });
  });

  it('UT-US-024-16 construireDetailTache — pas d’ALR-013 quand aucune sous-tâche n’est à faire (US-024 CA-8)', () => {
    const tache = resumeTache({
      id: PARENTE,
      estimationCalculee: true,
      sousTaches: { terminees: 1, nonAbandonnees: 1 },
    });

    const m = modele(
      detail(tache, [
        resumeTache({ id: t(2), cycleDeVie: terminee('2026-10-20'), tacheParente: parente }),
      ]),
    );

    expect(m.infoFinImpossible).toBeUndefined();
  });

  it('UT-US-024-17 construireDetailTache — sous-tâche : objectifs hérités verrouillés (MEN-OBJECTIFS-HERITES) et tâche parente nommée (US-024 CA-7)', () => {
    const sousTache = resumeTache({
      id: t(2),
      tacheParente: parente,
      objectifs: [{ id: idObjectif(1), intitule: 'Publier le guide' }],
      objectifsHerites: true,
    });

    const m = modele(detail(sousTache));

    expect(m.objectifs).toMatchObject({
      intitules: ['Publier le guide'],
      verrou: { code: 'MEN-OBJECTIFS-HERITES' },
    });
    expect(m.tacheParente).toEqual(parente);
    expect(m.sousTaches).toBeUndefined();
  });

  it('UT-US-024-23 construireDetailTache — section SEC-SOUS-TACHES : une seule liste, tous états, ordre de référence ; une sous-tâche terminée garde sa place (guide v0.2.9 §5.8 e)', () => {
    const tache = resumeTache({
      id: PARENTE,
      estimationCalculee: true,
      sousTaches: { terminees: 1, nonAbandonnees: 2 },
    });
    const sousTaches = [
      resumeTache({
        id: t(2),
        intitule: 'À faire 11-20',
        delai: '2026-11-20',
        tacheParente: parente,
      }),
      resumeTache({
        id: t(3),
        intitule: 'Terminée 11-10',
        delai: '2026-11-10',
        cycleDeVie: terminee('2026-10-20'),
        tacheParente: parente,
      }),
      resumeTache({
        id: t(4),
        intitule: 'Abandonnée 11-15',
        delai: '2026-11-15',
        cycleDeVie: abandonnee('2026-10-20', 'op:0'),
        tacheParente: parente,
      }),
    ];

    const m = modele(detail(tache, sousTaches));

    expect(m.sousTaches?.code).toBe('SEC-SOUS-TACHES');
    expect(m.sousTaches?.lignes.map((l) => l.intitule)).toEqual([
      'Terminée 11-10',
      'Abandonnée 11-15',
      'À faire 11-20',
    ]);
  });

  it('UT-US-003-12 construireDetailTache — date de fin avec MEN-HEURE-PARIS à New York, sans à Paris ; jamais de mention sur le délai (RG-054, S21)', () => {
    const tache = resumeTache({ id: PARENTE, cycleDeVie: terminee('2026-10-25') });

    const aNewYork = modele(detail(tache), true);
    const aParis = modele(detail(tache));

    expect(aNewYork.dateFin).toMatchObject({
      date: '2026-10-25',
      mentionHeureParis: { code: 'MEN-HEURE-PARIS' },
    });
    expect(aParis.dateFin?.date).toBe('2026-10-25');
    expect(aParis.dateFin?.mentionHeureParis).toBeUndefined();
    expect('mentionHeureParis' in aNewYork.delai).toBe(false);
  });

  it('UT-US-025-15 construireDetailTache — « Abandonnée le » avec MEN-HEURE-PARIS à New York, sans date de fin, et étiquettes ETA-SOUS-TACHE-* des sous-tâches (US-025 CA-3, CA-5)', () => {
    const tache = resumeTache({
      id: PARENTE,
      cycleDeVie: abandonnee('2026-10-25', 'op:0'),
      sousTaches: { terminees: 1, nonAbandonnees: 1 },
    });
    const sousTaches = [
      resumeTache({
        id: t(2),
        intitule: 'Avec',
        delai: '2026-11-01',
        cycleDeVie: abandonnee('2026-10-25', 'op:1', { abandonParCascade: 'op:0' }),
        tacheParente: parente,
      }),
      resumeTache({
        id: t(3),
        intitule: 'Avant',
        delai: '2026-11-02',
        cycleDeVie: abandonnee('2026-10-20', 'autre:0'),
        tacheParente: parente,
      }),
      resumeTache({
        id: t(4),
        intitule: 'Terminée',
        delai: '2026-11-03',
        cycleDeVie: terminee('2026-10-19'),
        tacheParente: parente,
      }),
    ];

    const m = modele(detail(tache, sousTaches), true);

    expect(m.dateAbandon).toMatchObject({
      date: '2026-10-25',
      mentionHeureParis: { code: 'MEN-HEURE-PARIS' },
    });
    expect(m.dateFin).toBeUndefined();
    expect(m.sousTaches?.lignes.map((l) => [l.intitule, l.etiquette?.code])).toEqual([
      ['Avec', 'ETA-SOUS-TACHE-ABANDONNEE-AVEC'],
      ['Avant', 'ETA-SOUS-TACHE-ABANDONNEE-AVANT'],
      ['Terminée', 'ETA-SOUS-TACHE-TERMINEE-AVANT'],
    ]);
  });

  it('UT-US-024-22 construireDetailTache — carte ALR-003 (terminée) ou ALR-004 (abandonnée) avec n quand le résumé signale une incohérence (RG-049, rang 9)', () => {
    const sousTache = resumeTache({ id: t(2), tacheParente: parente });
    const incoherence = (etatParent: 'TERMINEE' | 'ABANDONNEE') => ({
      etatParent,
      sousTachesAFaire: [{ id: t(2), intitule: 'Section A' }],
    });
    const terminees = resumeTache({
      id: PARENTE,
      cycleDeVie: terminee('2026-10-20'),
      incoherence: incoherence('TERMINEE'),
    });
    const abandonnees = resumeTache({
      id: PARENTE,
      cycleDeVie: abandonnee('2026-10-20', 'op:0'),
      incoherence: incoherence('ABANDONNEE'),
    });

    expect(modele(detail(terminees, [sousTache])).incoherence).toMatchObject({
      code: 'ALR-003',
      n: 1,
    });
    expect(modele(detail(abandonnees, [sousTache])).incoherence).toMatchObject({
      code: 'ALR-004',
      n: 1,
    });
  });
});
