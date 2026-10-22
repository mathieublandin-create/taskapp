import { describe, expect, it } from 'vitest';
import type { IdObjectif, IdTache } from '@src/commun/domaine/identifiants';
import type { EtatMetier } from '@src/synchronisation/domaine/etat-metier';
import type { IdLien } from '@src/synchronisation/domaine/information';
import { projeterEtatMetier } from '@src/synchronisation/domaine/projection';
import { etatLocal, registre } from '@tests/support/fabriques/etat-local';
import {
  date,
  duree,
  hlc,
  idObjectif,
  idTache,
  instant,
  PC,
  SMARTPHONE,
} from '@tests/support/valeurs';

const O1 = idObjectif(1);
const O2 = idObjectif(2);
const O3 = idObjectif(3);
const T = idTache(1);
const lien = (t: IdTache, o: IdObjectif): IdLien => `${t}|${o}` as IdLien;
const h = (minute: number) =>
  hlc(`2026-10-21T08:${String(minute).padStart(2, '0')}:00.000Z`, 0, PC);
const CREE_LE = instant('2026-10-21T08:00:00.000Z');

const registresObjectif = (id: IdObjectif, intitule: string, parentId?: IdObjectif) => [
  registre({ type: 'OBJECTIF', id, champ: 'creation' }, { creeLe: CREE_LE }, h(0)),
  registre({ type: 'OBJECTIF', id, champ: 'intitule' }, intitule, h(1)),
  registre(
    { type: 'OBJECTIF', id, champ: 'parent' },
    { ...(parentId === undefined ? {} : { parentId }), origine: 'CREATION', hlcOrigine: h(0) },
    h(0),
  ),
];

const registresTache = [
  registre({ type: 'TACHE', id: T, champ: 'creation' }, { creeLe: CREE_LE }, h(0)),
  registre({ type: 'TACHE', id: T, champ: 'intitule' }, 'Rédiger', h(0)),
  registre({ type: 'TACHE', id: T, champ: 'delai' }, date('2026-11-30'), h(0)),
  registre({ type: 'TACHE', id: T, champ: 'estimationInitiale' }, duree(90), h(0)),
  registre({ type: 'TACHE', id: T, champ: 'cycleDeVie' }, { etat: 'A_FAIRE' }, h(0)),
];

describe('projeterEtatMetier (ST-socle-ecriture.md §6.6)', () => {
  it('UT-SOC-31 projeterEtatMetier — projette les valeurs gagnantes, la suppression, le parent enregistré brut et les liens actifs par HLC d’activation (ADR-003)', () => {
    const etat = etatLocal({
      appareilId: SMARTPHONE,
      registres: [
        ...registresObjectif(O1, 'Publier le guide', O2),
        registre({ type: 'OBJECTIF', id: O1, champ: 'description' }, undefined, h(2)),
        registre({ type: 'OBJECTIF', id: O1, champ: 'delai' }, date('2026-12-15'), h(2)),
        ...registresObjectif(O2, 'Développer mon activité'),
        registre({ type: 'OBJECTIF', id: O2, champ: 'suppression' }, true, h(9)),
        ...registresObjectif(O3, 'Lancer le site'),
        ...registresTache,
        registre({ type: 'LIEN_TACHE_OBJECTIF', id: lien(T, O1), champ: 'actif' }, true, h(5)),
        registre({ type: 'LIEN_TACHE_OBJECTIF', id: lien(T, O2), champ: 'actif' }, true, h(3)),
        registre({ type: 'LIEN_TACHE_OBJECTIF', id: lien(T, O3), champ: 'actif' }, false, h(4)),
      ],
    });

    const metier = projeterEtatMetier(etat);

    const attendu: EtatMetier = {
      objectifs: new Map([
        [
          O1,
          {
            id: O1,
            intitule: 'Publier le guide',
            delai: date('2026-12-15'),
            parentIdEnregistre: O2,
            creeLe: CREE_LE,
            supprime: false,
            enAttente: false,
          },
        ],
        [
          O2,
          {
            id: O2,
            intitule: 'Développer mon activité',
            creeLe: CREE_LE,
            supprime: true,
            enAttente: false,
          },
        ],
        [
          O3,
          {
            id: O3,
            intitule: 'Lancer le site',
            creeLe: CREE_LE,
            supprime: false,
            enAttente: false,
          },
        ],
      ]),
      taches: new Map([
        [
          T,
          {
            id: T,
            intitule: 'Rédiger',
            delai: date('2026-11-30'),
            estimationInitiale: duree(90),
            cycleDeVie: { etat: 'A_FAIRE' },
            objectifIdsActifs: [O2, O1],
            creeLe: CREE_LE,
            supprime: false,
            enAttente: false,
          },
        ],
      ]),
    };
    expect(metier).toEqual(attendu);
  });

  it('UT-SOC-32 projeterEtatMetier — marque en attente un élément de l’index, y compris une tâche dont seul un lien est en attente (DAT §4.1.5 bis)', () => {
    const etat = etatLocal({
      appareilId: SMARTPHONE,
      registres: [
        ...registresObjectif(O1, 'Publier le guide'),
        ...registresObjectif(O2, 'Développer mon activité'),
        ...registresTache,
        registre({ type: 'LIEN_TACHE_OBJECTIF', id: lien(T, O1), champ: 'actif' }, true, h(5)),
      ],
      enAttente: [
        {
          cle: { type: 'LIEN_TACHE_OBJECTIF', id: lien(T, O1), champ: 'actif' },
          premiereEcriture: CREE_LE,
          derniereHlc: h(5),
        },
        {
          cle: { type: 'OBJECTIF', id: O2, champ: 'intitule' },
          premiereEcriture: CREE_LE,
          derniereHlc: h(6),
        },
      ],
    });

    const metier = projeterEtatMetier(etat);

    expect(metier.taches.get(T)?.enAttente).toBe(true);
    expect(metier.objectifs.get(O1)?.enAttente).toBe(false);
    expect(metier.objectifs.get(O2)?.enAttente).toBe(true);
  });
});
