/**
 * Propriétés de la jointure des pierres tombales (ST-US-017 v0.8 §6.6 n° 3 b ; DAT v0.11.9 §4.2.1) : conditions J1,
 * J2 et J3 de Starck (Q-ST017-STA-6). Compléments de Bruce, UT-COMP-US-017-2-57 et suivants (fast-check, graine fixe).
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import {
  contexteDeNouvelleEcriture,
  estConnue,
} from '@src/synchronisation/domaine/contexte-causal';
import type { RegistreQuelconque } from '@src/synchronisation/domaine/ecriture';
import { registreDe, type EtatLocal } from '@src/synchronisation/domaine/etat-local';
import { fusionnerEtats, planifierFusion } from '@src/synchronisation/domaine/fusion';
import { comparerHlc, type Hlc } from '@src/synchronisation/domaine/hlc';
import { idLien, type RefElementMetier } from '@src/synchronisation/domaine/information';
import {
  contexteDePierreTombale,
  joindrePierresTombales,
} from '@src/synchronisation/domaine/pierre-tombale';
import { planifierSynchronisation } from '@src/synchronisation/domaine/planifier-synchronisation';
import type { Signalements } from '@src/synchronisation/domaine/signalements';
import { fusionnerValeursEcartees } from '@src/synchronisation/domaine/valeurs-ecartees';
import { etatLocal, texteDeCle } from '@tests/support/fabriques/etat-local';
import {
  creationTacheRegistre,
  deplaceSous,
  etatFusionnable,
  h,
  intituleObjectif,
  intituleTache,
  lien,
  objectifCree,
  parentObjectif,
  signalements,
  suppressionObjectif,
  suppressionTache,
  t,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import {
  hlc,
  idObjectif,
  idTache,
  instant,
  PC,
  SMARTPHONE,
  TROISIEME,
} from '@tests/support/valeurs';

const APPAREILS = [SMARTPHONE, PC, TROISIEME] as const;
const appareilDe = (i: number): IdAppareil => APPAREILS[i] ?? SMARTPHONE;
const E = idObjectif(1);
const X = idObjectif(2);
const T1 = idTache(1);
const ELEMENT_E: RefElementMetier = { type: 'OBJECTIF', id: E };
const CLE_SUPPRESSION_E = texteDeCle({ type: 'OBJECTIF', id: E, champ: 'suppression' });

// ---- Trois appareils qui écrivent sur E ou vers E et s'échangent leurs fichiers (§6.6 n° 11)
type Appareil = { readonly etat: EtatLocal; readonly signalements: Signalements };

const fichierDe = (source: Appareil): ContenuFichierAppareil => {
  const valeurs = [...source.signalements.valeursEcartees.values()];
  return {
    schemaVersion: 1,
    versionApplication: '0.1.0',
    generation: { type: 'INITIALE' },
    appareil: source.etat.appareilId,
    registres: [...source.etat.registres.values()],
    journal: [...source.etat.journal.values()],
    ...(valeurs.length === 0 ? {} : { valeursEcartees: valeurs }),
  };
};

type Integration = {
  readonly destination: Appareil;
  readonly plan: ReturnType<typeof planifierSynchronisation>;
};

const integrer = (destination: Appareil, source: Appareil): Integration => {
  const plan = planifierSynchronisation(
    destination.etat,
    destination.signalements,
    fichierDe(source),
    instant(t(90)),
  );
  return {
    destination: {
      etat: plan.plan.etatApres,
      signalements: {
        valeursEcartees: fusionnerValeursEcartees(
          destination.signalements.valeursEcartees,
          plan.signalements?.valeursEcartees ?? [],
        ),
        lectures: destination.signalements.lectures,
      },
    },
    plan,
  };
};

/** Contexte commun : E, X (principaux) et T1, créés sur le PC et connus des trois appareils. */
const INITIAUX: ReadonlyArray<RegistreQuelconque> = [
  ...objectifCree(E, 'E', h(0, PC)),
  ...objectifCree(X, 'X', h(0, PC)),
  creationTacheRegistre(T1, h(0, PC)),
  intituleTache(T1, 'T', h(0, PC)),
];
const initial = (appareilId: IdAppareil): Appareil => ({
  etat: etatLocal({ appareilId, registres: INITIAUX, dernierHlc: h(0, PC) }),
  signalements: signalements(),
});

type Operation = 'SUPPRIMER' | 'RENOMMER' | 'PLACER' | 'RATTACHER';
type Pas =
  | { readonly type: 'ECRIRE'; readonly auteur: number; readonly operation: Operation }
  | { readonly type: 'ECHANGER'; readonly destination: number; readonly source: number };

const pas: fc.Arbitrary<Pas> = fc.oneof(
  fc.record({
    type: fc.constant('ECRIRE' as const),
    auteur: fc.integer({ min: 0, max: 2 }),
    operation: fc.constantFrom<Operation>('SUPPRIMER', 'RENOMMER', 'PLACER', 'RATTACHER'),
  }),
  fc
    .record({
      type: fc.constant('ECHANGER' as const),
      destination: fc.integer({ min: 0, max: 2 }),
      decalage: fc.integer({ min: 1, max: 2 }),
    })
    .map(({ type, destination, decalage }) => ({
      type,
      destination,
      source: (destination + decalage) % 3,
    })),
);

/**
 * Écriture d'un utilisateur sur l'appareil, HLC `x` (croissant d'un pas à l'autre), contexte calculé comme par
 * `planifierEcritures` ; un élément que l'appareil sait supprimé n'est ni supprimé à nouveau, ni modifié, ni visé.
 */
const ecrire = (
  etat: EtatLocal,
  operation: Operation,
  x: Hlc,
  n: number,
): RegistreQuelconque | undefined => {
  if (registreDe(etat, ELEMENT_E, 'suppression') !== undefined) return undefined;
  const auteur = x.appareil;
  const contexte = (precedent: RegistreQuelconque | undefined) =>
    contexteDeNouvelleEcriture(precedent?.ecriture, auteur);
  switch (operation) {
    case 'SUPPRIMER':
      return suppressionObjectif(E, x, contexteDePierreTombale(etat, ELEMENT_E, auteur));
    case 'RENOMMER':
      return intituleObjectif(
        E,
        `E${String(n)}`,
        x,
        contexte(registreDe(etat, ELEMENT_E, 'intitule')),
      );
    case 'PLACER':
      return parentObjectif(
        X,
        deplaceSous(E, x),
        x,
        contexte(registreDe(etat, { type: 'OBJECTIF', id: X }, 'parent')),
      );
    case 'RATTACHER': {
      const precedent = etat.registres.get(
        texteDeCle({ type: 'LIEN_TACHE_OBJECTIF', id: idLien(T1, E), champ: 'actif' }),
      );
      return lien(T1, E, n % 2 === 0, x, contexte(precedent));
    }
  }
};

const nieme = (appareils: ReadonlyArray<Appareil>, i: number): Appareil => {
  const a = appareils[i];
  if (a === undefined) throw new Error(`Appareil ${String(i)} absent du banc`);
  return a;
};

type Deroulement = {
  readonly appareils: ReadonlyArray<Appareil>;
  readonly ecrites: ReadonlyArray<RegistreQuelconque>;
};

const derouler = (suite: ReadonlyArray<Pas>): Deroulement => {
  let appareils: ReadonlyArray<Appareil> = APPAREILS.map(initial);
  const ecrites: Array<RegistreQuelconque> = [];
  suite.forEach((p, n) => {
    if (p.type === 'ECHANGER') {
      const resultat = integrer(nieme(appareils, p.destination), nieme(appareils, p.source));
      appareils = appareils.map((a, i) => (i === p.destination ? resultat.destination : a));
      return;
    }
    const a = nieme(appareils, p.auteur);
    const x = h(n + 1, appareilDe(p.auteur));
    const r = ecrire(a.etat, p.operation, x, n);
    if (r === undefined) return;
    ecrites.push(r);
    const registres = new Map(a.etat.registres).set(texteDeCle(r.cle), r);
    const etat = { ...a.etat, registres, dernierHlc: x };
    appareils = appareils.map((b, i) => (i === p.auteur ? { ...a, etat } : b));
  });
  return { appareils, ecrites };
};

/** Échange complet : chaque appareil intègre le fichier de chacun des deux autres. */
const PAIRES: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [0, 2],
  [1, 0],
  [1, 2],
  [2, 0],
  [2, 1],
];
const tour = (
  appareils: ReadonlyArray<Appareil>,
): { appareils: ReadonlyArray<Appareil>; integrations: ReadonlyArray<Integration> } =>
  PAIRES.reduce<{ appareils: ReadonlyArray<Appareil>; integrations: ReadonlyArray<Integration> }>(
    (acc, [destination, source]) => {
      const resultat = integrer(nieme(acc.appareils, destination), nieme(acc.appareils, source));
      return {
        appareils: acc.appareils.map((a, i) => (i === destination ? resultat.destination : a)),
        integrations: [...acc.integrations, resultat],
      };
    },
    { appareils, integrations: [] },
  );

const trie = <V>(m: ReadonlyMap<string, V>) =>
  [...m.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
const texteHlc = (x: Hlc) => `${x.appareil}|${String(x.physique)}|${String(x.compteur)}`;

const permutations = <T>(xs: ReadonlyArray<T>): ReadonlyArray<ReadonlyArray<T>> =>
  xs.length <= 1
    ? [xs]
    : xs.flatMap((x, i) =>
        permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map((reste) => [x, ...reste]),
      );

describe('Jointure des pierres tombales à trois appareils (condition J2 de Starck, Q-ST017-STA-6)', () => {
  it('UT-COMP-US-017-2-57 historiques causaux et échanges quelconques, puis échange complet : registres égaux (contextes compris), mêmes valeurs écartées, aucune écriture au tour suivant, aucun HLC créé', () => {
    fc.assert(
      fc.property(fc.array(pas, { maxLength: 14 }), (suite) => {
        const { appareils, ecrites } = derouler(suite);
        const complet = tour(tour(appareils).appareils).appareils;

        const [premier, ...autres] = complet.map((a) => ({
          registres: trie(a.etat.registres),
          valeurs: trie(a.signalements.valeursEcartees),
        }));
        for (const autre of autres) expect(autre).toEqual(premier);

        const suivant = tour(complet);
        for (const { plan } of suivant.integrations) {
          expect(plan.plan.registresEcrits).toEqual([]);
          expect(plan.plan.evenementsAjoutes).toEqual([]);
          expect(plan.meta).toEqual({});
          expect(plan.signalements).toBeUndefined();
        }

        // Aucun HLC créé : registres et dernierHlc ne portent que des HLC d'écritures d'utilisateur.
        const emis = new Set([...INITIAUX, ...ecrites].map((r) => texteHlc(r.ecriture.hlc)));
        for (const a of complet) {
          for (const r of a.etat.registres.values())
            expect(emis).toContain(texteHlc(r.ecriture.hlc));
          const dernier = a.etat.dernierHlc;
          expect(emis).toContain(dernier === undefined ? undefined : texteHlc(dernier));
        }

        // Pliage des pierres tombales dans tous les ordres : même résultat, celui des appareils.
        const tombes = ecrites.filter((r) => r.cle.champ === 'suppression');
        const pliages = permutations(tombes).map((ordre) => {
          const [d, ...reste] = ordre;
          return d === undefined ? undefined : reste.reduce(joindrePierresTombales, d);
        });
        for (const pliage of pliages) {
          expect(pliage).toEqual(complet[0]?.etat.registres.get(CLE_SUPPRESSION_E));
        }
      }),
      { seed: 20261101, numRuns: 200 },
    );
  });
});

// ---- J1 : la jointure connaît exactement ce que connaissait l'une ou l'autre, pour toute écriture R
const minute = (m: number) => `2026-10-21T08:0${String(m)}:00.000Z`;
/** Pierre tombale causale de T1 (même générateur qu'UT-US-017-116) : contexte sans l'auteur, entrées antérieures. */
const pierreTombale = fc
  .record({
    auteur: fc.integer({ min: 0, max: 2 }),
    m: fc.integer({ min: 1, max: 5 }),
    connus: fc.array(fc.option(fc.integer({ min: 0, max: 4 }), { nil: undefined }), {
      minLength: 3,
      maxLength: 3,
    }),
  })
  .map(({ auteur, m, connus }) => {
    const contexte: Record<string, Hlc> = {};
    connus.forEach((c, i) => {
      if (c !== undefined && i !== auteur && c < m)
        contexte[appareilDe(i)] = hlc(minute(c), 0, appareilDe(i));
    });
    return suppressionTache(T1, hlc(minute(m), 0, appareilDe(auteur)), contexte);
  });
const ecritureQuelconque = fc
  .record({
    auteur: fc.integer({ min: 0, max: 2 }),
    m: fc.integer({ min: 0, max: 5 }),
    compteur: fc.integer({ min: 0, max: 1 }),
  })
  .map(({ auteur, m, compteur }) =>
    intituleTache(T1, 'R', hlc(minute(m), compteur, appareilDe(auteur))),
  );

describe('Jointure des pierres tombales : connaissance exacte (condition J1 de Starck)', () => {
  it('UT-COMP-US-017-2-58 pour toute écriture R (postérieure comprise) : la jointure connaît R si et seulement si l’une des deux pierres tombales la connaissait ; associativité du pliage', () => {
    fc.assert(
      fc.property(pierreTombale, pierreTombale, pierreTombale, ecritureQuelconque, (a, b, c, r) => {
        const jointe = joindrePierresTombales(a, b);
        expect(estConnue(jointe.ecriture, r.ecriture)).toBe(
          estConnue(a.ecriture, r.ecriture) || estConnue(b.ecriture, r.ecriture),
        );
        expect(joindrePierresTombales(joindrePierresTombales(a, b), c)).toEqual(
          joindrePierresTombales(a, joindrePierresTombales(b, c)),
        );
        expect(joindrePierresTombales(a, b)).toEqual(joindrePierresTombales(b, a));
        expect(joindrePierresTombales(a, a)).toBe(a);
        // Ne crée aucun HLC : celui de la plus récente.
        const plusRecente = comparerHlc(a.ecriture.hlc, b.ecriture.hlc) >= 0 ? a : b;
        expect(jointe.ecriture.hlc).toEqual(plusRecente.ecriture.hlc);
      }),
      { seed: 20261101, numRuns: 300 },
    );
  });
});

// ---- J3 : seul le champ `suppression` est joint ; les autres champs gardent la plus grande écriture
describe('Jointure réservée aux pierres tombales (condition J3 de Starck)', () => {
  it('UT-COMP-US-017-2-59 intitulé de même HLC et de contextes différents : la locale est conservée (même référence), rien n’est écrit', () => {
    const local = intituleTache(T1, 'A', h(2, SMARTPHONE), { [PC]: h(0, PC) });
    const recu = intituleTache(T1, 'A', h(2, SMARTPHONE), { [PC]: h(1, PC) });
    const cle = texteDeCle(local.cle);
    expect(
      fusionnerEtats(etatFusionnable([local]), etatFusionnable([recu])).registres.get(cle),
    ).toBe(local);
    const plan = planifierFusion(etatLocal({ appareilId: PC, registres: [local] }), {
      ...fichierDe(initial(SMARTPHONE)),
      registres: [recu],
      journal: [],
    });
    expect(plan.registresEcrits).toEqual([]);
    expect(plan.etatApres.registres.get(cle)).toBe(local);
  });

  it('UT-COMP-US-017-2-60 pierre tombale de même HLC et de contexte plus grand reçue : écrite (jointure) ; plus petit : rien', () => {
    const s = suppressionTache(T1, h(3, SMARTPHONE), { [PC]: h(0, PC) });
    const sJointe = suppressionTache(T1, h(3, SMARTPHONE), { [PC]: h(2, PC) });
    const fichier = (r: RegistreQuelconque) => ({
      ...fichierDe(initial(SMARTPHONE)),
      registres: [r],
      journal: [],
    });
    const enrichi = planifierFusion(
      etatLocal({ appareilId: PC, registres: [s] }),
      fichier(sJointe),
    );
    expect(enrichi.registresEcrits).toEqual([sJointe]);
    const appauvri = planifierFusion(
      etatLocal({ appareilId: PC, registres: [sJointe] }),
      fichier(s),
    );
    expect(appauvri.registresEcrits).toEqual([]);
    expect(appauvri.etatApres.registres.get(texteDeCle(s.cle))).toBe(sJointe);
  });
});
