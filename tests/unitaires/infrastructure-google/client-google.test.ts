import { describe, expect, it } from 'vitest';
import { traduireReponse } from '@src/infrastructure-google/client-google';

const erreurDrive = (reason: string) => ({ error: { code: 403, errors: [{ reason }] } });

describe('traduireReponse (ST-US-022 §6.8, DAT §4.4.5)', () => {
  it('UT-US-022-50 traduireReponse — applique la table de traduction des statuts et des raisons de Google', () => {
    expect(traduireReponse(401, undefined)).toEqual({ type: 'NonAutorise' });
    expect(traduireReponse(403, erreurDrive('storageQuotaExceeded'))).toEqual({
      type: 'EspaceDrivePlein',
    });
    expect(traduireReponse(403, erreurDrive('quotaExceeded'))).toEqual({
      type: 'EspaceDrivePlein',
    });
    expect(traduireReponse(403, erreurDrive('rateLimitExceeded'))).toEqual({
      type: 'QuotaDepasse',
    });
    expect(traduireReponse(403, erreurDrive('userRateLimitExceeded'))).toEqual({
      type: 'QuotaDepasse',
    });
    expect(traduireReponse(403, erreurDrive('domainPolicy'))).toEqual({
      type: 'DriveIndisponible',
      raison: 'domainPolicy',
    });
    expect(traduireReponse(403, undefined)).toEqual({
      type: 'DriveIndisponible',
      raison: 'inconnue',
    });
    expect(traduireReponse(404, undefined)).toEqual({ type: 'RessourceIntrouvable' });
    expect(traduireReponse(429, undefined)).toEqual({ type: 'QuotaDepasse' });
    expect(traduireReponse(503, undefined)).toEqual({ type: 'ErreurServeurDistant', statut: 503 });
  });
});
