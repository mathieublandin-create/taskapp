import { describe, expect, it } from 'vitest';
import { deciderOuverture, type EntreeOuverture } from '@src/compte/domaine/ouverture';

const BASE: EntreeOuverture = {
  sessionMemorisee: true,
  retour: 'AUCUN',
  departEnAttente: false,
  reseau: 'CONNECTE',
};

describe('deciderOuverture (DAT §4.1.7, RED-08)', () => {
  it('UT-US-022-08 deciderOuverture — écran de connexion sans session mémorisée, même si la page revient de Google (RG-019)', () => {
    expect(deciderOuverture({ ...BASE, sessionMemorisee: false })).toBe('ECRAN_CONNEXION');
    expect(deciderOuverture({ ...BASE, sessionMemorisee: false, retour: 'PRESENT' })).toBe(
      'ECRAN_CONNEXION',
    );
  });

  it('UT-US-022-09 deciderOuverture — traite le retour sans relancer de redirection, réseau coupé compris (RED-08)', () => {
    expect(deciderOuverture({ ...BASE, retour: 'PRESENT' })).toBe('TRAITER_RETOUR');
    expect(deciderOuverture({ ...BASE, retour: 'PRESENT', reseau: 'COUPE' })).toBe(
      'TRAITER_RETOUR',
    );
  });

  it('UT-US-022-10 deciderOuverture — lance une redirection silencieuse quand le réseau est là, sans retour ni départ en attente (DAT §4.1.7)', () => {
    expect(deciderOuverture(BASE)).toBe('REDIRECTION_SILENCIEUSE');
  });

  it('UT-US-022-11 deciderOuverture — ouvre sans jeton quand le réseau est coupé (ENF-T-01, US-018 CA-1)', () => {
    expect(deciderOuverture({ ...BASE, reseau: 'COUPE' })).toBe('OUVRIR_SANS_JETON');
  });

  it('UT-US-022-12 deciderOuverture — ouvre sans jeton quand un départ attend encore son retour (pas de boucle, EC-5, EC-8)', () => {
    expect(deciderOuverture({ ...BASE, departEnAttente: true })).toBe('OUVRIR_SANS_JETON');
  });
});
