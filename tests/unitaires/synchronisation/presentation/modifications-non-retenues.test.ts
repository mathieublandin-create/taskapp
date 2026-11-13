/**
 * Modèle de vue de la section « À lire » d'ECR-011 (guide §4.24, §5.8 f, §6.6.2, §6.6.9 ; glossaire §8 ; H-2, H-6 ;
 * ST-US-017 v0.5 §6.6 n° 13 ; v0.6 : date d'une valeur d'état). UT-US-017-58.
 */
import { describe, expect, it } from 'vitest';
import { libelle } from '@src/commun/presentation/messages/libelle';
import type { ValeurEcarteeDetaillee } from '@src/synchronisation/domaine/detail-valeurs-ecartees';
import { construireModificationsNonRetenues } from '@src/synchronisation/presentation/modeles-de-vue/modifications-non-retenues';
import { h, idArbitraire } from '@tests/support/synchronisation/ecritures-concurrentes';
import { date, idObjectif, idTache, PC } from '@tests/support/valeurs';

const T1 = idTache(1);
const T2 = idTache(2);
const O1 = idObjectif(1);
const O3 = idObjectif(3);
const ALPHA = idObjectif(5);
const quand = (n: number) => h(n, PC).physique;

const detail = (
  n: number,
  complement: Partial<ValeurEcarteeDetaillee> &
    Pick<ValeurEcarteeDetaillee, 'motif' | 'information'>,
): ValeurEcarteeDetaillee => ({
  id: idArbitraire(n),
  element: { type: 'TACHE', id: T1 },
  intitule: 'Chapitre 1',
  valeurNonRetenue: { type: 'DATE', date: date('2026-12-10') },
  valeurConservee: { type: 'DATE', date: date('2026-12-05') },
  instant: quand(1),
  lue: false,
  elementExiste: true,
  ...complement,
});

const conflit = detail(1, { motif: 'CONFLIT', information: 'DELAI', instant: quand(5) });
const objectifSupprime = detail(2, {
  motif: 'SUPPRESSION',
  information: 'DELAI',
  element: { type: 'OBJECTIF', id: O1 },
  intitule: 'Publier le guide',
  valeurConservee: { type: 'OBJECTIF_SUPPRIME' },
  supprime: { type: 'OBJECTIF', id: O1 },
  elementExiste: false,
  instant: quand(4),
});
const tacheSupprimee = detail(3, {
  motif: 'SUPPRESSION',
  information: 'INTITULE',
  valeurNonRetenue: { type: 'TEXTE', texte: 'Chapitre 1 revu' },
  valeurConservee: { type: 'TACHE_SUPPRIMEE' },
  supprime: { type: 'TACHE', id: T1 },
  elementExiste: false,
  instant: quand(4),
});
const rattachement = detail(4, {
  motif: 'SUPPRESSION',
  information: 'OBJECTIFS',
  element: { type: 'TACHE', id: T2 },
  intitule: 'Annexe',
  valeurNonRetenue: { type: 'RATTACHEE', intitule: 'Publier le guide' },
  valeurConservee: { type: 'OBJECTIF_SUPPRIME' },
  supprime: { type: 'OBJECTIF', id: O1 },
  instant: quand(3),
});
const placement = detail(5, {
  motif: 'SUPPRESSION',
  information: 'PARENT',
  element: { type: 'OBJECTIF', id: O3 },
  intitule: 'Version imprimable',
  valeurNonRetenue: { type: 'SOUS', intitule: 'Publier le guide' },
  valeurConservee: { type: 'OBJECTIF_SUPPRIME' },
  supprime: { type: 'OBJECTIF', id: O1 },
  instant: quand(3),
});
const annule = detail(6, {
  motif: 'PLACEMENT_ANNULE',
  information: 'PARENT',
  element: { type: 'OBJECTIF', id: ALPHA },
  intitule: 'Alpha',
  valeurNonRetenue: { type: 'SOUS', intitule: 'Bêta' },
  valeurConservee: { type: 'PLACEMENT_ANNULE' },
  instant: quand(2),
});
const lue = detail(7, { motif: 'CONFLIT', information: 'INTITULE', lue: true, instant: quand(9) });
const effacee = (n: number, instant: number) =>
  detail(n, {
    motif: 'DONNEES_EFFACEES',
    information: 'DELAI',
    valeurConservee: { type: 'DONNEES_EFFACEES' },
    instant: quand(instant),
  });

describe('construireModificationsNonRetenues (ECR-011, section « À lire »)', () => {
  it('UT-US-017-58 codes et variantes, quatre colonnes, ordre, lues exclues, ALR-014 groupées sous ALR-008 et non comptées ; rien à lire : section absente', () => {
    const vue = construireModificationsNonRetenues([
      annule,
      effacee(8, 1),
      placement,
      lue,
      conflit,
      rattachement,
      effacee(9, 2),
      tacheSupprimee,
      objectifSupprime,
    ]);

    expect(vue?.code).toBe('SYN-FEUILLE-A-LIRE');
    expect(vue?.n).toBe(6);
    expect(vue?.libelle).toBe(libelle('SYN-FEUILLE-A-LIRE', { n: 6 }));
    // La plus récente d’abord ; à égalité, par intitulé (« Chapitre 1 » < « Publier le guide » ; « Annexe » < « Version… »).
    expect(vue?.lignes.map((l) => l.id)).toEqual(
      [conflit, tacheSupprimee, objectifSupprime, rattachement, placement, annule].map((d) => d.id),
    );
    expect(vue?.lignes).toEqual([
      {
        id: conflit.id,
        code: 'ALR-009',
        element: 'Chapitre 1',
        information: 'DELAI',
        valeurNonRetenue: conflit.valeurNonRetenue,
        valeurConservee: conflit.valeurConservee,
        titre: expect.any(String) as unknown,
        voir: { type: 'TACHE', id: T1 },
      },
      {
        id: tacheSupprimee.id,
        code: 'ALR-010',
        variante: 'tache',
        element: 'Chapitre 1',
        information: 'INTITULE',
        valeurNonRetenue: tacheSupprimee.valeurNonRetenue,
        valeurConservee: { type: 'TACHE_SUPPRIMEE' },
        titre: libelle('ALR-010', { variante: 'tache', element: 'Chapitre 1' }),
      },
      {
        id: objectifSupprime.id,
        code: 'ALR-010',
        element: 'Publier le guide',
        information: 'DELAI',
        valeurNonRetenue: objectifSupprime.valeurNonRetenue,
        valeurConservee: { type: 'OBJECTIF_SUPPRIME' },
        titre: libelle('ALR-010', { element: 'Publier le guide' }),
      },
      {
        id: rattachement.id,
        code: 'ALR-010',
        variante: 'rattachement',
        element: 'Annexe',
        information: 'OBJECTIFS',
        valeurNonRetenue: rattachement.valeurNonRetenue,
        valeurConservee: { type: 'OBJECTIF_SUPPRIME' },
        titre: libelle('ALR-010', { variante: 'rattachement' }),
        voir: { type: 'TACHE', id: T2 },
      },
      {
        id: placement.id,
        code: 'ALR-010',
        variante: 'placement',
        element: 'Version imprimable',
        information: 'PARENT',
        valeurNonRetenue: placement.valeurNonRetenue,
        valeurConservee: { type: 'OBJECTIF_SUPPRIME' },
        titre: libelle('ALR-010', { variante: 'placement' }),
        voir: { type: 'OBJECTIF', id: O3 },
      },
      {
        id: annule.id,
        code: 'ALR-011',
        element: 'Alpha',
        information: 'PARENT',
        valeurNonRetenue: { type: 'SOUS', intitule: 'Bêta' },
        valeurConservee: { type: 'PLACEMENT_ANNULE' },
        titre: libelle('ALR-011', { element: 'Alpha' }),
        voir: { type: 'OBJECTIF', id: ALPHA },
      },
    ]);
    expect(vue?.donneesEffacees).toEqual({
      code: 'ALR-008',
      // RC-US-017-7 : les textes de la carte viennent du modèle de vue.
      titre: libelle('ALR-008'),
      nomAccessibleCompris: 'Compris : vos données ont été effacées',
      action: libelle('ALR-008', {}, 'action'),
      ids: [idArbitraire(9), idArbitraire(8)],
      lignes: [9, 8].map((n) => ({
        id: idArbitraire(n),
        element: 'Chapitre 1',
        information: 'DELAI',
        valeurNonRetenue: { type: 'DATE', date: date('2026-12-10') },
      })),
    });

    // Seules des ALR-014 : section présente, n = 0, sans ligne.
    const seulementEffacees = construireModificationsNonRetenues([effacee(8, 1)]);
    expect(seulementEffacees?.n).toBe(0);
    expect(seulementEffacees?.lignes).toEqual([]);
    expect(seulementEffacees?.donneesEffacees?.ids).toEqual([idArbitraire(8)]);
    // v0.6 (RG-056) : une valeur d'état garde sa date jusqu'au composant (deux fins à des dates différentes).
    const deuxFins = detail(10, {
      motif: 'CONFLIT',
      information: 'ETAT',
      valeurNonRetenue: { type: 'ETAT', etat: 'TERMINEE', date: date('2026-10-22') },
      valeurConservee: { type: 'ETAT', etat: 'TERMINEE', date: date('2026-10-23') },
    });
    const ligneEtat = construireModificationsNonRetenues([deuxFins])?.lignes[0];
    expect(ligneEtat?.valeurNonRetenue).toStrictEqual(deuxFins.valeurNonRetenue);
    expect(ligneEtat?.valeurConservee).toStrictEqual(deuxFins.valeurConservee);
    // Rien de non lu : section absente (guide §6.5, « Modifications non retenues, rien à lire »).
    expect(construireModificationsNonRetenues([lue])).toBeUndefined();
    expect(construireModificationsNonRetenues([])).toBeUndefined();
  });
});
