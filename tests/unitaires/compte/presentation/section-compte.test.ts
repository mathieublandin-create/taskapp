import { describe, expect, it } from 'vitest';
import { construireSectionCompte } from '@src/compte/presentation/modeles-de-vue/section-compte';
import { IDENTITE_A } from '@tests/support/compte/doublures-compte';

describe('construireSectionCompte (ECR-011, DEC-015)', () => {
  it('UT-US-022-42 construireSectionCompte — propose exactement « Se déconnecter » puis « Supprimer les données de cet appareil » (CA-6, CA-10)', () => {
    const vue = construireSectionCompte({ adresse: IDENTITE_A.adresse });

    expect(vue.actions).toEqual(['SE_DECONNECTER', 'SUPPRIMER_DONNEES']);
    expect(vue.adresse).toBe('a@exemple.test');
    expect(vue.dossier.code).toBe('SYN-FEUILLE-DOSSIER');
  });
});
