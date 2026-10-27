import { describe, expect, it } from 'vitest';
import { SignalerRefusJeton } from '@src/compte/application/cas-usage/signaler-refus-jeton';
import { SessionCourante } from '@src/compte/application/session-courante';
import type { JetonAcces } from '@src/compte/application/ports/coffre-jetons';
import { CoffreJetonsMemoire } from '@src/compte/infrastructure/coffre-jetons-memoire';
import { IDENTITE_A, MemoireSessionEnMemoire } from '@tests/support/compte/doublures-compte';
import { horlogeSur } from '@tests/support/horloge';
import { ecart, HEURE, MINUTE } from '@tests/support/valeurs';

const preparer = (echeanceDansMs: number) => {
  const horloge = horlogeSur('2026-10-27T08:00:00.000Z');
  const coffre = new CoffreJetonsMemoire();
  coffre.placer({
    jeton: 'jeton-test' as JetonAcces,
    echeance: ecart(horloge.monotone() + echeanceDansMs),
  });
  const memoireSession = new MemoireSessionEnMemoire({ identite: IDENTITE_A, accesPerdu: false });
  const session = new SessionCourante();
  session.ouvrir(IDENTITE_A, 'VALIDE');
  const cas = new SignalerRefusJeton({ coffre, horloge, memoireSession, session });
  return { cas, coffre, memoireSession, session };
};

describe('SignalerRefusJeton (DAT §4.1.6 bis)', () => {
  it('UT-US-022-25 SignalerRefusJeton — un 401 sur un jeton encore valide prouve le retrait : PERDU, mémorisé, coffre vidé (RG-035)', async () => {
    const env = preparer(HEURE / 2);

    expect(await env.cas.executer()).toBe('PERDU');

    expect(env.coffre.lire()).toBeUndefined();
    expect(env.memoireSession.session).toEqual({ identite: IDENTITE_A, accesPerdu: true });
    expect(env.session.etat()).toEqual({ type: 'OUVERTE', identite: IDENTITE_A, acces: 'PERDU' });
  });

  it('UT-US-022-26 SignalerRefusJeton — un 401 à moins d’une minute de l’échéance rend l’accès à renouveler, sans rien mémoriser', async () => {
    const env = preparer(MINUTE / 2);

    expect(await env.cas.executer()).toBe('A_RENOUVELER');

    expect(env.coffre.lire()).toBeUndefined();
    expect(env.memoireSession.session).toEqual({ identite: IDENTITE_A, accesPerdu: false });
    expect(env.session.etat()).toEqual({
      type: 'OUVERTE',
      identite: IDENTITE_A,
      acces: 'A_RENOUVELER',
    });
  });
});
