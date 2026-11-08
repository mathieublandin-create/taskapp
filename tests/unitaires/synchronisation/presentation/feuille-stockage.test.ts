/**
 * ST-US-018 v0.4 §6.3, §13 (rang 12, tranche D1) : ligne `SYN-FEUILLE-STOCKAGE` et carte `ALR-015` de la feuille
 * ECR-011 (guide v0.2.12 §6.6.2, §6.6.9 ; R15 ; RL-LOT-001-S7).
 */
import { describe, expect, it } from 'vitest';
import type { EtatPersistance } from '@src/commun/application/ports/persistance-stockage';
import { libelle } from '@src/commun/presentation/messages/libelle';
import type { EtatSynchronisationAffichable } from '@src/synchronisation/presentation/modeles-de-vue/etat-synchronisation-affichable';
import { construireFeuilleSynchronisation } from '@src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation';
import { instant } from '@tests/support/valeurs';

const MAINTENANT = instant('2026-10-21T08:32:00.000Z');
const ETAT: EtatSynchronisationAffichable = {
  reseau: 'CONNECTE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  enAttente: 0,
  aLire: 0,
  rappelMasque: false,
};

const feuille = (persistance?: EtatPersistance) =>
  construireFeuilleSynchronisation({
    etat: ETAT,
    maintenant: MAINTENANT,
    elementsEnAttente: [],
    ...(persistance === undefined ? {} : { persistance }),
  });

const ALERTE_ATTENDUE = {
  code: 'ALR-015',
  titre: 'Vos données ne sont pas protégées',
  texte:
    'Vos données ne sont pas protégées contre un nettoyage du navigateur. Installez l’application et gardez-la sur l’écran d’accueil.',
  role: 'status',
  fermable: false,
} as const;

describe('construireFeuilleSynchronisation — stockage de cet appareil (ST-US-018 §6.3)', () => {
  it('UT-US-018-04 PERSISTANT — ligne PROTEGE « Stockage de cet appareil : protégé », aucune carte ALR-015', () => {
    const vue = feuille('PERSISTANT');

    expect(vue.stockage).toEqual({
      code: 'SYN-FEUILLE-STOCKAGE',
      etat: 'PROTEGE',
      libelle: 'Stockage de cet appareil : protégé',
    });
    expect(vue.stockage?.libelle).toBe(libelle('SYN-FEUILLE-STOCKAGE'));
    expect(vue).not.toHaveProperty('alerteStockage');
  });

  it.each<EtatPersistance>(['NON_PERSISTANT', 'INDISPONIBLE'])(
    'UT-US-018-04 %s — ligne NON-PROTEGE « Stockage de cet appareil : non protégé » et carte ALR-015 (status, non fermable, sans action)',
    (persistance) => {
      const vue = feuille(persistance);

      expect(vue.stockage).toEqual({
        code: 'SYN-FEUILLE-STOCKAGE',
        etat: 'NON-PROTEGE',
        libelle: 'Stockage de cet appareil : non protégé',
      });
      expect(vue.stockage?.libelle).toBe(
        libelle('SYN-FEUILLE-STOCKAGE', { variante: 'non-protege' }),
      );
      expect(vue.alerteStockage).toEqual(ALERTE_ATTENDUE);
      expect(vue.alerteStockage).not.toHaveProperty('action');
    },
  );

  it('UT-US-018-04 persistance non encore lue — ni ligne ni carte', () => {
    const vue = feuille();

    expect(vue).not.toHaveProperty('stockage');
    expect(vue).not.toHaveProperty('alerteStockage');
  });

  it('UT-US-018-04 jamais de blocage — hormis la ligne et la carte, la feuille non protégée est identique à la feuille protégée (cartes d’erreur vides, bouton disponible)', () => {
    const { stockage: _p, ...resteProtege } = feuille('PERSISTANT');
    const { stockage: _n, alerteStockage: _a, ...resteNonProtege } = feuille('NON_PERSISTANT');

    expect(resteNonProtege).toEqual(resteProtege);
    expect(resteNonProtege.cartes).toEqual([]);
    expect(resteNonProtege.bouton.disponible).toBe(true);
  });
});
