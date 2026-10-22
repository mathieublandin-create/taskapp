import { describe, expect, it } from 'vitest';
import type { IdObjectif, IdTache } from '@src/commun/domaine/identifiants';
import { actionsObjectif, actionsTache } from '@src/objectifs-taches/domaine/actions';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { abandonnee, etatMetier, terminee } from '@tests/support/fabriques/etat-metier';
import { idObjectif, idTache } from '@tests/support/valeurs';

const PRINCIPAL_AVEC_DELAI = idObjectif(1);
const PRINCIPAL_SANS_DELAI = idObjectif(2);
const SOUS_OBJECTIF = idObjectif(3);
const t = (n: number) => idTache(n);

const vueObjectifs = () =>
  construireVueMetier(
    etatMetier()
      .avecObjectif({ id: PRINCIPAL_AVEC_DELAI, delai: '2026-12-15' })
      .avecObjectif({ id: PRINCIPAL_SANS_DELAI })
      .avecObjectif({ id: SOUS_OBJECTIF, parentIdEnregistre: PRINCIPAL_AVEC_DELAI })
      .construire(),
  );

const vueTaches = () =>
  construireVueMetier(
    etatMetier()
      .avecTache({ id: t(1), intitule: 'À faire' })
      .avecTache({ id: t(2), intitule: 'Terminée', cycleDeVie: terminee('2026-10-20') })
      .avecTache({ id: t(3), intitule: 'Abandonnée', cycleDeVie: abandonnee('2026-10-20', 'op:0') })
      .avecTache({ id: t(4), intitule: 'Sous-tâche à faire', tacheParenteId: t(1) })
      .avecTache({
        id: t(5),
        intitule: 'Sous-tâche terminée sous abandonnée',
        tacheParenteId: t(3),
        cycleDeVie: terminee('2026-10-19'),
      })
      .avecTache({
        id: t(6),
        intitule: 'Sous-tâche abandonnée sous abandonnée',
        tacheParenteId: t(3),
        cycleDeVie: abandonnee('2026-10-20', 'op:1', { abandonParCascade: 'op:0' }),
      })
      .avecTache({
        id: t(7),
        intitule: 'Sous-tâche terminée sous à faire',
        tacheParenteId: t(1),
        cycleDeVie: terminee('2026-10-19'),
      })
      .avecTache({
        id: t(8),
        intitule: 'Sous-tâche abandonnée sous à faire',
        tacheParenteId: t(1),
        cycleDeVie: abandonnee('2026-10-19', 'op:2'),
      })
      .avecTache({
        id: t(9),
        intitule: 'Sous-tâche abandonnée sous terminée',
        tacheParenteId: t(2),
        cycleDeVie: abandonnee('2026-10-19', 'op:3'),
      })
      .construire(),
  );

const actionsDe = (id: IdTache) => actionsTache(vueTaches(), id);
const actionsObj = (id: IdObjectif) => actionsObjectif(vueObjectifs(), id);

describe('actionsObjectif (ST-US-023 §6.4)', () => {
  it('UT-US-001-31 actionsObjectif — propose RETIRER_DELAI seulement pour un objectif qui a un délai, et aucune action d’état (US-001 CA-5, CA-8)', () => {
    expect(actionsObj(PRINCIPAL_AVEC_DELAI)).toEqual([
      'RENOMMER',
      'MODIFIER_DESCRIPTION',
      'MODIFIER_DELAI',
      'RETIRER_DELAI',
      'PLACER',
      'CREER_SOUS_OBJECTIF',
      'SUPPRIMER',
    ]);
    expect(actionsObj(PRINCIPAL_SANS_DELAI)).toEqual([
      'RENOMMER',
      'MODIFIER_DESCRIPTION',
      'MODIFIER_DELAI',
      'PLACER',
      'CREER_SOUS_OBJECTIF',
      'SUPPRIMER',
    ]);
  });

  it('UT-US-023-13 actionsObjectif — un sous-objectif a PLACER mais pas CREER_SOUS_OBJECTIF ; un principal a les deux (US-023 CA-3)', () => {
    expect(actionsObj(SOUS_OBJECTIF)).toContain('PLACER');
    expect(actionsObj(SOUS_OBJECTIF)).not.toContain('CREER_SOUS_OBJECTIF');
    expect(actionsObj(PRINCIPAL_AVEC_DELAI)).toEqual(
      expect.arrayContaining(['PLACER', 'CREER_SOUS_OBJECTIF']),
    );
  });
});

describe('actionsTache (ST-US-024 §6.5, ST-US-003 §6.3, ST-US-025 §6.3)', () => {
  it('UT-US-024-14 actionsTache — pas de CREER_SOUS_TACHE pour une sous-tâche ; CREER_SOUS_TACHE pour une tâche abandonnée sans tâche parente (US-024 CA-1)', () => {
    expect(actionsDe(t(4))).not.toContain('CREER_SOUS_TACHE');
    expect(actionsDe(t(3))).toContain('CREER_SOUS_TACHE');
    expect(actionsDe(t(1))).toContain('CREER_SOUS_TACHE');
  });

  it('UT-US-003-10 actionsTache — TERMINER si et seulement si la tâche est à faire, y compris une tâche parente qui a des sous-tâches à faire (S05)', () => {
    expect(actionsDe(t(1))).toContain('TERMINER');
    expect(actionsDe(t(4))).toContain('TERMINER');
    expect(actionsDe(t(2))).not.toContain('TERMINER');
    expect(actionsDe(t(3))).not.toContain('TERMINER');
  });

  it('UT-US-003-10 actionsTache — ROUVRIR si et seulement si la tâche est terminée et n’est pas la sous-tâche d’une tâche abandonnée (S12b, DEC-030)', () => {
    expect(actionsDe(t(2))).toContain('ROUVRIR');
    expect(actionsDe(t(7))).toContain('ROUVRIR');
    expect(actionsDe(t(5))).not.toContain('ROUVRIR');
    expect(actionsDe(t(1))).not.toContain('ROUVRIR');
    expect(actionsDe(t(3))).not.toContain('ROUVRIR');
  });

  it('UT-US-025-10 actionsTache — ABANDONNER si et seulement si la tâche est à faire (S06)', () => {
    expect(actionsDe(t(1))).toContain('ABANDONNER');
    expect(actionsDe(t(4))).toContain('ABANDONNER');
    expect(actionsDe(t(2))).not.toContain('ABANDONNER');
    expect(actionsDe(t(3))).not.toContain('ABANDONNER');
  });

  it('UT-US-025-10 actionsTache — REPRENDRE si la tâche est abandonnée, sauf sous une tâche parente abandonnée, y compris sous une tâche parente terminée (CA-8, CA-13)', () => {
    expect(actionsDe(t(3))).toContain('REPRENDRE');
    expect(actionsDe(t(8))).toContain('REPRENDRE');
    expect(actionsDe(t(9))).toContain('REPRENDRE');
    expect(actionsDe(t(6))).not.toContain('REPRENDRE');
    expect(actionsDe(t(1))).not.toContain('REPRENDRE');
  });
});
