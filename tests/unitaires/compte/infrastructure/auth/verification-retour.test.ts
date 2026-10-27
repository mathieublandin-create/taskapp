import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import type { DepartMemorise } from '@src/compte/application/ports/memoire-redirection';
import { verifierRetour } from '@src/compte/infrastructure/auth/verification-retour';
import { instant } from '@tests/support/valeurs';

const DEPART: DepartMemorise = {
  state: 'q3Zr1mJ7c0bHkX8wP2yT9A',
  lanceA: instant('2026-10-27T08:00:00.000Z'),
  expireA: instant('2026-10-27T08:10:00.000Z'),
  mode: 'RENOUVELLEMENT_OUVERTURE',
  reprise: { ecran: 'accueil', feuilleSynchronisationOuverte: false },
};

describe('verifierRetour (RED-03)', () => {
  it('UT-US-022-18 verifierRetour — rejette un state absent, inconnu (y compris un préfixe), ou un retour sans départ mémorisé', () => {
    const maintenant = instant('2026-10-27T08:00:02.000Z');

    expect(verifierRetour({ stateRecu: undefined, depart: DEPART, maintenant })).toEqual(
      echec('STATE_ABSENT'),
    );
    expect(verifierRetour({ stateRecu: 'autre', depart: DEPART, maintenant })).toEqual(
      echec('STATE_INCONNU'),
    );
    expect(
      verifierRetour({ stateRecu: 'q3Zr1mJ7c0bHkX8wP2yT9', depart: DEPART, maintenant }),
    ).toEqual(echec('STATE_INCONNU'));
    expect(verifierRetour({ stateRecu: DEPART.state, depart: undefined, maintenant })).toEqual(
      echec('SANS_DEPART'),
    );
  });

  it('UT-US-022-19 verifierRetour — accepte à 10 min exactement et rejette à 10 min + 1 ms', () => {
    expect(
      verifierRetour({
        stateRecu: DEPART.state,
        depart: DEPART,
        maintenant: instant('2026-10-27T08:10:00.000Z'),
      }),
    ).toEqual(succes(DEPART));
    expect(
      verifierRetour({
        stateRecu: DEPART.state,
        depart: DEPART,
        maintenant: instant('2026-10-27T08:10:00.001Z'),
      }),
    ).toEqual(echec('STATE_EXPIRE'));
  });
});
