import { describe, expect, it } from 'vitest';
import {
  CONTEXTE_VIDE,
  contexteDeNouvelleEcriture,
  estConnue,
  type EcritureDatee,
} from '@src/synchronisation/domaine/contexte-causal';
import { hlc, PC, SMARTPHONE } from '@tests/support/valeurs';

const hA = hlc('2026-10-21T08:00:00.000Z', 0, PC);

describe('contexteDeNouvelleEcriture (DAT §4.2.1)', () => {
  it('UT-SOC-13 contexteDeNouvelleEcriture — renvoie le contexte vide pour une création', () => {
    expect(contexteDeNouvelleEcriture(undefined, SMARTPHONE)).toEqual(CONTEXTE_VIDE);
  });

  it('UT-SOC-14 contexteDeNouvelleEcriture — contient l’HLC de l’écriture du PC, sans entrée du smartphone auteur', () => {
    const precedente: EcritureDatee = {
      hlc: hA,
      contexte: { [SMARTPHONE]: hlc('2026-10-21T07:00:00.000Z', 0, SMARTPHONE) },
    };

    const contexte = contexteDeNouvelleEcriture(precedente, SMARTPHONE);

    expect(contexte).toEqual({ [PC]: hA });
  });
});

describe('estConnue (DAT §4.2.1, RG-036)', () => {
  it('UT-SOC-15 estConnue — C connaît A dans la chaîne A (PC) → B → C (smartphone)', () => {
    const a: EcritureDatee = { hlc: hA, contexte: CONTEXTE_VIDE };
    const b: EcritureDatee = {
      hlc: hlc('2026-10-21T08:01:00.000Z', 0, SMARTPHONE),
      contexte: contexteDeNouvelleEcriture(a, SMARTPHONE),
    };
    const c: EcritureDatee = {
      hlc: hlc('2026-10-21T08:02:00.000Z', 0, SMARTPHONE),
      contexte: contexteDeNouvelleEcriture(b, SMARTPHONE),
    };

    expect(c.contexte).toEqual({ [PC]: hA });
    expect(estConnue(c, a)).toBe(true);
  });

  it('UT-SOC-16 estConnue — B ne connaît pas A quand les écritures sont concurrentes (US-017 S10)', () => {
    const a: EcritureDatee = { hlc: hA, contexte: CONTEXTE_VIDE };
    const b: EcritureDatee = {
      hlc: hlc('2026-10-21T08:05:00.000Z', 0, SMARTPHONE),
      contexte: CONTEXTE_VIDE,
    };

    expect(estConnue(b, a)).toBe(false);
  });

  it('UT-SOC-16 estConnue — B ne connaît pas A quand son contexte ne connaît qu’une écriture plus ancienne du PC', () => {
    const a: EcritureDatee = {
      hlc: hlc('2026-10-21T08:03:00.000Z', 0, PC),
      contexte: CONTEXTE_VIDE,
    };
    const b: EcritureDatee = {
      hlc: hlc('2026-10-21T08:05:00.000Z', 0, SMARTPHONE),
      contexte: { [PC]: hA },
    };

    expect(estConnue(b, a)).toBe(false);
  });

  it('UT-SOC-16 estConnue — une écriture antérieure ou égale du même appareil est connue (DAT v0.11.9 §4.2.1, « ses propres écritures antérieures »)', () => {
    const anterieure: EcritureDatee = { hlc: hA, contexte: CONTEXTE_VIDE };
    const gagnante: EcritureDatee = {
      hlc: hlc('2026-10-21T09:00:00.000Z', 0, PC),
      contexte: CONTEXTE_VIDE,
    };

    expect(estConnue(gagnante, anterieure)).toBe(true);
    expect(estConnue(gagnante, gagnante)).toBe(true);
  });

  it('UT-SOC-16 estConnue — une écriture postérieure du même appareil n’est pas connue (condition J1 de Starck, Q-BRU-4 : pierre tombale et réparation RG-048 écrite après elle)', () => {
    const posterieure: EcritureDatee = {
      hlc: hlc('2026-10-21T09:00:00.000Z', 0, PC),
      contexte: CONTEXTE_VIDE,
    };
    const gagnante: EcritureDatee = { hlc: hA, contexte: CONTEXTE_VIDE };

    expect(estConnue(gagnante, posterieure)).toBe(false);
  });
});
