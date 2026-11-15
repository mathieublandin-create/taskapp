/**
 * Compléments de la tranche D1 du rang 12 (ST-US-018 v0.4 §6.3) : libellés exacts avec la typographie du catalogue
 * (espace insécable avant « : ») et cohabitation de la carte `ALR-015` avec les autres cartes de la feuille.
 */
import { describe, expect, it } from 'vitest';
import type { EtatSynchronisationAffichable } from '@src/synchronisation/presentation/modeles-de-vue/etat-synchronisation-affichable';
import { construireFeuilleSynchronisation } from '@src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation';
import { ecart, HEURE, instant } from '@tests/support/valeurs';

const INSECABLE = ' ';
const MAINTENANT = instant('2026-10-21T08:32:00.000Z');
const ETAT: EtatSynchronisationAffichable = {
  reseau: 'CONNECTE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  enAttente: 0,
  aLire: 0,
  rappelMasque: false,
};

describe('construireFeuilleSynchronisation — stockage, compléments (ST-US-018 §6.3)', () => {
  it('UT-COMP-US-018-21 libellés de la ligne « Stockage » — espace insécable avant « : », protégé et non protégé', () => {
    const protege = construireFeuilleSynchronisation({
      etat: ETAT,
      maintenant: MAINTENANT,
      elementsEnAttente: [],
      persistance: 'PERSISTANT',
    });
    const nonProtege = construireFeuilleSynchronisation({
      etat: ETAT,
      maintenant: MAINTENANT,
      elementsEnAttente: [],
      persistance: 'INDISPONIBLE',
    });

    expect(protege.stockage?.libelle).toBe(`Stockage de cet appareil${INSECABLE}: protégé`);
    expect(nonProtege.stockage?.libelle).toBe(`Stockage de cet appareil${INSECABLE}: non protégé`);
  });

  it('UT-COMP-US-018-22 cohabitation — carte ALR-015, carte ERR-011 et ALR-001 sont toutes présentes, aucune n’en écarte une autre', () => {
    const vue = construireFeuilleSynchronisation({
      etat: { ...ETAT, actionRequise: 'DRIVE_PLEIN' },
      maintenant: MAINTENANT,
      elementsEnAttente: [],
      correctionHorloge: ecart(25 * HEURE),
      persistance: 'NON_PERSISTANT',
    });

    expect(vue.cartes.map((c) => c.message)).toEqual(['ERR-011']);
    expect(vue.alerteHorloge?.code).toBe('ALR-001');
    expect(vue.alerteStockage?.code).toBe('ALR-015');
    expect(vue.stockage?.etat).toBe('NON-PROTEGE');
  });
});
