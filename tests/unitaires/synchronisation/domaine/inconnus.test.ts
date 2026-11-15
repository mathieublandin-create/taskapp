/**
 * Éléments inconnus de même `schemaVersion` (RG-058 ; ANT-19 ; ST-US-017 v0.11 §6.8 n° 12 à 15) : fusion par HLC,
 * union des entrées de journal, ce qu'une fusion écrit, plus grand HLC. UT-US-017-85 (rang 11, tranche H1).
 */
import { describe, expect, it } from 'vitest';
import {
  cleInconnue,
  fusionnerInconnus,
  hlcMaxInconnus,
  inconnusAEcrire,
  INCONNUS_VIDES,
  type EvenementInconnu,
  type Inconnus,
  type RegistreInconnu,
} from '@src/synchronisation/domaine/inconnus';
import { hlc, PC, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

const h = (minute: number, appareil = PC) =>
  hlc(`2026-10-21T08:${String(minute).padStart(2, '0')}:00.000Z`, 0, appareil);
const r = (type: string, champ: string, valeur: unknown, hl = h(1)): RegistreInconnu => ({
  type,
  id: 'a0000000-0000-7000-8000-000000000001',
  champ,
  valeur,
  hlc: hl,
});
const e = (id: string, hl = h(1)): EvenementInconnu => ({
  id,
  hlc: hl,
  brut: { type: 'ETIQUETAGE', id },
});
const inc = (
  registres: ReadonlyArray<RegistreInconnu>,
  evenements: ReadonlyArray<EvenementInconnu> = [],
): Inconnus => ({
  registres,
  evenements,
});

describe('Fusion des éléments inconnus (n° 12, n° 13)', () => {
  it('UT-US-017-85 par clé, le registre de plus grand HLC ; union des entrées par identifiant ; résultat trié par clé puis identifiant ; commutative, associative, idempotente sur des HLC distincts', () => {
    const ancienne = r('OBJECTIF', 'importance', 1, h(1, SMARTPHONE));
    const recente = r('OBJECTIF', 'importance', 3, h(5, PC));
    const etiquette = r('ETIQUETTE', 'nom', 'Travail', h(2, TROISIEME));
    const a = inc([ancienne], [e('evt-b', h(3))]);
    const b = inc([recente, etiquette], [e('evt-a', h(4)), e('evt-b', h(3))]);
    const c = inc([r('OBJECTIF', 'couleur', 'rouge', h(6, SMARTPHONE))]);

    const ab = fusionnerInconnus(a, b);
    expect(ab).toEqual(inc([etiquette, recente], [e('evt-a', h(4)), e('evt-b', h(3))]));
    expect(ab.registres.map(cleInconnue)).toEqual([
      'ETIQUETTE:a0000000-0000-7000-8000-000000000001:nom',
      'OBJECTIF:a0000000-0000-7000-8000-000000000001:importance',
    ]);
    expect(fusionnerInconnus(b, a)).toEqual(ab);
    expect(fusionnerInconnus(fusionnerInconnus(a, b), c)).toEqual(
      fusionnerInconnus(a, fusionnerInconnus(b, c)),
    );
    expect(fusionnerInconnus(ab, ab)).toEqual(ab);
    expect(fusionnerInconnus(ab, INCONNUS_VIDES)).toEqual(ab);
    expect(fusionnerInconnus(INCONNUS_VIDES, INCONNUS_VIDES)).toEqual(INCONNUS_VIDES);
  });

  it('UT-US-017-85 ce qu’une fusion écrit : registre reçu absent ou strictement plus récent, entrée reçue absente ; jamais une valeur plus ancienne ou identique ; plus grand HLC des registres et des entrées', () => {
    const locaux = inc([r('OBJECTIF', 'importance', 3, h(5))], [e('evt-a', h(4))]);
    const recus = inc(
      [r('OBJECTIF', 'importance', 1, h(1)), r('OBJECTIF', 'couleur', 'rouge', h(2))],
      [e('evt-a', h(4)), e('evt-c', h(7, SMARTPHONE))],
    );
    expect(inconnusAEcrire(locaux, recus)).toEqual(
      inc([r('OBJECTIF', 'couleur', 'rouge', h(2))], [e('evt-c', h(7, SMARTPHONE))]),
    );
    expect(inconnusAEcrire(locaux, inc([r('OBJECTIF', 'importance', 4, h(6))]))).toEqual(
      inc([r('OBJECTIF', 'importance', 4, h(6))]),
    );
    expect(inconnusAEcrire(locaux, locaux)).toEqual(INCONNUS_VIDES);

    expect(hlcMaxInconnus(INCONNUS_VIDES)).toBe(undefined);
    expect(hlcMaxInconnus(recus)).toEqual(h(7, SMARTPHONE));
    expect(hlcMaxInconnus(locaux)).toEqual(h(5));
  });
});
