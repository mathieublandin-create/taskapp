/**
 * Tests complémentaires de Bruce, tranche H1 du rang 11 (ST-US-017 v0.11 §6.8 n° 1 à 5, n° 12 à 15) : propriétés de
 * la correction d'horloge et de la fusion des éléments inconnus, réception (`planifierFusion`) et dépôt
 * (`contenuAEnvoyer`) des inconnus, en-tête `Date` aux limites.
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { lireDateHttp } from '@src/commun/domaine/temps/date-http';
import type { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import type { Instant } from '@src/commun/domaine/temps/instant';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import {
  corrigerRecul,
  medianeCorrection,
  mesurerEcart,
  qualifierSaut,
  retenirMesure,
} from '@src/synchronisation/domaine/correction-horloge';
import { contenuAEnvoyer } from '@src/synchronisation/domaine/depot';
import { ETAT_LOCAL_VIDE } from '@src/synchronisation/domaine/etat-local';
import { planifierFusion } from '@src/synchronisation/domaine/fusion';
import { comparerHlc, type Hlc } from '@src/synchronisation/domaine/hlc';
import {
  cleInconnue,
  fusionnerInconnus,
  hlcMaxInconnus,
  inconnusAEcrire,
  INCONNUS_VIDES,
  type Inconnus,
} from '@src/synchronisation/domaine/inconnus';
import { NOMBRE_MESURES_HORLOGE } from '@src/synchronisation/domaine/parametres-synchronisation';
import { etatLocal } from '@tests/support/fabriques/etat-local';
import { ecart, hlc, instant, PC, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

const T = instant('2026-10-21T08:00:00.000Z');
const APPAREILS = [SMARTPHONE, PC, TROISIEME] as const;

// HLC tirés dans une petite plage pour provoquer des égalités de clé et des comparaisons serrées.
const arbHlc: fc.Arbitrary<Hlc> = fc
  .record({
    ms: fc.integer({ min: 0, max: 5 }),
    compteur: fc.integer({ min: 0, max: 2 }),
    appareil: fc.constantFrom(...APPAREILS),
  })
  .map(({ ms, compteur, appareil }) => hlc(new Date(T + ms).toISOString(), compteur, appareil));

const arbInconnus: fc.Arbitrary<Inconnus> = fc
  .record({
    registres: fc.array(
      fc.record({
        type: fc.constantFrom('OBJECTIF', 'ETIQUETTE'),
        id: fc.constantFrom('a', 'b'),
        champ: fc.constantFrom('importance', 'couleur'),
        valeur: fc.integer(),
        hlc: arbHlc,
      }),
      { maxLength: 6 },
    ),
    evenements: fc.array(
      fc.record({
        id: fc.constantFrom('evt-a', 'evt-b', 'evt-c'),
        hlc: arbHlc,
        brut: fc.constant({ type: 'ETIQUETAGE' }),
      }),
      { maxLength: 4 },
    ),
  })
  // Inconnus tels qu'un fichier les porte : une entrée par clé, HLC de registre distincts par clé (n° 12).
  .map((i) => fusionnerInconnus(INCONNUS_VIDES, i));

/** Ensemble des clés et des HLC retenus : la fusion est comparée « au sens des ensembles de clés et des HLC ». */
const signature = (i: Inconnus) => ({
  registres: i.registres.map((r) => [cleInconnue(r), r.hlc]),
  evenements: i.evenements.map((e) => e.id),
});

const contenu = (p: Partial<ContenuFichierAppareil>): ContenuFichierAppareil => ({
  schemaVersion: 1,
  versionApplication: '0.1.0',
  generation: { type: 'INITIALE' },
  appareil: PC,
  registres: [],
  journal: [],
  ...p,
});

describe('Éléments inconnus : propriétés (ST-US-017 v0.11 §6.8 n° 13 à 15)', () => {
  it('UT-COMP-US-017-4-01 fusionnerInconnus est commutative, associative et idempotente au sens des clés et des HLC retenus ; résultat trié, une entrée par clé', () => {
    fc.assert(
      fc.property(arbInconnus, arbInconnus, arbInconnus, (a, b, c) => {
        const ab = fusionnerInconnus(a, b);
        expect(signature(ab)).toEqual(signature(fusionnerInconnus(b, a)));
        expect(signature(fusionnerInconnus(ab, c))).toEqual(
          signature(fusionnerInconnus(a, fusionnerInconnus(b, c))),
        );
        expect(fusionnerInconnus(ab, ab)).toEqual(ab);
        const cles = ab.registres.map(cleInconnue);
        expect(cles).toEqual([...new Set(cles)].sort());
        const ids = ab.evenements.map((e) => e.id);
        expect(ids).toEqual([...new Set(ids)].sort());
      }),
    );
  });

  it('UT-COMP-US-017-4-02 écrire inconnusAEcrire(locaux, reçus) sur les locaux donne la fusion ; rien à écrire quand les reçus sont déjà fusionnés ; hlcMaxInconnus majore chaque HLC', () => {
    fc.assert(
      fc.property(arbInconnus, arbInconnus, (locaux, recus) => {
        const ajouts = inconnusAEcrire(locaux, recus);
        const fusion = fusionnerInconnus(locaux, recus);
        expect(signature(fusionnerInconnus(ajouts, locaux))).toEqual(signature(fusion));
        expect(inconnusAEcrire(fusion, recus)).toEqual(INCONNUS_VIDES);
        const max = hlcMaxInconnus(fusion);
        for (const { hlc: h } of [...fusion.registres, ...fusion.evenements]) {
          expect(max !== undefined && comparerHlc(h, max) <= 0).toBe(true);
        }
      }),
    );
  });

  it('UT-COMP-US-017-4-03 inconnusAEcrire : une clé répétée parmi les reçus n’est écrite qu’une fois, avec le plus grand HLC', () => {
    const r = (h: Hlc, valeur: number) => ({
      type: 'OBJECTIF',
      id: 'a',
      champ: 'importance',
      valeur,
      hlc: h,
    });
    const recent = r(hlc('2026-10-21T08:05:00.000Z', 0, PC), 2);
    expect(
      inconnusAEcrire(INCONNUS_VIDES, {
        registres: [r(hlc('2026-10-21T08:01:00.000Z', 0, PC), 1), recent],
        evenements: [],
      }),
    ).toEqual({ registres: [recent], evenements: [] });
  });
});

describe('Réception et dépôt des inconnus (n° 12, n° 14, n° 15)', () => {
  it('UT-COMP-US-017-4-04 planifierFusion : le HLC reçu compte aussi les inconnus (registre ou entrée) ; un dernierHlc local plus grand est gardé', () => {
    const futur = hlc('2026-10-21T09:00:00.000Z', 3, TROISIEME);
    const local = etatLocal({
      appareilId: SMARTPHONE,
      dernierHlc: hlc('2026-10-21T08:30:00.000Z', 0, SMARTPHONE),
    });
    const parRegistre = contenu({
      inconnus: {
        registres: [{ type: 'ETIQUETTE', id: 'e', champ: 'nom', valeur: 'x', hlc: futur }],
        evenements: [],
      },
    });
    expect(planifierFusion(local, parRegistre).etatApres.dernierHlc).toEqual(futur);
    const parEntree = contenu({
      inconnus: { registres: [], evenements: [{ id: 'evt', hlc: futur, brut: {} }] },
    });
    expect(planifierFusion(local, parEntree).etatApres.dernierHlc).toEqual(futur);
    expect(planifierFusion(ETAT_LOCAL_VIDE(SMARTPHONE), parEntree).etatApres.dernierHlc).toEqual(
      futur,
    );

    const ancien = hlc('2026-10-21T08:00:00.000Z', 0, TROISIEME);
    const passe = contenu({
      inconnus: { registres: [], evenements: [{ id: 'evt', hlc: ancien, brut: {} }] },
    });
    expect(planifierFusion(local, passe).etatApres.dernierHlc).toEqual(local.dernierHlc);
    // Les inconnus ne sont ni projetés ni écrits par planifierFusion (le cycle les écrit, n° 14).
    expect(planifierFusion(local, parRegistre).registresEcrits).toEqual([]);
    expect(planifierFusion(local, parRegistre).evenementsAjoutes).toEqual([]);
  });

  it('UT-COMP-US-017-4-05 contenuAEnvoyer : inconnus recopiés tels quels s’ils sont non vides (registres seuls, entrées seules), absents sinon', () => {
    const p = { versionApplication: '0.1.0', generation: { type: 'INITIALE' } as const };
    const etat = ETAT_LOCAL_VIDE(SMARTPHONE);
    const registresSeuls: Inconnus = {
      registres: [
        {
          type: 'X',
          id: 'x',
          champ: 'y',
          valeur: null,
          hlc: hlc('2026-10-21T08:00:00.000Z', 0, PC),
        },
      ],
      evenements: [],
    };
    const entreesSeules: Inconnus = {
      registres: [],
      evenements: [{ id: 'e', hlc: hlc('2026-10-21T08:00:00.000Z', 0, PC), brut: {} }],
    };
    expect(contenuAEnvoyer(etat, { ...p, inconnus: registresSeuls }).inconnus).toBe(registresSeuls);
    expect(contenuAEnvoyer(etat, { ...p, inconnus: entreesSeules }).inconnus).toBe(entreesSeules);
    expect('inconnus' in contenuAEnvoyer(etat, { ...p, inconnus: INCONNUS_VIDES })).toBe(false);
  });
});

describe('Correction d’horloge : propriétés (n° 1 à 3)', () => {
  it('UT-COMP-US-017-4-06 retenirMesure garde au plus NOMBRE_MESURES_HORLOGE mesures (au moins une), les dernières, dans l’ordre ; la médiane est encadrée par le minimum et le maximum', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: -1e9, max: 1e9 }), { minLength: 1, maxLength: 12 }),
        (suite) => {
          const mesures = suite.reduce<ReadonlyArray<EcartTemps>>(
            (m, x) => retenirMesure(m, ecart(x)),
            [],
          );
          expect(mesures).toEqual(suite.slice(-NOMBRE_MESURES_HORLOGE));
          const mediane = medianeCorrection(mesures);
          expect(mediane).toBeGreaterThanOrEqual(Math.min(...mesures));
          expect(mediane).toBeLessThanOrEqual(Math.max(...mesures));
          expect(Number.isSafeInteger(mediane)).toBe(true);
        },
      ),
    );
  });

  it('UT-COMP-US-017-4-07 un saut de l’horloge murale pendant la requête ne change pas la mesure ; un recul corrigé ramène la correction à l’heure de Google', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 2_999 }),
        fc.integer({ min: -1e8, max: 1e8 }),
        fc.integer({ min: 2_001, max: 1e8 }),
        (aller, correction, recul) => {
          // L'heure de Google au milieu de l'échange vaut l'heure de l'appareil + correction.
          const envoiMurale = T;
          const date = (T + Math.floor(aller / 2) + correction) as Instant;
          const mesure = mesurerEcart({
            envoiMonotone: ecart(500),
            receptionMonotone: ecart(500 + aller),
            envoiMurale,
            date,
          });
          expect(mesure).toBe(correction);
          // L'horloge murale recule de `recul` : la monotone avance d'une minute, la murale de 1 min − recul.
          const saut = qualifierSaut(
            { murale: T, monotone: ecart(0) },
            { murale: (T + 60_000 - recul) as Instant, monotone: ecart(60_000) },
          );
          expect(saut).toEqual({ type: 'RECUL', ecart: recul });
          // Après le recul, la même heure de Google est mesurée `recul` plus loin : la correction suit.
          const corrige = corrigerRecul(
            { correction: ecart(correction), mesures: [] },
            ecart(recul),
          );
          expect(
            mesurerEcart({
              envoiMonotone: ecart(500),
              receptionMonotone: ecart(500 + aller),
              envoiMurale: (envoiMurale - recul) as Instant,
              date,
            }),
          ).toBe(corrige.correction);
        },
      ),
    );
  });

  it('UT-COMP-US-017-4-08 lireDateHttp : bornes de l’heure et du calendrier (fin d’année, 29 février non bissextile, seconde 60, mois en minuscules)', () => {
    expect(lireDateHttp('Thu, 31 Dec 2026 23:59:59 GMT')).toBe(instant('2026-12-31T23:59:59.000Z'));
    expect(lireDateHttp('Fri, 01 Jan 2027 00:00:00 GMT')).toBe(instant('2027-01-01T00:00:00.000Z'));
    for (const invalide of [
      'Sun, 29 Feb 2026 08:00:00 GMT',
      'Wed, 21 Oct 2026 08:00:60 GMT',
      'Wed, 21 Oct 2026 08:60:00 GMT',
      'Wed, 21 oct 2026 08:00:00 GMT',
      'Wed, 00 Oct 2026 08:00:00 GMT',
      'Wed, 21 Oct 2026 08:00:00 GMT ',
      'Wed,  21 Oct 2026 08:00:00 GMT',
    ]) {
      expect(lireDateHttp(invalide)).toBe(undefined);
    }
  });
});
