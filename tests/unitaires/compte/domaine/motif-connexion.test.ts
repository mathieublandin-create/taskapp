import { describe, expect, it } from 'vitest';
import { motifEchecConnexion } from '@src/compte/domaine/motif-connexion';

const SANS_ESPACE = { espaceLocalExistant: false };
const AVEC_ESPACE = { espaceLocalExistant: true };

describe('motifEchecConnexion (US-022, guide §6.6.8)', () => {
  it('UT-US-022-04 motifEchecConnexion — ERR-003 sans espace local, ERR-004 avec un espace local, quand le réseau manque (S20a, S22, S18)', () => {
    expect(motifEchecConnexion('HORS_LIGNE', SANS_ESPACE)).toBe('ERR-003');
    expect(motifEchecConnexion('HORS_LIGNE', AVEC_ESPACE)).toBe('ERR-004');
  });

  it('UT-US-022-05 motifEchecConnexion — ERR-001 pour une annulation et ERR-002 pour des autorisations refusées (CA-4)', () => {
    expect(motifEchecConnexion('ANNULEE', SANS_ESPACE)).toBe('ERR-001');
    expect(motifEchecConnexion('PORTEES_REFUSEES', AVEC_ESPACE)).toBe('ERR-002');
  });

  it('UT-US-022-06 motifEchecConnexion — ERR-005 pour une interruption ou un Drive momentanément indisponible, ERR-006 pour un Drive indisponible pour le compte (S20b, S20c, S21)', () => {
    expect(motifEchecConnexion('INTERROMPUE', SANS_ESPACE)).toBe('ERR-005');
    expect(motifEchecConnexion('DRIVE_MOMENTANEMENT_INDISPONIBLE', SANS_ESPACE)).toBe('ERR-005');
    expect(motifEchecConnexion('DRIVE_INDISPONIBLE_POUR_LE_COMPTE', AVEC_ESPACE)).toBe('ERR-006');
  });
});
