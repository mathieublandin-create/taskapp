/**
 * Feuille ECR-011 de l'incrément 4 (ST-US-017 v0.11 §6.8 n° 4, n° 10 et n° 11 ; guide §6.6.8, §6.6.9, maquette
 * ECR-011 B, G, I ; RG-054, RG-058, US-017 CA-13) : carte ALR-001, carte ERR-013 et son action « Mettre à jour », ligne
 * « Fuseau » de la section « Compte ». UT-US-017-89 et 124 (rang 11, tranche D1).
 */
import { describe, expect, it } from 'vitest';
import { construireSectionCompte } from '@src/compte/presentation/modeles-de-vue/section-compte';
import { libelle } from '@src/commun/presentation/messages/libelle';
import type { EtatSynchronisationAffichable } from '@src/synchronisation/presentation/modeles-de-vue/etat-synchronisation-affichable';
import { construireFeuilleSynchronisation } from '@src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation';
import { IDENTITE_A } from '@tests/support/compte/doublures-compte';
import {
  ecart,
  fuseau,
  HEURE,
  instant,
  MINUTE,
  NEW_YORK,
  PARIS,
  UTC,
} from '@tests/support/valeurs';

const ETAT: EtatSynchronisationAffichable = {
  reseau: 'CONNECTE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  enAttente: 0,
  aLire: 0,
  rappelMasque: false,
};
const feuille = (etat: Partial<EtatSynchronisationAffichable>, correction?: number) =>
  construireFeuilleSynchronisation({
    etat: { ...ETAT, ...etat },
    maintenant: instant('2026-10-21T08:32:00.000Z'),
    elementsEnAttente: [],
    ...(correction === undefined ? {} : { correctionHorloge: ecart(correction) }),
  });

describe('Feuille « Compte et synchronisation » : horloge et version (n° 4, n° 10)', () => {
  it('UT-US-017-89 carte ALR-001 (titre et texte du catalogue, sans action) si et seulement si l’écart dépasse 24 h strictement, dans les deux sens ; aucune carte sans correction connue', () => {
    const alr001 = {
      code: 'ALR-001',
      titre: libelle('ALR-001'),
      texte: libelle('ALR-001', {}, 'texte'),
    };
    expect(feuille({}, 25 * HEURE).alerteHorloge).toEqual(alr001);
    expect(feuille({}, -(24 * HEURE + MINUTE)).alerteHorloge).toEqual(alr001);
    expect(feuille({}, 24 * HEURE).alerteHorloge).toBeUndefined();
    expect(feuille({}, -24 * HEURE).alerteHorloge).toBeUndefined();
    expect(feuille({}).alerteHorloge).toBeUndefined();
    // Aucune autre carte n'est ajoutée par l'horloge (aucun blocage, guide §6.6.9).
    expect(feuille({}, 25 * HEURE).cartes).toEqual([]);
  });

  it('UT-US-017-89 consultation seule : carte ERR-013 avec l’action METTRE_A_JOUR (libellés du catalogue) ; le bouton « Synchroniser maintenant » reste disponible', () => {
    const vue = feuille({ actionRequise: 'FORMAT_PLUS_RECENT', enAttente: 2 });
    expect(vue.cartes).toEqual([
      {
        message: 'ERR-013',
        titre: libelle('ERR-013', { variante: 'carte' }),
        texte: libelle('ERR-013', { variante: 'carte' }, 'texte'),
        action: { type: 'METTRE_A_JOUR', libelle: libelle('ERR-013', {}, 'action') },
      },
    ]);
    expect(vue.bouton.disponible).toBe(true);
    expect(feuille({}).cartes).toEqual([]);
  });
});

describe('Section « Compte » : ligne « Fuseau » (n° 11, RG-054)', () => {
  it('UT-US-017-124 présente seulement si l’appareil n’est pas à l’heure de Paris : « Heure de Paris » et « Votre appareil est réglé sur {ville} » (dernier segment IANA, « _ » remplacé par une espace)', () => {
    expect(
      construireSectionCompte({ adresse: IDENTITE_A.adresse, fuseauAppareil: NEW_YORK }).fuseau,
    ).toEqual({
      code: 'SYN-FEUILLE-FUSEAU',
      libelle: libelle('SYN-FEUILLE-FUSEAU'),
      texte: libelle('SYN-FEUILLE-FUSEAU', { fuseau: 'New York' }, 'texte'),
    });
    expect(
      construireSectionCompte({
        adresse: IDENTITE_A.adresse,
        fuseauAppareil: fuseau('Pacific/Auckland'),
      }).fuseau?.texte,
    ).toBe(libelle('SYN-FEUILLE-FUSEAU', { fuseau: 'Auckland' }, 'texte'));
    expect(
      construireSectionCompte({ adresse: IDENTITE_A.adresse, fuseauAppareil: UTC }).fuseau?.texte,
    ).toBe(libelle('SYN-FEUILLE-FUSEAU', { fuseau: 'UTC' }, 'texte'));
    expect(
      construireSectionCompte({ adresse: IDENTITE_A.adresse, fuseauAppareil: PARIS }).fuseau,
    ).toBeUndefined();
    expect(construireSectionCompte({ adresse: IDENTITE_A.adresse }).fuseau).toBeUndefined();
  });
});
