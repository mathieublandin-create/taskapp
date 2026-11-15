import { describe, expect, it } from 'vitest';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import type { Modification } from '@src/synchronisation/domaine/modification';
import {
  PLAN_VIDE,
  planifierEcritures,
  type ContextePlanification,
} from '@src/synchronisation/domaine/planifier-ecritures';
import { etatLocal, registre, texteDeCle } from '@tests/support/fabriques/etat-local';
import { creationObjectif, creationTache, ecritureCycleDeVie } from '@tests/support/modifications';
import {
  date,
  duree,
  hlc,
  idObjectif,
  idOperation,
  idTache,
  instant,
  PC,
  SMARTPHONE,
} from '@tests/support/valeurs';

const O = idObjectif(1);
const T = idTache(1);
const S = idTache(2);
const INSTANT = '2026-10-21T08:00:00.000Z';
const contexte: ContextePlanification = {
  operation: idOperation(1),
  instant: instant(INSTANT),
  jour: date('2026-10-21'),
  physiqueCorrigee: instant(INSTANT),
};
const h0 = hlc(INSTANT, 0, SMARTPHONE);
const etatVide = etatLocal({ appareilId: SMARTPHONE });

const creerO = creationObjectif({ id: O, intitule: 'Objectif' }, instant(INSTANT));
const creerT = creationTache(
  { id: T, intitule: 'Tâche', delai: date('2026-11-30'), estimation: duree(60), objectifIds: [O] },
  instant(INSTANT),
  1,
);
const supprimer = (element: Modification & { type: 'SUPPRIMER' }): Modification => element;

describe('planifierEcritures — compléments (ST-socle-ecriture.md §6.3, §6.5)', () => {
  it('UT-COMP-11 PLAN_VIDE et liste vide — aucune écriture, état inchangé', () => {
    expect(planifierEcritures(etatVide, [], contexte)).toEqual(PLAN_VIDE(etatVide));
  });

  it('UT-COMP-12 CREER_TACHE — écrit la tâche, son cycle de vie A_FAIRE et un lien actif par objectif', () => {
    const plan = planifierEcritures(etatVide, [creerO, creerT], contexte);

    const cles = plan.registresEcrits.map((r) => texteDeCle(r.cle));
    expect(cles).toEqual(
      expect.arrayContaining([
        `TACHE/${T}/creation`,
        `TACHE/${T}/cycleDeVie`,
        `LIEN_TACHE_OBJECTIF/${T}|${O}/actif`,
      ]),
    );
    expect(plan.etatApres.registres.get(`TACHE/${T}/cycleDeVie` as never)?.ecriture.valeur).toEqual(
      {
        etat: 'A_FAIRE',
      },
    );
    expect(plan.etatApres.dernierHlc).toEqual({ ...h0, compteur: 1 });
  });

  it('UT-COMP-13 ECRIRE_TACHE et ECRIRE_LIEN — réécrivent un registre existant avec le contexte de la valeur précédente', () => {
    const base = planifierEcritures(etatVide, [creerO, creerT], contexte).etatApres;
    const apres = planifierEcritures(
      { ...base, appareilId: PC },
      [
        ecritureCycleDeVie(T, { etat: 'A_FAIRE' }),
        { type: 'ECRIRE_LIEN', tacheId: T, objectifId: O, actif: false },
      ],
      { ...contexte, physiqueCorrigee: instant('2026-10-21T09:00:00.000Z') },
    );

    const lien = apres.etatApres.registres.get(`LIEN_TACHE_OBJECTIF/${T}|${O}/actif` as never);
    expect(lien?.ecriture.valeur).toBe(false);
    expect(Object.keys(lien?.ecriture.contexte ?? {})).toEqual([SMARTPHONE]);
  });

  it('UT-COMP-14 SUPPRIMER un élément jamais déposé — retire ses entrées de l’index et écrit la pierre tombale', () => {
    const plan = planifierEcritures(
      etatVide,
      [
        creerO,
        supprimer({
          type: 'SUPPRIMER',
          element: { type: 'OBJECTIF', id: O },
          evenement: {
            type: 'SUPPRESSION',
            element: { type: 'OBJECTIF', id: O },
            avant: {},
            apres: {},
            rang: 1,
          },
        }),
      ],
      contexte,
    );

    expect(plan.etatApres.enAttente.size).toBe(0);
    expect(plan.etatApres.registres.has(`OBJECTIF/${O}/suppression` as never)).toBe(true);
    expect(plan.enAttenteRetirees).toEqual([]);
  });

  it('UT-COMP-15 SUPPRIMER un élément déposé — l’index garde une entrée de suppression et signale les clés retirées', () => {
    const hCreation = hlc('2026-10-20T08:00:00.000Z', 0, PC);
    const etat = etatLocal({
      appareilId: SMARTPHONE,
      registres: [
        registre(
          { type: 'OBJECTIF', id: O, champ: 'creation' },
          { creeLe: instant(INSTANT) },
          hCreation,
        ),
      ],
      enAttente: [
        {
          cle: { type: 'OBJECTIF', id: O, champ: 'intitule' },
          premiereEcriture: instant(INSTANT),
          derniereHlc: hCreation,
        },
      ],
    });

    const plan = planifierEcritures(
      etat,
      [
        supprimer({
          type: 'SUPPRIMER',
          element: { type: 'OBJECTIF', id: O },
          evenement: {
            type: 'SUPPRESSION',
            element: { type: 'OBJECTIF', id: O },
            avant: {},
            apres: {},
            rang: 0,
          },
        }),
      ],
      contexte,
    );

    expect([...plan.etatApres.enAttente.keys()]).toEqual([
      ...etat.enAttente.keys(),
      `OBJECTIF/${O}/suppression`,
    ]);
    expect(plan.enAttenteEcrites).toEqual([`OBJECTIF/${O}/suppression`]);
  });

  it('UT-COMP-16 lève ErreurProgrammation sur un événement en double, un lien vers un élément absent et un CHANGEMENT_PARENT sans placement', () => {
    const doublon: Modification = {
      ...creerO,
      id: idObjectif(9),
    } as Modification;
    const lienAbsent: Modification = {
      type: 'ECRIRE_LIEN',
      tacheId: T,
      objectifId: O,
      actif: true,
    };
    const sousTache = creationTache(
      {
        id: S,
        intitule: 'Sous-tâche',
        delai: date('2026-11-30'),
        estimation: duree(30),
        tacheParenteId: T,
      },
      instant(INSTANT),
      0,
    );

    expect(() => planifierEcritures(etatVide, [creerO, doublon], contexte)).toThrow(
      ErreurProgrammation,
    );
    expect(() => planifierEcritures(etatVide, [lienAbsent], contexte)).toThrow(ErreurProgrammation);
    expect(() => planifierEcritures(etatVide, [sousTache, sousTache], contexte)).toThrow(
      ErreurProgrammation,
    );
  });
});
