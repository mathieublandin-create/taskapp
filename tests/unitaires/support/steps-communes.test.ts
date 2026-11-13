import { describe, expect, it } from 'vitest';
import { Instant } from '@src/commun/domaine/temps/instant';
import { echec, succes } from '@src/commun/domaine/resultat';
import { estConfirmationRequise } from '@tests/support/commandes-en-attente';
import {
  convertirAppareil,
  convertirDuree,
  convertirEcart,
  convertirFuseau,
  convertirHeure,
} from '@tests/support/conversions';
import { motifAction, motifAssertion, motifContexte } from '@tests/support/motifs-prefixes';
import { References } from '@tests/support/references';
import { instantDepuisHeureMurale } from '@tests/support/temps';
import { fuseau, idObjectif, instant } from '@tests/support/valeurs';

const PARIS = fuseau('Europe/Paris');
const heure = (texte: string) => convertirHeure(texte);

describe('Conversions des types de paramètres (conventions.md §11.7)', () => {
  it('UT-COMP-90 convertirDuree et convertirEcart — minutes et millisecondes, sans validation métier', () => {
    expect(['30 min', '1 h', '2 h 30', '0 h', '45 min'].map(convertirDuree)).toEqual([
      30, 60, 150, 0, 45,
    ]);
    expect(
      ['24 h', '24 h 1 min', '23 h 59 min', '5 min', '1 minute', '10 minutes', '60 minutes'].map(
        (texte) => convertirEcart(texte) / 60_000,
      ),
    ).toEqual([1440, 1441, 1439, 5, 1, 10, 60]);
    // ANO-001 (US-017 S06c, S06f) : « 5 secondes », unité ajoutée à {ecart}.
    expect(['5 secondes', '1 seconde'].map(convertirEcart)).toEqual([5000, 1000]);
  });

  it('UT-COMP-91 convertirHeure, convertirAppareil et convertirFuseau — formats du glossaire ; fuseau inconnu refusé', () => {
    expect(heure('09:05')).toEqual({ heures: 9, minutes: 5 });
    expect(convertirAppareil('PC')).toBe('pc');
    expect(convertirAppareil('smartphone')).toBe('smartphone');
    expect(convertirFuseau('Pacific/Auckland')).toBe('Pacific/Auckland');
    expect(() => convertirFuseau('Mars/Olympus')).toThrow();
  });
});

describe('Heures murales (ST-socle-ecriture.md §12 n° 1)', () => {
  it('UT-COMP-92 instantDepuisHeureMurale — heure ordinaire d’été et d’hiver à Paris', () => {
    expect(instantDepuisHeureMurale('2026-10-21', heure('10:00'), PARIS)).toBe(
      instant('2026-10-21T08:00:00.000Z'),
    );
    expect(instantDepuisHeureMurale('2026-12-15', heure('10:00'), PARIS)).toBe(
      instant('2026-12-15T09:00:00.000Z'),
    );
  });

  it('UT-COMP-93 instantDepuisHeureMurale — heure ambiguë : première occurrence ; heure inexistante : échec', () => {
    expect(instantDepuisHeureMurale('2026-10-25', heure('02:30'), PARIS)).toBe(
      instant('2026-10-25T00:30:00.000Z'),
    );
    expect(() => instantDepuisHeureMurale('2027-03-28', heure('02:30'), PARIS)).toThrow(
      /inexistante/,
    );
  });

  it('UT-COMP-94 instantDepuisHeureMurale — fuseaux de la CI, dont l’hémisphère sud', () => {
    expect(instantDepuisHeureMurale('2026-11-10', heure('23:00'), fuseau('America/New_York'))).toBe(
      instant('2026-11-11T04:00:00.000Z'),
    );
    expect(instantDepuisHeureMurale('2026-12-01', heure('12:00'), fuseau('Pacific/Auckland'))).toBe(
      instant('2026-11-30T23:00:00.000Z'),
    );
    expect(
      Instant.enIso(instantDepuisHeureMurale('2026-06-01', heure('00:00'), fuseau('UTC'))),
    ).toBe('2026-06-01T00:00:00.000Z');
  });
});

describe('Références et motifs de préfixe (conventions.md §11.7)', () => {
  it('UT-COMP-95 References.resoudre — élément unique, mémorisé après suppression, ambiguïté refusée', () => {
    const references = new References();
    const O1 = idObjectif(1);
    const O2 = idObjectif(2);
    references.memoriser('objectif', 'Ancien', O2);

    expect(references.resoudre('objectif', 'A', [{ id: O1, intitule: 'A', supprime: false }])).toBe(
      O1,
    );
    expect(
      references.resoudre('objectif', 'Ancien', [{ id: O2, intitule: 'Ancien', supprime: true }]),
    ).toBe(O2);
    expect(() =>
      references.resoudre('objectif', 'A', [
        { id: O1, intitule: 'A', supprime: false },
        { id: O2, intitule: 'A', supprime: false },
      ]),
    ).toThrow(/ambigu/);
    expect(() => references.resoudre('objectif', 'Inconnu', [])).toThrow(/inconnu/);
  });

  it('UT-COMP-96 motifContexte — « que » et « sur le {appareil}, » facultatifs', () => {
    const motif = motifContexte(/^le délai est "([^"]+)"$/);

    expect(motif.exec('le délai est "x"')?.slice(1)).toEqual([undefined, 'x']);
    expect(motif.exec('que sur le PC, le délai est "x"')?.slice(1)).toEqual(['PC', 'x']);
    expect(motif.test('sur le tablette, le délai est "x"')).toBe(false);
  });

  it('UT-COMP-97 motifAction — « {ecart} plus tard, » et « au même instant exact, »', () => {
    const motif = motifAction(/^l'utilisateur confirme$/);

    expect(motif.exec("l'utilisateur confirme")?.slice(1)).toEqual([
      undefined,
      undefined,
      undefined,
    ]);
    expect(
      motif.exec("10 minutes plus tard, sur le smartphone, l'utilisateur confirme")?.slice(1),
    ).toEqual(['10 minutes', undefined, 'smartphone']);
    expect(motif.exec("au même instant exact, l'utilisateur confirme")?.slice(1)).toEqual([
      undefined,
      'au même instant exact',
      undefined,
    ]);
    expect(motif.test("que l'utilisateur confirme")).toBe(false);
  });

  it('UT-COMP-98 motifAssertion — appareil désigné ou « sur les deux appareils, »', () => {
    const motif = motifAssertion(/^rien n'est affiché$/);

    expect(motif.exec("sur le PC, rien n'est affiché")?.slice(1)).toEqual(['PC', undefined]);
    expect(motif.exec("sur chacun des deux appareils, rien n'est affiché")?.slice(1)).toEqual([
      undefined,
      'sur chacun des deux appareils',
    ]);
    expect(motif.test("rien n'est affiché")).toBe(true);
  });

  it('UT-COMP-99 estConfirmationRequise — reconnaît la suite d’une confirmation', () => {
    const suite = { description: 'suite', executer: () => Promise.resolve(succes(undefined)) };

    expect(estConfirmationRequise({ type: 'CONFIRMATION_REQUISE', suite })).toBe(true);
    expect(estConfirmationRequise(echec('x'))).toBe(false);
    expect(estConfirmationRequise(undefined)).toBe(false);
  });
});
