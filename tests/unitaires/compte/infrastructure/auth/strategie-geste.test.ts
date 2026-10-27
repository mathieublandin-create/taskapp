import { describe, expect, it } from 'vitest';
import {
  mecanismeGeste,
  suiteErreurGis,
  type ErreurGis,
  type SuiteErreurGis,
} from '@src/compte/infrastructure/auth/strategie-geste';

const REPLI: SuiteErreurGis = { type: 'REPLI_REDIRECTION_INTERACTIVE' };

describe('Stratégie du geste (DAT v0.11.3 §4.1.7, Q-ST022-STA-2)', () => {
  it('UT-US-022-51 mecanismeGeste — GIS sur le web, redirection interactive d’emblée sur web-ios', () => {
    expect(mecanismeGeste('web')).toBe('GIS');
    expect(mecanismeGeste('web-ios')).toBe('REDIRECTION_INTERACTIVE');
  });

  it('UT-US-022-52 suiteErreurGis — repli interactif pour les seules causes techniques, avec réseau', () => {
    const cas: ReadonlyArray<readonly [ErreurGis, 'CONNECTE' | 'COUPE', SuiteErreurGis]> = [
      [{ type: 'SCRIPT_INDISPONIBLE' }, 'CONNECTE', REPLI],
      [{ type: 'POPUP_FAILED_TO_OPEN' }, 'CONNECTE', REPLI],
      [{ type: 'INCONNUE', code: 'unknown' }, 'CONNECTE', REPLI],
      [
        { type: 'SCRIPT_INDISPONIBLE' },
        'COUPE',
        { type: 'ECHEC', erreur: { type: 'ReseauIndisponible' } },
      ],
      [
        { type: 'POPUP_CLOSED' },
        'CONNECTE',
        { type: 'ECHEC', erreur: { type: 'ConnexionAnnulee' } },
      ],
      [
        { type: 'ACCESS_DENIED' },
        'CONNECTE',
        { type: 'ECHEC', erreur: { type: 'AccesGoogleRevoque' } },
      ],
    ];

    cas.forEach(([erreur, reseau, attendu]) => {
      expect(suiteErreurGis(erreur, reseau)).toEqual(attendu);
    });
  });
});
