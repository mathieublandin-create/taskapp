import { describe, expect, it } from 'vitest';
import { COMPTEUR_HLC_MAX, comparerHlc, hlcSuivant } from '@src/synchronisation/domaine/hlc';
import { hlc, instant, PC, SMARTPHONE } from '@tests/support/valeurs';

describe('hlcSuivant (DAT §6.4, ADR-011)', () => {
  it('UT-SOC-08 hlcSuivant — prend l’heure physique corrigée et un compteur à 0 quand il n’y a pas de dernier HLC', () => {
    const resultat = hlcSuivant(undefined, instant('2026-10-21T08:00:00.000Z'), SMARTPHONE);

    expect(resultat).toEqual(hlc('2026-10-21T08:00:00.000Z', 0, SMARTPHONE));
  });

  it('UT-SOC-08 hlcSuivant — prend l’heure physique et un compteur à 0 quand elle dépasse le dernier HLC', () => {
    const dernier = hlc('2026-10-21T08:00:00.000Z', 7, PC);

    const resultat = hlcSuivant(dernier, instant('2026-10-21T08:00:00.001Z'), SMARTPHONE);

    expect(resultat).toEqual(hlc('2026-10-21T08:00:00.001Z', 0, SMARTPHONE));
  });

  it('UT-SOC-09 hlcSuivant — incrémente le compteur quand l’heure physique est celle du dernier HLC, reçu d’un autre appareil', () => {
    const dernier = hlc('2026-10-21T08:00:00.000Z', 3, PC);

    const resultat = hlcSuivant(dernier, instant('2026-10-21T08:00:00.000Z'), SMARTPHONE);

    expect(resultat).toEqual(hlc('2026-10-21T08:00:00.000Z', 4, SMARTPHONE));
  });

  it('UT-SOC-10 hlcSuivant — ne recule jamais quand l’horloge murale recule (DAT §6.4 point 3)', () => {
    const dernier = hlc('2026-10-21T08:00:00.000Z', 3, SMARTPHONE);

    const resultat = hlcSuivant(dernier, instant('2026-10-21T07:00:00.000Z'), SMARTPHONE);

    expect(resultat).toEqual(hlc('2026-10-21T08:00:00.000Z', 4, SMARTPHONE));
  });

  it('UT-SOC-11 hlcSuivant — avance l’heure physique d’1 ms et remet le compteur à 0 quand il atteint COMPTEUR_HLC_MAX', () => {
    const dernier = hlc('2026-10-21T08:00:00.000Z', COMPTEUR_HLC_MAX, SMARTPHONE);

    const resultat = hlcSuivant(dernier, instant('2026-10-21T08:00:00.000Z'), SMARTPHONE);

    expect(resultat).toEqual(hlc('2026-10-21T08:00:00.001Z', 0, SMARTPHONE));
  });
});

describe('comparerHlc (DS-11)', () => {
  it('UT-SOC-12 comparerHlc — ordonne par heure physique, puis compteur, puis appareil', () => {
    const t = '2026-10-21T08:00:00.000Z';
    const plusTard = '2026-10-21T08:00:00.001Z';

    expect(comparerHlc(hlc(t, 9, PC), hlc(plusTard, 0, SMARTPHONE))).toBe(-1);
    expect(comparerHlc(hlc(t, 1, PC), hlc(t, 2, SMARTPHONE))).toBe(-1);
    expect(comparerHlc(hlc(t, 1, SMARTPHONE), hlc(t, 1, PC))).toBe(-1);
    expect(comparerHlc(hlc(t, 1, PC), hlc(t, 1, SMARTPHONE))).toBe(1);
    expect(comparerHlc(hlc(t, 1, PC), hlc(t, 1, PC))).toBe(0);
  });
});
