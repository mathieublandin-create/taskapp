import { describe, expect, it } from 'vitest';
import type { IdTache } from '@src/commun/domaine/identifiants';
import type { DetailObjectif } from '@src/objectifs-taches/application/requetes/consulter-detail-objectif';
import type {
  ResumeObjectif,
  ResumeTache,
} from '@src/objectifs-taches/application/requetes/resumes';
import { ACTIONS_OBJECTIF, type ActionObjectif } from '@src/objectifs-taches/domaine/actions';
import {
  construireDetailObjectif,
  type LigneDetailObjectif,
} from '@src/objectifs-taches/presentation/modeles-de-vue/detail-objectif';
import { abandonnee, terminee } from '@tests/support/fabriques/etat-metier';
import { creeAuRang, resumeObjectif, resumeTache } from '@tests/support/fabriques/resumes';
import { horlogeSur } from '@tests/support/horloge';
import { idObjectif, idTache } from '@tests/support/valeurs';

const AUJOURDHUI = '2026-10-21T08:00:00.000Z';
const horloge = () => horlogeSur(AUJOURDHUI);
const O = idObjectif(1);
const t = (n: number) => idTache(n);
const ACTIONS_PRINCIPAL_SANS_DELAI: ReadonlyArray<ActionObjectif> = [
  'RENOMMER',
  'MODIFIER_DESCRIPTION',
  'MODIFIER_DELAI',
  'PLACER',
  'CREER_SOUS_OBJECTIF',
  'SUPPRIMER',
];

const detail = (p: {
  readonly objectif?: ResumeObjectif;
  readonly sousObjectifs?: ReadonlyArray<ResumeObjectif>;
  readonly taches?: ReadonlyArray<ResumeTache>;
  readonly sousTaches?: ReadonlyArray<readonly [IdTache, ReadonlyArray<ResumeTache>]>;
  readonly actions?: ReadonlyArray<ActionObjectif>;
}): DetailObjectif => ({
  objectif: p.objectif ?? resumeObjectif({ id: O, intitule: 'Publier le guide' }),
  sousObjectifs: p.sousObjectifs ?? [],
  taches: p.taches ?? [],
  sousTachesPar: new Map(p.sousTaches ?? []),
  actions: p.actions ?? ACTIONS_PRINCIPAL_SANS_DELAI,
});

const vue = (lignes: ReadonlyArray<LigneDetailObjectif>) =>
  lignes.map((l) => [l.intitule, l.niveau]);

describe('construireDetailObjectif (ECR-003)', () => {
  it('UT-US-001-31 construireDetailObjectif — reprend les actions de l’objectif sans délai, toutes de la liste fermée, sans action d’état (US-001 CA-5, CA-8)', () => {
    const modele = construireDetailObjectif(detail({}), { horloge: horloge() });

    expect(modele.actions).toEqual(ACTIONS_PRINCIPAL_SANS_DELAI);
    expect(modele.actions.every((action) => ACTIONS_OBJECTIF.includes(action))).toBe(true);
    expect(modele.delai).toMatchObject({ type: 'SANS_DELAI', code: 'MEN-SANS-DELAI' });
  });

  it('UT-US-023-20 construireDetailObjectif — nomme le parent d’un sous-objectif et liste les sous-objectifs d’un principal (US-023 CA-2)', () => {
    const P = idObjectif(2);
    const sousObjectif = resumeObjectif({
      id: O,
      intitule: 'Version imprimable',
      parentId: P,
      parentIntitule: 'Publier le guide',
    });
    const principal = resumeObjectif({ id: P, intitule: 'Publier le guide' });

    const modeleSous = construireDetailObjectif(detail({ objectif: sousObjectif }), {
      horloge: horloge(),
    });
    const modelePrincipal = construireDetailObjectif(
      detail({ objectif: principal, sousObjectifs: [sousObjectif] }),
      {
        horloge: horloge(),
      },
    );

    expect(modeleSous.niveau).toEqual({
      type: 'SOUS_OBJECTIF',
      parent: { id: P, intitule: 'Publier le guide' },
    });
    expect(modelePrincipal.niveau).toEqual({ type: 'PRINCIPAL' });
    expect(modelePrincipal.sousObjectifs.lignes.map((l) => l.id)).toEqual([O]);
  });

  it('UT-US-023-21 construireDetailObjectif — présente les sous-objectifs dans SEC-SOUS-OBJECTIFS, par l’ordre de référence, atteints compris (guide v0.2.9 §5.8 c)', () => {
    const sousObjectifs = [
      resumeObjectif({ id: idObjectif(2), intitule: 'Sans délai', parentId: O }),
      resumeObjectif({
        id: idObjectif(3),
        intitule: 'Atteint 11-30',
        delai: '2026-11-30',
        etat: 'ATTEINT',
        parentId: O,
      }),
      resumeObjectif({ id: idObjectif(4), intitule: '11-10', delai: '2026-11-10', parentId: O }),
    ];

    const modele = construireDetailObjectif(detail({ sousObjectifs }), { horloge: horloge() });

    expect(modele.sousObjectifs.code).toBe('SEC-SOUS-OBJECTIFS');
    expect(modele.sousObjectifs.lignes.map((l) => l.intitule)).toEqual([
      '11-10',
      'Atteint 11-30',
      'Sans délai',
    ]);
  });

  it('UT-US-002-32 construireDetailObjectif — présente une tâche rattachée à deux objectifs dans le détail de chacun (US-002 CA-6)', () => {
    const O2 = idObjectif(2);
    const tache = resumeTache({
      id: t(1),
      intitule: 'Rédiger l’interview',
      objectifs: [
        { id: O, intitule: 'Publier le guide' },
        { id: O2, intitule: 'Développer mon activité' },
      ],
    });

    const premier = construireDetailObjectif(detail({ taches: [tache] }), { horloge: horloge() });
    const second = construireDetailObjectif(
      detail({
        objectif: resumeObjectif({ id: O2, intitule: 'Développer mon activité' }),
        taches: [tache],
      }),
      { horloge: horloge() },
    );

    expect(premier.taches.aFaire.lignes.map((l) => l.id)).toEqual([t(1)]);
    expect(second.taches.aFaire.lignes.map((l) => l.id)).toEqual([t(1)]);
    expect(premier.etatVide).toBeUndefined();
  });

  it('UT-US-002-32 construireDetailObjectif — produit EVD-OBJECTIF-SANS-TACHE quand l’objectif n’a aucune tâche directe (guide §6.6.5)', () => {
    const modele = construireDetailObjectif(detail({ taches: [] }), { horloge: horloge() });

    expect(modele.etatVide).toEqual({ code: 'EVD-OBJECTIF-SANS-TACHE' });
  });

  it('UT-US-002-33 construireDetailObjectif — répartit les tâches directes en trois sections avec n, triées chacune selon le guide §5.7, sous-tâches d’une tâche à faire juste après elle (guide v0.2.9 §5.8 d)', () => {
    const taches = [
      resumeTache({
        id: t(1),
        intitule: 'À faire 11-30',
        delai: '2026-11-30',
        creeLe: creeAuRang(2),
      }),
      resumeTache({
        id: t(2),
        intitule: 'À faire 11-20',
        delai: '2026-11-20',
        creeLe: creeAuRang(3),
      }),
      resumeTache({ id: t(3), intitule: 'Terminée le 10', cycleDeVie: terminee('2026-10-10') }),
      resumeTache({
        id: t(4),
        intitule: 'Terminée le 18 à 8 h',
        cycleDeVie: terminee('2026-10-18', '2026-10-18T08:00:00.000Z'),
      }),
      resumeTache({
        id: t(5),
        intitule: 'Terminée le 18 à 12 h',
        cycleDeVie: terminee('2026-10-18', '2026-10-18T12:00:00.000Z'),
      }),
      resumeTache({
        id: t(6),
        intitule: 'Abandonnée le 12',
        cycleDeVie: abandonnee('2026-10-12', 'op:0'),
      }),
      resumeTache({
        id: t(7),
        intitule: 'Abandonnée le 19',
        cycleDeVie: abandonnee('2026-10-19', 'op:1'),
      }),
    ];
    const sousTaches = [
      resumeTache({
        id: t(8),
        intitule: 'Sous 11-25',
        delai: '2026-11-25',
        tacheParente: { id: t(1), intitule: 'À faire 11-30' },
      }),
      resumeTache({
        id: t(9),
        intitule: 'Sous 11-22 terminée',
        delai: '2026-11-22',
        cycleDeVie: terminee('2026-10-15'),
        tacheParente: { id: t(1), intitule: 'À faire 11-30' },
      }),
    ];

    const modele = construireDetailObjectif(detail({ taches, sousTaches: [[t(1), sousTaches]] }), {
      horloge: horloge(),
    });

    expect(modele.taches.aFaire).toMatchObject({
      code: 'SEC-TACHES-A-FAIRE',
      n: 2,
      replieeParDefaut: false,
    });
    expect(vue(modele.taches.aFaire.lignes)).toEqual([
      ['À faire 11-20', 'TACHE'],
      ['À faire 11-30', 'TACHE'],
      ['Sous 11-22 terminée', 'SOUS_TACHE'],
      ['Sous 11-25', 'SOUS_TACHE'],
    ]);
    expect(modele.taches.terminees).toMatchObject({
      code: 'SEC-TACHES-TERMINEES',
      n: 3,
      replieeParDefaut: true,
    });
    expect(vue(modele.taches.terminees.lignes)).toEqual([
      ['Terminée le 18 à 12 h', 'TACHE'],
      ['Terminée le 18 à 8 h', 'TACHE'],
      ['Terminée le 10', 'TACHE'],
    ]);
    expect(modele.taches.abandonnees).toMatchObject({
      code: 'SEC-TACHES-ABANDONNEES',
      n: 2,
      replieeParDefaut: true,
    });
    expect(vue(modele.taches.abandonnees.lignes)).toEqual([
      ['Abandonnée le 19', 'TACHE'],
      ['Abandonnée le 12', 'TACHE'],
    ]);
  });

  it('UT-US-002-33 construireDetailObjectif — présente les trois sections même vides, avec n = 0', () => {
    const modele = construireDetailObjectif(detail({ taches: [resumeTache({ id: t(1) })] }), {
      horloge: horloge(),
    });

    expect(modele.taches.terminees).toMatchObject({
      code: 'SEC-TACHES-TERMINEES',
      n: 0,
      lignes: [],
    });
    expect(modele.taches.abandonnees).toMatchObject({
      code: 'SEC-TACHES-ABANDONNEES',
      n: 0,
      lignes: [],
    });
  });

  it('UT-US-002-35 construireDetailObjectif — sous une tâche parente terminée ou abandonnée, aucune ligne de sous-tâche, seulement le compteur t / n (Q-US-002-4 a, guide v0.2.10 §5.8 d)', () => {
    const taches = [
      resumeTache({
        id: t(1),
        intitule: 'Terminée',
        cycleDeVie: terminee('2026-10-18'),
        sousTaches: { terminees: 2, nonAbandonnees: 2 },
      }),
      resumeTache({
        id: t(2),
        intitule: 'Abandonnée',
        cycleDeVie: abandonnee('2026-10-19', 'op:0'),
        sousTaches: { terminees: 1, nonAbandonnees: 1 },
      }),
    ];
    const sousTerminee = resumeTache({
      id: t(3),
      cycleDeVie: terminee('2026-10-17'),
      tacheParente: { id: t(1), intitule: 'Terminée' },
    });
    const sousAbandonnee = resumeTache({
      id: t(4),
      cycleDeVie: abandonnee('2026-10-19', 'op:1', { abandonParCascade: 'op:0' }),
      tacheParente: { id: t(2), intitule: 'Abandonnée' },
    });

    const modele = construireDetailObjectif(
      detail({
        taches,
        sousTaches: [
          [t(1), [sousTerminee]],
          [t(2), [sousAbandonnee]],
        ],
      }),
      { horloge: horloge() },
    );

    expect(vue(modele.taches.terminees.lignes)).toEqual([['Terminée', 'TACHE']]);
    expect(vue(modele.taches.abandonnees.lignes)).toEqual([['Abandonnée', 'TACHE']]);
    expect(modele.taches.terminees.lignes[0]?.compteurSousTaches).toMatchObject({
      terminees: 2,
      nonAbandonnees: 2,
    });
    expect(modele.taches.abandonnees.lignes[0]?.compteurSousTaches).toMatchObject({
      terminees: 1,
      nonAbandonnees: 1,
    });
  });
});
