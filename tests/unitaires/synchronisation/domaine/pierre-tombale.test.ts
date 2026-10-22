import { describe, expect, it } from 'vitest';
import type { IdTache } from '@src/commun/domaine/identifiants';
import { contexteDePierreTombale } from '@src/synchronisation/domaine/pierre-tombale';
import type { IdLien } from '@src/synchronisation/domaine/information';
import { etatLocal, registre } from '@tests/support/fabriques/etat-local';
import {
  date,
  hlc,
  idObjectif,
  idTache,
  instant,
  PC,
  SMARTPHONE,
  TROISIEME,
} from '@tests/support/valeurs';

const E = idObjectif(1);
const X = idObjectif(2);
const SOUS_OBJECTIF = idObjectif(3);
const T = idTache(1);
const lien = (t: IdTache, o: typeof E): IdLien => `${t}|${o}` as IdLien;

const h = (minute: number, appareil: typeof PC) =>
  hlc(`2026-10-21T08:${String(minute).padStart(2, '0')}:00.000Z`, 0, appareil);

describe('contexteDePierreTombale (DAT §4.2.1 v0.10.1, H-1)', () => {
  it('UT-SOC-17 contexteDePierreTombale — couvre les écritures de tous les champs de l’élément, sans l’auteur (RG-047)', () => {
    const etat = etatLocal({
      appareilId: SMARTPHONE,
      registres: [
        registre(
          { type: 'OBJECTIF', id: E, champ: 'creation' },
          { creeLe: instant('2026-10-21T08:01:00.000Z') },
          h(1, PC),
        ),
        registre({ type: 'OBJECTIF', id: E, champ: 'intitule' }, 'Publier', h(2, SMARTPHONE), {
          [PC]: h(1, PC),
        }),
        registre({ type: 'OBJECTIF', id: E, champ: 'delai' }, date('2026-12-15'), h(3, PC), {
          [SMARTPHONE]: h(2, SMARTPHONE),
        }),
      ],
    });

    const contexte = contexteDePierreTombale(etat, { type: 'OBJECTIF', id: E }, SMARTPHONE);

    expect(contexte).toEqual({ [PC]: h(3, PC) });
  });

  it('UT-SOC-18 contexteDePierreTombale — couvre, pour un objectif, un lien (t, E) et le placement d’un objectif sous E', () => {
    const etat = etatLocal({
      appareilId: TROISIEME,
      registres: [
        registre(
          { type: 'OBJECTIF', id: E, champ: 'creation' },
          { creeLe: instant('2026-10-21T08:01:00.000Z') },
          h(1, TROISIEME),
        ),
        registre({ type: 'LIEN_TACHE_OBJECTIF', id: lien(T, E), champ: 'actif' }, false, h(5, PC)),
        registre(
          { type: 'OBJECTIF', id: SOUS_OBJECTIF, champ: 'parent' },
          { parentId: E, origine: 'DEPLACEMENT', hlcOrigine: h(6, SMARTPHONE) },
          h(6, SMARTPHONE),
          { [TROISIEME]: h(1, TROISIEME) },
        ),
        registre(
          { type: 'LIEN_TACHE_OBJECTIF', id: lien(T, X), champ: 'actif' },
          true,
          h(9, SMARTPHONE),
        ),
      ],
    });

    const contexte = contexteDePierreTombale(etat, { type: 'OBJECTIF', id: E }, TROISIEME);

    expect(contexte).toEqual({ [PC]: h(5, PC), [SMARTPHONE]: h(6, SMARTPHONE) });
  });

  it('UT-SOC-19 contexteDePierreTombale — couvre, pour une tâche, la création de ses sous-tâches (RG-047)', () => {
    const sousTache = idTache(2);
    const autreTache = idTache(3);
    const etat = etatLocal({
      appareilId: TROISIEME,
      registres: [
        registre(
          { type: 'TACHE', id: T, champ: 'creation' },
          { creeLe: instant('2026-10-21T08:01:00.000Z') },
          h(1, TROISIEME),
        ),
        registre(
          { type: 'TACHE', id: sousTache, champ: 'creation' },
          { creeLe: instant('2026-10-21T08:04:00.000Z'), tacheParenteId: T },
          h(4, PC),
          { [SMARTPHONE]: h(2, SMARTPHONE) },
        ),
        registre(
          { type: 'TACHE', id: autreTache, champ: 'creation' },
          { creeLe: instant('2026-10-21T08:08:00.000Z') },
          h(8, SMARTPHONE),
        ),
      ],
    });

    const contexte = contexteDePierreTombale(etat, { type: 'TACHE', id: T }, TROISIEME);

    expect(contexte).toEqual({ [PC]: h(4, PC), [SMARTPHONE]: h(2, SMARTPHONE) });
  });
});
