/**
 * ST-US-017 v0.4.1 §3.1 n° 17 e, §4.5 bis (Q-BEN-R3R-1) : éléments en attente détaillés, entrée de la feuille ECR-011.
 */
import { describe, expect, it } from 'vitest';
import type { IdObjectif, IdTache } from '@src/commun/domaine/identifiants';
import { elementsEnAttenteDetailles } from '@src/synchronisation/domaine/elements-en-attente';
import { decompterModificationsEnAttente } from '@src/synchronisation/domaine/index-en-attente';
import type { CleInformation, IdLien } from '@src/synchronisation/domaine/information';
import { etatLocal, registre } from '@tests/support/fabriques/etat-local';
import { hlc, idObjectif, idTache, instant, SMARTPHONE } from '@tests/support/valeurs';

const O1 = idObjectif(1);
const O2 = idObjectif(2);
const T1 = idTache(1);
const T2 = idTache(2);
const lien = (t: IdTache, o: IdObjectif): IdLien => `${t}|${o}` as IdLien;
const iso = (minute: number) => `2026-10-21T08:${String(minute).padStart(2, '0')}:00.000Z`;
const h = (minute: number) => hlc(iso(minute), 0, SMARTPHONE);
const i = (minute: number) => instant(iso(minute));
const entree = (cle: CleInformation, premiere: number, derniere: number) => ({
  cle,
  premiereEcriture: i(premiere),
  derniereHlc: h(derniere),
});

const parId = <T extends { readonly id: string }>(lignes: ReadonlyArray<T>): ReadonlyArray<T> =>
  [...lignes].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

describe('elementsEnAttenteDetailles (ST-US-017 §4.5 bis, Q-BEN-R3R-1)', () => {
  it('UT-COMP-US-017-54 aucun élément en attente : liste vide', () => {
    const etat = etatLocal({
      appareilId: SMARTPHONE,
      registres: [
        registre({ type: 'OBJECTIF', id: O1, champ: 'intitule' }, 'Publier le guide', h(1)),
      ],
    });

    expect(elementsEnAttenteDetailles(etat)).toEqual([]);
  });

  it('UT-COMP-US-017-54 une ligne par élément, lien compté pour sa tâche, instant = physique du plus grand derniereHlc, intitulé du registre (même supprimé, vide sans registre)', () => {
    const etat = etatLocal({
      appareilId: SMARTPHONE,
      registres: [
        registre({ type: 'OBJECTIF', id: O1, champ: 'intitule' }, 'Publier le guide', h(1)),
        registre({ type: 'OBJECTIF', id: O2, champ: 'intitule' }, 'Apprendre le piano', h(1)),
        registre({ type: 'OBJECTIF', id: O2, champ: 'suppression' }, true, h(8)),
        registre({ type: 'TACHE', id: T1, champ: 'intitule' }, 'Rédiger', h(1)),
      ],
      enAttente: [
        // O1 : deux champs, le plus récent (derniereHlc) l'emporte, pas la première écriture.
        entree({ type: 'OBJECTIF', id: O1, champ: 'intitule' }, 2, 9),
        entree({ type: 'OBJECTIF', id: O1, champ: 'delai' }, 1, 4),
        // O2 : supprimé localement, l'intitulé reste lisible.
        entree({ type: 'OBJECTIF', id: O2, champ: 'suppression' }, 8, 8),
        // T1 : son champ et un lien, une seule ligne, instant du lien.
        entree({ type: 'TACHE', id: T1, champ: 'delai' }, 3, 3),
        entree({ type: 'LIEN_TACHE_OBJECTIF', id: lien(T1, O1), champ: 'actif' }, 6, 6),
        // T2 : lien seul, sans registre d'intitulé connu.
        entree({ type: 'LIEN_TACHE_OBJECTIF', id: lien(T2, O1), champ: 'actif' }, 5, 5),
      ],
    });

    const lignes = elementsEnAttenteDetailles(etat);

    expect(parId(lignes)).toEqual(
      parId([
        { id: O1, intitule: 'Publier le guide', instant: i(9) },
        { id: O2, intitule: 'Apprendre le piano', instant: i(8) },
        { id: T1, intitule: 'Rédiger', instant: i(6) },
        { id: T2, intitule: '', instant: i(5) },
      ]),
    );
    expect(lignes).toHaveLength(decompterModificationsEnAttente(etat.enAttente));
  });
});
