import { describe, expect, it } from 'vitest';
import { estObjectifEnRetard, estTacheEnRetard } from '@src/objectifs-taches/domaine/retard';
import type { Objectif, Tache } from '@src/objectifs-taches/domaine/vue-metier';
import { abandonnee, aFaire, terminee } from '@tests/support/fabriques/etat-metier';
import { date, duree, idObjectif, idTache, instant } from '@tests/support/valeurs';

const objectif = (delai?: string): Objectif => ({
  id: idObjectif(1),
  intitule: 'Publier le guide',
  ...(delai === undefined ? {} : { delai: date(delai) }),
  creeLe: instant('2026-10-01T08:00:00.000Z'),
  enAttente: false,
});

const tache = (cycleDeVie = aFaire()): Tache => ({
  id: idTache(1),
  intitule: 'Rédiger',
  delai: date('2026-10-25'),
  estimationInitiale: duree(60),
  cycleDeVie,
  creeLe: instant('2026-10-01T08:00:00.000Z'),
  enAttente: false,
});

describe('estObjectifEnRetard (RG-045, RG-053)', () => {
  it('UT-US-001-13 estObjectifEnRetard — vrai quand le délai est antérieur au jour et l’objectif non atteint (US-001 CA-7)', () => {
    expect(estObjectifEnRetard(objectif('2026-11-10'), 'EN_COURS', date('2026-11-11'))).toBe(true);
    expect(estObjectifEnRetard(objectif('2026-11-10'), 'A_DECLINER', date('2026-11-11'))).toBe(
      true,
    );
  });

  it('UT-US-001-13 estObjectifEnRetard — faux quand le délai est le jour même, l’objectif atteint ou sans délai (US-001 CA-7)', () => {
    expect(estObjectifEnRetard(objectif('2026-11-10'), 'EN_COURS', date('2026-11-10'))).toBe(false);
    expect(estObjectifEnRetard(objectif('2026-11-10'), 'ATTEINT', date('2026-11-11'))).toBe(false);
    expect(estObjectifEnRetard(objectif(), 'EN_COURS', date('2026-11-11'))).toBe(false);
  });
});

describe('estTacheEnRetard (RG-045)', () => {
  it('UT-US-002-17 estTacheEnRetard — vrai pour une tâche à faire dont le délai est antérieur au jour (US-002 CA-10)', () => {
    expect(estTacheEnRetard(tache(), date('2026-10-26'))).toBe(true);
  });

  it('UT-US-002-17 estTacheEnRetard — faux le jour du délai, et pour une tâche terminée ou abandonnée (US-002 CA-10)', () => {
    expect(estTacheEnRetard(tache(), date('2026-10-25'))).toBe(false);
    expect(estTacheEnRetard(tache(terminee('2026-10-20')), date('2026-10-26'))).toBe(false);
    expect(estTacheEnRetard(tache(abandonnee('2026-10-20', 'op:0')), date('2026-10-26'))).toBe(
      false,
    );
  });
});
