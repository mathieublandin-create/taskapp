/**
 * ST-US-031 v0.4 §6.3 (rang 13, tranche D1) : mention `SYN-FEUILLE-AUTRE-ONGLET` de la feuille ECR-011 (guide §6.6.2,
 * maquette ECR-011, PC, « un autre onglet synchronise »), présente si et seulement si l'onglet est suiveur et qu'un autre
 * onglet tient le verrou « meneur ». L'indicateur, les bandeaux et le reste de la feuille n'en dépendent pas.
 */
import { describe, expect, it } from 'vitest';
import type { EtatCoordination } from '@src/synchronisation/application/coordination-onglets';
import type { EtatSynchronisationAffichable } from '@src/synchronisation/presentation/modeles-de-vue/etat-synchronisation-affichable';
import { construireFeuilleSynchronisation } from '@src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation';
import { instant } from '@tests/support/valeurs';

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

const feuille = (coordination?: EtatCoordination) =>
  construireFeuilleSynchronisation({
    etat: ETAT,
    maintenant: MAINTENANT,
    elementsEnAttente: [],
    ...(coordination === undefined ? {} : { coordination }),
  });

describe('construireFeuilleSynchronisation — autre onglet (ST-US-031 §6.3)', () => {
  it('UT-US-031-07 SUIVEUR avec un autre meneur — ligne SYN-FEUILLE-AUTRE-ONGLET, texte du catalogue ; reste de la feuille inchangé', () => {
    const vue = feuille({ role: 'SUIVEUR', autreMeneur: true });

    expect(vue.autreOnglet).toEqual({
      code: 'SYN-FEUILLE-AUTRE-ONGLET',
      libelle: `Cet onglet n’effectue pas la synchronisation${INSECABLE}: un autre onglet de l’application s’en charge. Les deux onglets affichent les mêmes données.`,
    });
    const { autreOnglet: _ligne, ...reste } = vue;
    expect(reste).toEqual(feuille());
  });

  it.each<[string, EtatCoordination | undefined]>([
    ['MENEUR', { role: 'MENEUR', autreMeneur: false }],
    [
      'SUIVEUR sans meneur (aucun onglet n’a d’accès valide)',
      { role: 'SUIVEUR', autreMeneur: false },
    ],
    ['coordination non lue', undefined],
  ])('UT-US-031-07 %s — aucune ligne SYN-FEUILLE-AUTRE-ONGLET', (_cas, coordination) => {
    expect(feuille(coordination)).not.toHaveProperty('autreOnglet');
  });
});
