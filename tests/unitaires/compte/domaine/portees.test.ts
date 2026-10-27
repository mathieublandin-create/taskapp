import { describe, expect, it } from 'vitest';
import { PORTEES_LOT_1, porteesManquantes } from '@src/compte/domaine/portees';

const DRIVE_FILE = 'https://www.googleapis.com/auth/drive.file';

describe('Portées du lot 1 (DS-05, ENF-05)', () => {
  it('UT-US-022-01 PORTEES_LOT_1 — demande exactement openid, email et drive.file, sans agenda, et se satisfait elle-même (CA-8)', () => {
    expect(PORTEES_LOT_1).toEqual(['openid', 'email', DRIVE_FILE]);
    expect(PORTEES_LOT_1.some((p) => p.includes('calendar'))).toBe(false);
    expect(porteesManquantes(PORTEES_LOT_1, PORTEES_LOT_1)).toEqual([]);
  });

  it('UT-US-022-02 porteesManquantes — reconnaît userinfo.email comme email quand Google renvoie ses noms longs (DS-05)', () => {
    const accordees = ['openid', 'https://www.googleapis.com/auth/userinfo.email', DRIVE_FILE];

    expect(porteesManquantes(accordees, PORTEES_LOT_1)).toEqual([]);
  });

  it('UT-US-022-03 porteesManquantes — renvoie drive.file quand l’utilisateur l’a décochée (CA-4)', () => {
    const accordees = ['openid', 'https://www.googleapis.com/auth/userinfo.email'];

    expect(porteesManquantes(accordees, PORTEES_LOT_1)).toEqual([DRIVE_FILE]);
  });
});
