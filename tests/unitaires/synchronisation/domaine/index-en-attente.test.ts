import { describe, expect, it } from 'vitest';
import type { IdObjectif, IdTache } from '@src/commun/domaine/identifiants';
import {
  decompterModificationsEnAttente,
  enregistrerEnAttente,
  plusAncienneModificationEnAttente,
  purgerPourSuppression,
} from '@src/synchronisation/domaine/index-en-attente';
import type { CleInformation, IdLien } from '@src/synchronisation/domaine/information';
import { indexEnAttente, texteDeCle } from '@tests/support/fabriques/etat-local';
import { hlc, idObjectif, idTache, instant, SMARTPHONE } from '@tests/support/valeurs';

const X = idObjectif(1);
const O = idObjectif(2);
const T = idTache(1);
const SOUS_TACHE = idTache(2);
const lien = (t: IdTache, o: IdObjectif): IdLien => `${t}|${o}` as IdLien;
const h = (minute: number) =>
  hlc(`2026-10-21T08:${String(minute).padStart(2, '0')}:00.000Z`, 0, SMARTPHONE);
const i = (minute: number) => instant(`2026-10-21T08:${String(minute).padStart(2, '0')}:00.000Z`);
const entree = (cle: CleInformation, minute: number) => ({
  cle,
  premiereEcriture: i(minute),
  derniereHlc: h(minute),
});

describe('Index des écritures en attente (DAT §4.1.5 bis, H-4)', () => {
  it('UT-SOC-25 enregistrerEnAttente — conserve premiereEcriture et remplace derniereHlc quand l’information est réécrite (RG-057, DEC-025)', () => {
    const cle: CleInformation = { type: 'OBJECTIF', id: X, champ: 'intitule' };
    const autreCle: CleInformation = { type: 'OBJECTIF', id: X, champ: 'delai' };
    const index = indexEnAttente([entree(cle, 1)]);

    const apres = enregistrerEnAttente(
      enregistrerEnAttente(index, cle, h(5), i(5)),
      autreCle,
      h(6),
      i(6),
    );

    expect(apres.get(texteDeCle(cle))).toEqual({
      cle,
      entree: { premiereEcriture: i(1), derniereHlc: h(5) },
    });
    expect(apres.get(texteDeCle(autreCle))).toEqual({
      cle: autreCle,
      entree: { premiereEcriture: i(6), derniereHlc: h(6) },
    });
  });

  it('UT-SOC-26 decompterModificationsEnAttente — compte 2 éléments pour X créé puis renommé, le délai de T modifié deux fois et T rattachée (Q-US-018-1)', () => {
    const index = indexEnAttente([
      entree({ type: 'OBJECTIF', id: X, champ: 'creation' }, 1),
      entree({ type: 'OBJECTIF', id: X, champ: 'intitule' }, 1),
      entree({ type: 'OBJECTIF', id: X, champ: 'parent' }, 1),
      entree({ type: 'TACHE', id: T, champ: 'delai' }, 2),
      entree({ type: 'LIEN_TACHE_OBJECTIF', id: lien(T, O), champ: 'actif' }, 3),
    ]);

    expect(decompterModificationsEnAttente(index)).toBe(2);
  });

  it('UT-SOC-27 purgerPourSuppression — retire toutes les entrées d’un élément créé puis supprimé avant dépôt, sans entrée de suppression (US-018 S05c)', () => {
    const index = indexEnAttente([
      entree({ type: 'OBJECTIF', id: X, champ: 'creation' }, 1),
      entree({ type: 'OBJECTIF', id: X, champ: 'intitule' }, 1),
      entree({ type: 'OBJECTIF', id: X, champ: 'delai' }, 2),
    ]);

    const apres = purgerPourSuppression(index, {
      element: { type: 'OBJECTIF', id: X },
      descendantsSupprimes: [],
      hlc: h(5),
      instantCorrige: i(5),
    });

    expect(apres.size).toBe(0);
    expect(decompterModificationsEnAttente(apres)).toBe(0);
  });

  it('UT-SOC-28 purgerPourSuppression — ajoute une entrée suppression pour un élément déjà déposé (DAT §4.1.5 bis)', () => {
    const cleSuppression: CleInformation = { type: 'OBJECTIF', id: X, champ: 'suppression' };

    const apres = purgerPourSuppression(indexEnAttente([]), {
      element: { type: 'OBJECTIF', id: X },
      descendantsSupprimes: [],
      hlc: h(5),
      instantCorrige: i(5),
    });

    expect([...apres.values()]).toEqual([
      { cle: cleSuppression, entree: { premiereEcriture: i(5), derniereHlc: h(5) } },
    ]);
    expect(decompterModificationsEnAttente(apres)).toBe(1);
  });

  it('UT-SOC-29 purgerPourSuppression — compte 1 quand une sous-tâche créée hors ligne sous une tâche déposée disparaît avec elle (H-4, É-4)', () => {
    const index = indexEnAttente([
      entree({ type: 'TACHE', id: SOUS_TACHE, champ: 'creation' }, 1),
      entree({ type: 'TACHE', id: SOUS_TACHE, champ: 'intitule' }, 1),
      entree({ type: 'TACHE', id: SOUS_TACHE, champ: 'delai' }, 1),
    ]);

    const apres = purgerPourSuppression(index, {
      element: { type: 'TACHE', id: T },
      descendantsSupprimes: [{ type: 'TACHE', id: SOUS_TACHE }],
      hlc: h(5),
      instantCorrige: i(5),
    });

    expect([...apres.values()].map((e) => e.cle)).toEqual([
      { type: 'TACHE', id: T, champ: 'suppression' },
    ]);
    expect(decompterModificationsEnAttente(apres)).toBe(1);
  });

  it('UT-SOC-30 plusAncienneModificationEnAttente — renvoie le minimum des premiereEcriture (RG-057)', () => {
    const index = indexEnAttente([
      entree({ type: 'OBJECTIF', id: X, champ: 'intitule' }, 30),
      entree({ type: 'TACHE', id: T, champ: 'delai' }, 10),
      entree({ type: 'OBJECTIF', id: O, champ: 'delai' }, 20),
    ]);

    expect(plusAncienneModificationEnAttente(index)).toBe(i(10));
  });

  it('UT-SOC-30 plusAncienneModificationEnAttente — renvoie undefined quand l’index est vide (RG-057)', () => {
    expect(plusAncienneModificationEnAttente(indexEnAttente([]))).toBeUndefined();
  });
});
