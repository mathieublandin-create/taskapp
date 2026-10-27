import { describe, expect, it } from 'vitest';
import { MASQUE, masquerDonneesSensibles } from '@src/commun/infrastructure/journal-technique-local';

describe('masquerDonneesSensibles (conventions §9.4, RED-06)', () => {
  it('UT-US-022-48 masquerDonneesSensibles — masque jetons, en-tête Bearer, access_token= et adresses e-mail, et rien d’autre', () => {
    expect(masquerDonneesSensibles('jeton ya29.a0AfB_byC-123 reçu')).toBe(`jeton ${MASQUE} reçu`);
    expect(masquerDonneesSensibles('Authorization: Bearer abc.def-ghi')).toBe(`Authorization: ${MASQUE}`);
    expect(masquerDonneesSensibles('#access_token=xyz&state=s')).toBe(`#${MASQUE}&state=s`);
    expect(masquerDonneesSensibles('compte a.b@exemple.test connecté')).toBe(`compte ${MASQUE} connecté`);
    expect(masquerDonneesSensibles('Synchronisation terminée en 412 ms')).toBe('Synchronisation terminée en 412 ms');
  });
});
