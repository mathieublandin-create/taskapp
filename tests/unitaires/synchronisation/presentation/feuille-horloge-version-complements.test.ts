/**
 * Compléments de D1 (ST-US-017 v0.11 §6.8 n° 4, n° 10, n° 11). UT-COMP-US-017-4-14 à 4-16 (rang 11, tranche D1).
 */
import { describe, expect, it } from 'vitest';
import { construireSectionCompte } from '@src/compte/presentation/modeles-de-vue/section-compte';
import type { EtatSynchronisationAffichable } from '@src/synchronisation/presentation/modeles-de-vue/etat-synchronisation-affichable';
import { construireFeuilleSynchronisation } from '@src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation';
import { IDENTITE_A } from '@tests/support/compte/doublures-compte';
import { ecart, fuseau, HEURE, instant } from '@tests/support/valeurs';

const ETAT: EtatSynchronisationAffichable = {
  reseau: 'CONNECTE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  enAttente: 0,
  aLire: 0,
  rappelMasque: false,
};
const feuille = (etat: Partial<EtatSynchronisationAffichable>, correction: number) =>
  construireFeuilleSynchronisation({
    etat: { ...ETAT, ...etat },
    maintenant: instant('2026-10-21T08:32:00.000Z'),
    elementsEnAttente: [],
    correctionHorloge: ecart(correction),
  });

describe('Feuille ECR-011 et section « Compte » : compléments', () => {
  it('UT-COMP-US-017-4-14 ALR-001 se cumule avec ERR-013 sans la remplacer ni la modifier', () => {
    const vue = feuille({ actionRequise: 'FORMAT_PLUS_RECENT' }, 30 * HEURE);

    expect(vue.alerteHorloge?.code).toBe('ALR-001');
    expect(vue.cartes.map((c) => c.message)).toEqual(['ERR-013']);
  });

  it('UT-COMP-US-017-4-15 ERR-013 est propre à FORMAT_PLUS_RECENT : les autres actions requises gardent leur carte', () => {
    expect(feuille({ actionRequise: 'DRIVE_PLEIN' }, 0).cartes.map((c) => c.message)).toEqual([
      'ERR-011',
    ]);
    expect(
      feuille({ actionRequise: 'ECHEC_PERSISTANT', enAttente: 2 }, 0).cartes.map((c) => c.message),
    ).toEqual(['ERR-016']);
  });

  it('UT-COMP-US-017-4-16 la ligne « Fuseau » prend le dernier segment, plusieurs « _ » comprises', () => {
    const section = construireSectionCompte({
      adresse: IDENTITE_A.adresse,
      fuseauAppareil: fuseau('America/Argentina/Buenos_Aires'),
    });

    expect(section.fuseau?.texte).toContain('Buenos Aires');
    expect(section.fuseau?.texte).not.toContain('_');
  });
});
