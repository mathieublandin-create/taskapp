/**
 * Correction d'horloge (ST-US-017 v0.11 §6.8 n° 1 à 5 ; DAT v0.11.3 §6.4, Q-ST017-STA-2 ; US-017 CA-13). Fonctions
 * pures du domaine. Convention : correction = heure de Google − heure de l'appareil. UT-US-017-75 à 78 (rang 11).
 */
import { describe, expect, it } from 'vitest';
import {
  corrigerRecul,
  enHeureAppareil,
  estHorlogeDereglee,
  medianeCorrection,
  mesurerEcart,
  qualifierSaut,
  retenirMesure,
} from '@src/synchronisation/domaine/correction-horloge';
import {
  ALLER_RETOUR_MAX_MESURE_HORLOGE,
  NOMBRE_MESURES_HORLOGE,
  SEUIL_HORLOGE_DEREGLEE,
  SEUIL_SAUT_HORLOGE,
} from '@src/synchronisation/domaine/parametres-synchronisation';
import { ecart, HEURE, instant, MINUTE } from '@tests/support/valeurs';

const T = instant('2026-10-21T08:00:00.000Z');
const echange = (p: { aller: number; murale?: number; date: number }) => ({
  envoiMonotone: ecart(10_000),
  receptionMonotone: ecart(10_000 + p.aller),
  envoiMurale: instant(new Date(T + (p.murale ?? 0)).toISOString()),
  date: instant(new Date(T + p.date).toISOString()),
});

describe('Mesure de l’écart avec Google (ST-US-017 v0.11 §6.8 n° 1)', () => {
  it('UT-US-017-75 mesure = Date − (envoi + ⌊aller-retour / 2⌋) ; retenue seulement si l’aller-retour est strictement inférieur à 3 s et non négatif', () => {
    // Appareil en retard de 25 h, aller-retour de 1 s : milieu = envoi + 500 ms.
    expect(mesurerEcart(echange({ aller: 1_000, murale: -25 * HEURE, date: 500 }))).toBe(
      25 * HEURE,
    );
    // Appareil en avance de 5 min, aller-retour nul.
    expect(mesurerEcart(echange({ aller: 0, murale: 5 * MINUTE, date: 0 }))).toBe(-5 * MINUTE);
    // Aller-retour impair : moitié arrondie vers le bas (999 → 499).
    expect(mesurerEcart(echange({ aller: 999, date: 1_000 }))).toBe(501);
    expect(
      mesurerEcart(echange({ aller: ALLER_RETOUR_MAX_MESURE_HORLOGE - 1, date: 0 })),
    ).toBeDefined();
    expect(mesurerEcart(echange({ aller: ALLER_RETOUR_MAX_MESURE_HORLOGE, date: 0 }))).toBe(
      undefined,
    );
    expect(mesurerEcart(echange({ aller: 10_000, date: 0 }))).toBe(undefined);
    expect(mesurerEcart(echange({ aller: -1, date: 0 }))).toBe(undefined);
  });
});

describe('Lissage : médiane des 5 dernières mesures (n° 2)', () => {
  it('UT-US-017-76 les 5 dernières mesures sont gardées dans l’ordre d’arrivée ; médiane (nombre pair : moyenne des deux centrales arrondie vers −∞) ; aucune mesure : undefined', () => {
    expect(NOMBRE_MESURES_HORLOGE).toBe(5);
    let mesures: ReadonlyArray<ReturnType<typeof ecart>> = [];
    for (const m of [1, 2, 3, 4, 5, 6, 7]) mesures = retenirMesure(mesures, ecart(m * 1_000));
    expect(mesures).toEqual([3_000, 4_000, 5_000, 6_000, 7_000]);

    // Une réponse retardée (valeur extrême) ne déplace pas la médiane.
    expect(
      medianeCorrection([ecart(100), ecart(90 * MINUTE), ecart(80), ecart(120), ecart(110)]),
    ).toBe(110);
    expect(medianeCorrection([ecart(25 * HEURE)])).toBe(25 * HEURE);
    expect(medianeCorrection([ecart(100), ecart(201)])).toBe(150);
    expect(medianeCorrection([ecart(-201), ecart(-100)])).toBe(-151);
    expect(medianeCorrection([ecart(4), ecart(1), ecart(3), ecart(2)])).toBe(2);
    expect(medianeCorrection([])).toBe(undefined);
  });
});

describe('Sauts de l’horloge murale (n° 3)', () => {
  const repere = (murale: number, monotone: number) => ({
    murale: instant(new Date(T + murale).toISOString()),
    monotone: ecart(monotone),
  });

  it('UT-US-017-77 recul au-delà de 2 s : RECUL de l’écart exact ; avance au-delà de 2 s : AVANCE ; à 2 s près (bornes comprises) : AUCUN', () => {
    expect(SEUIL_SAUT_HORLOGE).toBe(2_000);
    const avant = repere(0, 1_000);
    // Une minute de temps monotone, l'horloge murale n'a avancé que de 50 s : recul de 10 s.
    expect(qualifierSaut(avant, repere(50_000, 61_000))).toEqual({ type: 'RECUL', ecart: 10_000 });
    // Changement d'heure de −25 h page ouverte.
    expect(qualifierSaut(avant, repere(MINUTE - 25 * HEURE, 1_000 + MINUTE))).toEqual({
      type: 'RECUL',
      ecart: 25 * HEURE,
    });
    // Veille d'une heure : la monotone s'est arrêtée, la murale a avancé.
    expect(qualifierSaut(avant, repere(HEURE + MINUTE, 1_000 + MINUTE))).toEqual({
      type: 'AVANCE',
      ecart: HEURE,
    });
    expect(qualifierSaut(avant, repere(MINUTE - 2_000, 1_000 + MINUTE))).toEqual({ type: 'AUCUN' });
    expect(qualifierSaut(avant, repere(MINUTE + 2_000, 1_000 + MINUTE))).toEqual({ type: 'AUCUN' });
    expect(qualifierSaut(avant, repere(MINUTE - 2_001, 1_000 + MINUTE))).toEqual({
      type: 'RECUL',
      ecart: 2_001,
    });
    expect(qualifierSaut(avant, repere(MINUTE + 2_001, 1_000 + MINUTE))).toEqual({
      type: 'AVANCE',
      ecart: 2_001,
    });
  });

  it('UT-US-017-77 recul corrigé exactement : correction et chaque mesure conservée augmentées de l’écart, ordre gardé', () => {
    expect(
      corrigerRecul(
        { correction: ecart(1_000), mesures: [ecart(900), ecart(1_100), ecart(1_000)] },
        ecart(25 * HEURE),
      ),
    ).toEqual({
      correction: 25 * HEURE + 1_000,
      mesures: [25 * HEURE + 900, 25 * HEURE + 1_100, 25 * HEURE + 1_000],
    });
    expect(corrigerRecul({ correction: ecart(0), mesures: [] }, ecart(10_000))).toEqual({
      correction: 10_000,
      mesures: [],
    });
  });
});

describe('Horloge déréglée et heure de l’appareil (n° 4, n° 5)', () => {
  it('UT-US-017-78 ALR-001 au-delà de 24 h strictement, dans les deux sens (US-017 CA-13, S13a, S13b) ; un instant corrigé est ramené à l’heure de l’appareil', () => {
    expect(SEUIL_HORLOGE_DEREGLEE).toBe(24 * HEURE);
    expect(estHorlogeDereglee(ecart(24 * HEURE))).toBe(false);
    expect(estHorlogeDereglee(ecart(-24 * HEURE))).toBe(false);
    expect(estHorlogeDereglee(ecart(23 * HEURE + 59 * MINUTE))).toBe(false);
    expect(estHorlogeDereglee(ecart(5 * MINUTE))).toBe(false);
    expect(estHorlogeDereglee(ecart(24 * HEURE + 1))).toBe(true);
    expect(estHorlogeDereglee(ecart(-(24 * HEURE + 1)))).toBe(true);
    expect(estHorlogeDereglee(ecart(24 * HEURE + MINUTE))).toBe(true);
    expect(estHorlogeDereglee(ecart(-25 * HEURE))).toBe(true);

    // Appareil en retard de 25 h (correction + 25 h) : une écriture datée (corrigée) de 10:00 l'a été à 09:00 la veille.
    expect(enHeureAppareil(instant('2026-10-21T08:00:00.000Z'), ecart(25 * HEURE))).toBe(
      instant('2026-10-20T07:00:00.000Z'),
    );
    expect(enHeureAppareil(T, ecart(0))).toBe(T);
    expect(enHeureAppareil(T, ecart(-5 * MINUTE))).toBe(T + 5 * MINUTE);
  });
});
