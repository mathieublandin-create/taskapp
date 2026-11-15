/**
 * Saisie refusée en consultation seule (RG-058 ; ST-US-017 v0.11 §6.8 n° 9 ; guide §6.6.6 `TST-CONSULTATION-SEULE`,
 * maquette ECR-011 K) : l'issue d'une commande refusée par le décorateur n'est ni un refus métier ni un échec
 * d'enregistrement (ERR-014). UT-US-017-125 (rang 11, tranche D1).
 */
import { describe, expect, it } from 'vitest';
import { echec } from '@src/commun/domaine/resultat';
import {
  estRefusMetier,
  issueDe,
  messagesDeIssue,
} from '@src/objectifs-taches/presentation/ui/etat/issues';

describe('issueDe — consultation seule (n° 9)', () => {
  it('UT-US-017-125 ConsultationSeule → issue CONSULTATION_SEULE (toast TST-CONSULTATION-SEULE côté écran), sans message de champ ; ce n’est pas un refus métier', () => {
    const consultation = echec({ type: 'ConsultationSeule' } as const);
    expect(estRefusMetier(consultation.erreur)).toBe(false);
    const issue = issueDe(consultation);
    expect(issue).toEqual({ type: 'CONSULTATION_SEULE' });
    expect(messagesDeIssue(issue)).toEqual([]);
    expect(issueDe(echec({ type: 'EcritureLocaleImpossible' } as const))).toEqual({
      type: 'ENREGISTREMENT_IMPOSSIBLE',
    });
  });
});
