import { describe, expect, it } from 'vitest';
import type { MotifEchecConnexion } from '@src/compte/domaine/motif-connexion';
import { construireEcranConnexion } from '@src/compte/presentation/modeles-de-vue/ecran-connexion';

describe('construireEcranConnexion (ECR-010, guide §6.6.8)', () => {
  it('UT-US-022-40 construireEcranConnexion — sans échec : les deux accès annoncés, « Continuer avec Google », aucun message (CA-1, CA-8)', () => {
    const vue = construireEcranConnexion({ enCours: false });

    expect(vue).toEqual({
      porteesAnnoncees: ['IDENTIFICATION_DU_COMPTE', 'FICHIERS_DE_L_APPLICATION_DANS_LE_DRIVE'],
      action: 'CONTINUER_AVEC_GOOGLE',
      actionActive: true,
    });
    expect(construireEcranConnexion({ enCours: true }).actionActive).toBe(false);
  });

  it('UT-US-022-41 construireEcranConnexion — ERR-001 et ERR-002 ont le même texte ; l’action dépend du motif', () => {
    const vue = (motif: MotifEchecConnexion) =>
      construireEcranConnexion({ dernierEchec: motif, enCours: false });

    expect(vue('ERR-001').message?.texte).toBe(vue('ERR-002').message?.texte);
    expect(vue('ERR-001').message?.code).toBe('ERR-001');
    expect(vue('ERR-002').message?.code).toBe('ERR-002');
    expect(vue('ERR-003').message?.texte).not.toBe(vue('ERR-004').message?.texte);
    expect((['ERR-001', 'ERR-002'] as const).map((m) => vue(m).action)).toEqual([
      'CONTINUER_AVEC_GOOGLE',
      'CONTINUER_AVEC_GOOGLE',
    ]);
    expect((['ERR-003', 'ERR-004', 'ERR-005'] as const).map((m) => vue(m).action)).toEqual([
      'REESSAYER',
      'REESSAYER',
      'REESSAYER',
    ]);
    expect(vue('ERR-006').action).toBe('CHOISIR_UN_AUTRE_COMPTE');
  });
});
