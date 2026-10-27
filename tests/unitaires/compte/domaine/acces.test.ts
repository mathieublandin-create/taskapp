import { describe, expect, it } from 'vitest';
import {
  accesApresRetour,
  type EtatAcces,
  type IssueRetourGoogle,
  qualifierRefusJeton,
} from '@src/compte/domaine/acces';
import { ecart } from '@tests/support/valeurs';

const TOUS: ReadonlyArray<EtatAcces> = ['VALIDE', 'A_RENOUVELER', 'PERDU'];
const apres = (avant: EtatAcces, issue: IssueRetourGoogle, origine: 'OUVERTURE' | 'GESTE' = 'OUVERTURE') =>
  accesApresRetour({ avant, issue, origine });

describe('Accès Google (DAT §4.1.6 bis, ADR-013)', () => {
  it('UT-US-022-13 accesApresRetour — un jeton rend l’accès valide quel que soit l’état précédent (RG-017)', () => {
    TOUS.forEach((avant) => {
      expect(apres(avant, 'JETON')).toBe('VALIDE');
      expect(apres(avant, 'JETON', 'GESTE')).toBe('VALIDE');
    });
  });

  it('UT-US-022-14 accesApresRetour — une erreur sans preuve garde un accès perdu et rend à renouveler un accès valide ou à renouveler', () => {
    (['ERREUR_INTERACTION', 'ERREUR_CONFIGURATION', 'RETOUR_REJETE', 'ERREUR_TECHNIQUE'] as const).forEach((issue) => {
      expect(apres('VALIDE', issue)).toBe('A_RENOUVELER');
      expect(apres('A_RENOUVELER', issue)).toBe('A_RENOUVELER');
      expect(apres('PERDU', issue)).toBe('PERDU');
    });
    TOUS.forEach((avant) => {
      expect(apres(avant, 'ANNULATION', 'GESTE')).toBe(avant);
    });
  });

  it('UT-US-022-15 accesApresRetour — portées partielles et refus après un geste prouvent la perte ; un refus à l’ouverture non (EC-7)', () => {
    expect(apres('A_RENOUVELER', 'PORTEES_PARTIELLES')).toBe('PERDU');
    expect(apres('A_RENOUVELER', 'REFUS', 'GESTE')).toBe('PERDU');
    expect(apres('A_RENOUVELER', 'REFUS', 'OUVERTURE')).toBe('A_RENOUVELER');
    expect(apres('PERDU', 'REFUS', 'OUVERTURE')).toBe('PERDU');
  });

  it('UT-US-022-16 qualifierRefusJeton — à renouveler sans échéance, échéance atteinte ou à moins de 60 s (DAT §4.1.6 bis)', () => {
    expect(qualifierRefusJeton({ echeance: undefined, maintenant: ecart(0) })).toBe('A_RENOUVELER');
    expect(qualifierRefusJeton({ echeance: ecart(100_000), maintenant: ecart(100_000) })).toBe('A_RENOUVELER');
    expect(qualifierRefusJeton({ echeance: ecart(100_000), maintenant: ecart(150_000) })).toBe('A_RENOUVELER');
    expect(qualifierRefusJeton({ echeance: ecart(100_000), maintenant: ecart(41_000) })).toBe('A_RENOUVELER');
  });

  it('UT-US-022-17 qualifierRefusJeton — perdu à 60 s + 1 ms de l’échéance, à renouveler à 60 s exactement (DAT §4.1.6 bis)', () => {
    expect(qualifierRefusJeton({ echeance: ecart(100_000), maintenant: ecart(39_999) })).toBe('PERDU');
    expect(qualifierRefusJeton({ echeance: ecart(100_000), maintenant: ecart(40_000) })).toBe('A_RENOUVELER');
  });
});
