/**
 * Propriétés de convergence des contrôles du Drive (ST-US-017 v0.10.1 §6.7 n° 1 à 11 ; DAT v0.11.10 §4.2.2,
 * conditions C1, C2, C3, C8, C9 de Starck). Tests complémentaires de Bruce (tranche R2), en plus d'UT-US-017-60 à 64.
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import type { Instant } from '@src/commun/domaine/temps/instant';
import type {
  ContenuFichierAppareil,
  ContenuManifeste,
  Generation,
} from '@src/synchronisation/domaine/contenu-fichier';
import {
  comparerGenerations,
  controlerDrive,
  GENERATION_INITIALE,
  generationMax,
  hlcPlancherDesChoix,
  restaurationConnueApres,
  type DecisionControle,
  type LectureDrive,
  type ObservationDrive,
  type SituationLocale,
} from '@src/synchronisation/domaine/controle-drive';
import {
  planReinitialisation,
  valeursDonneesEffacees,
} from '@src/synchronisation/domaine/donnees-effacees';
import { comparerHlc, hlcSuivant, maxHlc, type Hlc } from '@src/synchronisation/domaine/hlc';
import type { CleInformation } from '@src/synchronisation/domaine/information';
import {
  META_INITIALE,
  type IdFichierDrive,
} from '@src/synchronisation/domaine/meta-synchronisation';
import { etatLocal, registre } from '@tests/support/fabriques/etat-local';
import { date, idObjectif, instant, PC, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

const GRAINE = { seed: 20261101, numRuns: 300 } as const;
const ORIGINE = instant('2026-10-21T08:00:00.000Z');
const MOI = SMARTPHONE;

const hlcA: fc.Arbitrary<Hlc> = fc
  .record({
    ms: fc.integer({ min: 0, max: 6 }),
    compteur: fc.integer({ min: 0, max: 2 }),
    appareil: fc.constantFrom<IdAppareil>(SMARTPHONE, PC, TROISIEME),
  })
  .map(({ ms, compteur, appareil }) => ({
    physique: (ORIGINE + ms) as Instant,
    compteur,
    appareil,
  }));

const generationA: fc.Arbitrary<Generation> = fc.oneof(
  fc.constant(GENERATION_INITIALE),
  hlcA.map((h): Generation => ({ type: 'NOUVELLE', hlc: h })),
);

const manifesteA: fc.Arbitrary<ContenuManifeste> = fc
  .record({ generation: generationA, restauration: fc.option(hlcA, { nil: undefined }) })
  .map(({ generation, restauration }) => ({
    schemaVersion: 1,
    generation,
    ...(restauration === undefined ? {} : { restauration }),
  }));

const fichierA = (appareil: fc.Arbitrary<IdAppareil>): fc.Arbitrary<ContenuFichierAppareil> =>
  fc
    .record({ appareil, generation: generationA, hlcs: fc.array(hlcA, { maxLength: 3 }) })
    .map(({ appareil: a, generation, hlcs }) => ({
      schemaVersion: 1,
      versionApplication: '0.1.0',
      generation,
      appareil: a,
      registres: hlcs.map((h, i) =>
        registre(
          { type: 'OBJECTIF', id: idObjectif(i + 1), champ: 'delai' },
          date('2026-12-15'),
          h,
        ),
      ),
      journal: [],
    }));

const lectureA = <T>(
  contenu: fc.Arbitrary<T>,
  avecFormat: boolean,
): fc.Arbitrary<LectureDrive<T>> =>
  fc.oneof(
    { weight: 6, arbitrary: contenu.map((c): LectureDrive<T> => ({ type: 'LU', contenu: c })) },
    { weight: 2, arbitrary: fc.constant<LectureDrive<T>>({ type: 'ILLISIBLE' }) },
    {
      weight: avecFormat ? 1 : 0,
      arbitrary: fc.constant<LectureDrive<T>>({ type: 'FORMAT_PLUS_RECENT', schemaVersion: 2 }),
    },
  );

const fichiersIdentifies = (
  prefixe: string,
  appareil: fc.Arbitrary<IdAppareil>,
  avecFormat: boolean,
): fc.Arbitrary<ObservationDrive['autres']> =>
  fc
    .array(lectureA(fichierA(appareil), avecFormat), { maxLength: 3 })
    .map((lectures) =>
      lectures.map((lecture, i) => ({ id: `${prefixe}${String(i)}` as IdFichierDrive, lecture })),
    );

const observationA = (avecFormat: boolean): fc.Arbitrary<ObservationDrive> =>
  fc
    .record({
      dossierPresent: fc.boolean(),
      manifestes: fc.array(lectureA(manifesteA, avecFormat), { maxLength: 3 }),
      fichierPropre: fc.oneof(
        fc.constant<ObservationDrive['fichierPropre']>({ type: 'ABSENT' }),
        fc.constant<ObservationDrive['fichierPropre']>({ type: 'INCHANGE' }),
        lectureA(fichierA(fc.constant(MOI)), avecFormat),
      ),
      autres: fichiersIdentifies('f-', fc.constantFrom<IdAppareil>(PC, TROISIEME), avecFormat),
      autresPresents: fc.boolean(),
      orphelins: fichiersIdentifies('o-', fc.constant(MOI), avecFormat),
    })
    .map((o) => ({
      ...o,
      manifestes: o.manifestes.map((lecture, i) => ({
        id: `m${String(i)}` as IdFichierDrive,
        lecture,
      })),
      autresPresents: o.autresPresents || o.autres.length > 0,
    }));

const situationA: fc.Arbitrary<SituationLocale> = fc
  .record({
    manifesteAttendu: fc.boolean(),
    fichierPropreAttendu: fc.boolean(),
    generation: generationA,
    deposeJusquA: fc.option(hlcA, { nil: undefined }),
    restaurationDemandee: fc.boolean(),
    restaurationConnue: fc.option(hlcA, { nil: undefined }),
  })
  .map(({ deposeJusquA, restaurationConnue, ...reste }) => ({
    ...reste,
    ...(deposeJusquA === undefined ? {} : { deposeJusquA }),
    ...(restaurationConnue === undefined ? {} : { restaurationConnue }),
  }));

const contenusLus = <T>(lectures: ReadonlyArray<{ readonly lecture: LectureDrive<T> }>): Array<T> =>
  lectures.flatMap(({ lecture }) => (lecture.type === 'LU' ? [lecture.contenu] : []));

const manifestesLus = (o: ObservationDrive): Array<ContenuManifeste> => contenusLus(o.manifestes);
const fichiersLus = (o: ObservationDrive): Array<ContenuFichierAppareil> => [
  ...(o.fichierPropre.type === 'LU' ? [o.fichierPropre.contenu] : []),
  ...contenusLus(o.autres),
  ...contenusLus(o.orphelins),
];

const maxOuRien = (hlcs: ReadonlyArray<Hlc | undefined>): Hlc | undefined =>
  hlcs.reduce<Hlc | undefined>(
    (m, h) => (h === undefined ? m : m === undefined ? h : maxHlc(m, h)),
    undefined,
  );

const restaurationVueAttendue = (o: ObservationDrive): Hlc | undefined =>
  maxOuRien(manifestesLus(o).map((m) => m.restauration));

const restaurationVueDe = (d: DecisionControle): Hlc | undefined =>
  d.type === 'FORMAT_PLUS_RECENT' || d.type === 'ALTERATION' ? undefined : d.restaurationVue;

describe('controlerDrive — propriétés de précédence et de génération (n° 3 ; C2, C8, C9)', () => {
  it('UT-COMP-US-017-3-80 contrôle 2 : FORMAT_PLUS_RECENT si et seulement si une lecture (manifeste, propre, autre, orphelin) est d’un format plus récent', () => {
    fc.assert(
      fc.property(observationA(true), situationA, (o, s) => {
        const lectures = [
          ...o.manifestes.map((m) => m.lecture.type),
          o.fichierPropre.type,
          ...o.autres.map((a) => a.lecture.type),
          ...o.orphelins.map((a) => a.lecture.type),
        ];
        expect(controlerDrive(o, s).type === 'FORMAT_PLUS_RECENT').toBe(
          lectures.includes('FORMAT_PLUS_RECENT'),
        );
      }),
      GRAINE,
    );
  });

  it('UT-COMP-US-017-3-81 contrôle 3 (C2, C8) : une génération lue (manifeste, fichier propre, autre ou orphelin) plus récente que celle de l’appareil donne NOUVELLE_GENERATION de la plus grande, quelle que soit l’altération, avec la plus grande restauration lisible ; sinon jamais', () => {
    fc.assert(
      fc.property(observationA(false), situationA, (o, s) => {
        const lue = generationMax(
          [...manifestesLus(o), ...fichiersLus(o)].map((c) => c.generation),
        );
        const decision = controlerDrive(o, s);
        const vue = restaurationVueAttendue(o);
        const attendue =
          comparerGenerations(lue, s.generation) > 0
            ? { type: 'NOUVELLE_GENERATION', generation: lue, restaurationVue: vue }
            : undefined;
        const obtenue =
          decision.type === 'NOUVELLE_GENERATION'
            ? { ...decision, restaurationVue: decision.restaurationVue }
            : undefined;
        expect(obtenue).toEqual(attendue);
      }),
      GRAINE,
    );
  });

  it('UT-COMP-US-017-3-82 C9 : le fichier de l’appareil (relu ou orphelin) d’une génération qu’il a créée et plus récente que la sienne donne toujours NOUVELLE_GENERATION à son auteur, quel que soit l’état du manifeste (absent, illisible, en retard)', () => {
    fc.assert(
      fc.property(observationA(false), situationA, hlcA, fc.boolean(), (o, s, h, enOrphelin) => {
        // Génération créée par l'appareil après tout ce qu'il connaît (C3).
        const plancher = hlcPlancherDesChoix(o, s);
        const g: Generation = {
          type: 'NOUVELLE',
          hlc: hlcSuivant(maxOuRien([plancher, h]), ORIGINE, MOI),
        };
        const propre: ContenuFichierAppareil = {
          schemaVersion: 1,
          versionApplication: '0.1.0',
          generation: g,
          appareil: MOI,
          registres: [],
          journal: [],
        };
        const avecFichier: ObservationDrive = enOrphelin
          ? {
              ...o,
              orphelins: [
                ...o.orphelins,
                { id: 'o-g' as IdFichierDrive, lecture: { type: 'LU', contenu: propre } },
              ],
            }
          : { ...o, fichierPropre: { type: 'LU', contenu: propre } };
        const decision = controlerDrive(avecFichier, s);
        expect(decision.type).toBe('NOUVELLE_GENERATION');
        expect(decision.type === 'NOUVELLE_GENERATION' && decision.generation).toEqual(g);
      }),
      GRAINE,
    );
  });

  it('UT-COMP-US-017-3-83 n° 6, C8 : les fichiers à fusionner et les ignorés partagent exactement les autres fichiers ; aucun orphelin n’y figure ; seuls les fichiers valides de la génération de l’appareil sont fusionnés', () => {
    fc.assert(
      fc.property(observationA(false), situationA, (o, s) => {
        const decision = controlerDrive(o, s);
        if (decision.type !== 'SYNCHRONISER' && decision.type !== 'RESTAURER') return;
        const { aFusionner, ignores } = decision.fusion;
        expect(aFusionner.length + ignores.length).toBe(o.autres.length);
        const orphelins = new Set<unknown>(o.orphelins.map((x) => x.id));
        expect(ignores.some((i) => orphelins.has(i))).toBe(false);
        const orphelinsLus = new Set<unknown>(contenusLus(o.orphelins));
        expect(aFusionner.some((f) => orphelinsLus.has(f))).toBe(false);
        expect(
          aFusionner.every(
            (f) => f.appareil !== MOI && comparerGenerations(f.generation, s.generation) === 0,
          ),
        ).toBe(true);
      }),
      GRAINE,
    );
  });
});

describe('Dernière restauration vue et HLC des choix (n° 8, n° 9, n° 11 c ; C1, C3)', () => {
  it('UT-COMP-US-017-3-84 C1 : sur toute suite de cycles d’une même génération, restaurationConnue ne décroît jamais, et une même restauration ne répare qu’une fois sans question (le cycle suivant devant la même observation ne décide plus RESTAURER FAITE_AILLEURS)', () => {
    fc.assert(
      fc.property(
        situationA,
        fc.array(observationA(false), { minLength: 1, maxLength: 6 }),
        (depart, observations) => {
          let s: SituationLocale = { ...depart, restaurationDemandee: false };
          for (const o of observations) {
            const decision = controlerDrive(o, s);
            if (decision.type !== 'SYNCHRONISER' && decision.type !== 'RESTAURER') continue;
            const avant = s.restaurationConnue;
            const apres = restaurationConnueApres(avant, restaurationVueDe(decision));
            const recul =
              avant !== undefined && (apres === undefined || comparerHlc(apres, avant) < 0);
            expect(recul).toBe(false);
            s = { ...s, ...(apres === undefined ? {} : { restaurationConnue: apres }) };
            const reparee = decision.type === 'RESTAURER' && decision.motif === 'FAITE_AILLEURS';
            const encore = controlerDrive(o, s);
            const reparee2 = encore.type === 'RESTAURER' && encore.motif === 'FAITE_AILLEURS';
            expect(reparee && reparee2).toBe(false);
          }
        },
      ),
      GRAINE,
    );
  });

  it('UT-COMP-US-017-3-85 C3 : avec une horloge en retard, le HLC d’un choix tiré au-dessus du plancher dépasse toute génération et toute restauration lues ou connues ; la génération créée est la plus grande, la restauration aussi', () => {
    fc.assert(
      fc.property(
        observationA(false),
        situationA,
        fc.option(hlcA, { nil: undefined }),
        fc.integer({ min: -3_600_000, max: 0 }),
        (o, s, dernierHlc, retard) => {
          const plancher = hlcPlancherDesChoix(o, s);
          const h = hlcSuivant(
            maxOuRien([dernierHlc, plancher]),
            (ORIGINE + retard) as Instant,
            MOI,
          );
          const lus = [...manifestesLus(o), ...fichiersLus(o)];
          const generations = [s.generation, ...lus.map((c) => c.generation)];
          const restaurations = [
            s.restaurationConnue,
            ...manifestesLus(o).map((m) => m.restauration),
          ];
          const g: Generation = { type: 'NOUVELLE', hlc: h };
          expect(generations.every((x) => comparerGenerations(g, x) > 0)).toBe(true);
          expect(restaurations.every((r) => r === undefined || comparerHlc(h, r) > 0)).toBe(true);
          expect(dernierHlc === undefined || comparerHlc(h, dernierHlc) > 0).toBe(true);
        },
      ),
      GRAINE,
    );
  });
});

describe('valeursDonneesEffacees — propriété (n° 10, n° 11 b ; C9)', () => {
  const cles: ReadonlyArray<CleInformation> = [1, 2, 3, 4].flatMap((n) => [
    { type: 'OBJECTIF', id: idObjectif(n), champ: 'intitule' } as const,
    { type: 'OBJECTIF', id: idObjectif(n), champ: 'delai' } as const,
  ]);

  it('UT-COMP-US-017-3-86 C9 : avec posterieuresA, le résultat est exactement la partie de celui sans posterieuresA dont l’écriture est strictement postérieure ; l’ordre est conservé', () => {
    fc.assert(
      fc.property(
        fc.subarray([...cles], { minLength: 0 }),
        fc.array(hlcA, { minLength: 8, maxLength: 8 }),
        hlcA,
        (choisies, hlcs, g) => {
          const ecrits = choisies.map((c, i) => ({ c, h: hlcs[i] ?? g }));
          const etat = etatLocal({
            appareilId: MOI,
            registres: ecrits.map(({ c, h }) =>
              c.champ === 'intitule'
                ? registre(c, 'Intitulé', h)
                : registre(c, date('2026-12-15'), h),
            ),
            enAttente: ecrits.map(({ c, h }) => ({
              cle: c,
              premiereEcriture: ORIGINE,
              derniereHlc: h,
            })),
          });
          const toutes = valeursDonneesEffacees(etat, g);
          expect(toutes).toHaveLength(ecrits.length);
          expect(valeursDonneesEffacees(etat, g, g)).toEqual(
            toutes.filter((v) => comparerHlc(v.ecartee.ecriture.hlc, g) > 0),
          );
        },
      ),
      GRAINE,
    );
  });

  it('UT-COMP-US-017-3-87 planReinitialisation — état neuf (sans dernierHlc) : dernierHlc du plan = celui fourni, ou absent', () => {
    const neuf = etatLocal({ appareilId: MOI });
    const h = { physique: ORIGINE, compteur: 0, appareil: MOI };
    const avec = planReinitialisation(neuf, { meta: META_INITIALE, valeurs: [], dernierHlc: h });
    expect(avec.plan.etatApres.dernierHlc).toEqual(h);
    const sans = planReinitialisation(neuf, { meta: META_INITIALE, valeurs: [] });
    expect('dernierHlc' in sans.plan.etatApres).toBe(false);
  });
});
