/**
 * UT-US-017-117 (Anthony, E13 du rang 9, revue de la convergence) : propriété de convergence de **tout** le noyau de
 * fusion, à trois appareils (ST-US-017 v0.9 §14 ; DAT §4.2, §4.2.1 ; conventions §11.4, « convergence », « aucune perte
 * silencieuse », « idempotence »). Les tests de Bruce couvrent chaque mécanisme séparément (jointure sans réparation :
 * UT-COMP-US-017-2-57 ; réparation sans pierre tombale : UT-COMP-US-017-2-12, 13) ; celui-ci les combine : pierres
 * tombales concurrentes, renommages, déplacements qui forment des cycles et des deuxièmes niveaux (réparations RG-048
 * et leurs entrées de journal), lectures « Compris », échanges dans un ordre quelconque.
 *
 * Vérifie, après la suite d'échanges puis des tours complets :
 * 1. terminaison : un tour complet finit par n'écrire plus rien (aucun va-et-vient entre appareils) ;
 * 2. convergence : registres (contextes compris), journal, valeurs écartées et lectures structurellement égaux ;
 * 3. hiérarchie valide (RG-048) sur chaque appareil ;
 * 4. aucune perte silencieuse (ENF-06) : toute écriture d'utilisateur perdue sans connaissance (remplacée par une
 *    écriture qui ne la connaît pas et de valeur différente, ou visée par une suppression qui ne la connaît pas) a son
 *    entrée dans les valeurs écartées. L'oracle de connaissance est écrit ici, indépendamment du code (DAT §4.2.1,
 *    « ses propres écritures antérieures »).
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { IdAppareil, IdObjectif } from '@src/commun/domaine/identifiants';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import { contexteDeNouvelleEcriture } from '@src/synchronisation/domaine/contexte-causal';
import type { RegistreQuelconque } from '@src/synchronisation/domaine/ecriture';
import type { EtatLocal } from '@src/synchronisation/domaine/etat-local';
import { comparerHlc, hlcSuivant, type Hlc } from '@src/synchronisation/domaine/hlc';
import type { PlacementObjectif, RefElementMetier } from '@src/synchronisation/domaine/information';
import { fusionnerLectures } from '@src/synchronisation/domaine/lectures';
import { contexteDePierreTombale } from '@src/synchronisation/domaine/pierre-tombale';
import { planifierSynchronisation } from '@src/synchronisation/domaine/planifier-synchronisation';
import type { Signalements } from '@src/synchronisation/domaine/signalements';
import {
  fusionnerValeursEcartees,
  idValeurEcartee,
  type ValeurEcartee,
} from '@src/synchronisation/domaine/valeurs-ecartees';
import { etatLocal, texteDeCle } from '@tests/support/fabriques/etat-local';
import {
  changementParent,
  deplaceSous,
  h,
  intituleObjectif,
  objectifCree,
  parentObjectif,
  signalements,
  suppressionObjectif,
  t,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { idObjectif, instant, PC, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

const APPAREILS = [SMARTPHONE, PC, TROISIEME] as const;
const OBJECTIFS = [idObjectif(1), idObjectif(2), idObjectif(3)] as const;
const TOURS_MAX = 6;

type Appareil = { readonly etat: EtatLocal; readonly signalements: Signalements };

const objectif = (i: number): IdObjectif => OBJECTIFS[i % OBJECTIFS.length] ?? idObjectif(1);
const ref = (id: IdObjectif): RefElementMetier => ({ type: 'OBJECTIF', id });
const registreDe = (etat: EtatLocal, id: IdObjectif, champ: string) =>
  etat.registres.get(texteDeCle({ type: 'OBJECTIF', id, champ } as never));

// ---- Écritures d'utilisateur, causales et refusées comme le ferait l'interface

type Operation =
  | { readonly type: 'SUPPRIMER'; readonly o: number }
  | { readonly type: 'RENOMMER'; readonly o: number }
  | { readonly type: 'PLACER'; readonly x: number; readonly p: number }
  | { readonly type: 'COMPRIS' };
type Pas =
  | { readonly type: 'ECRIRE'; readonly auteur: number; readonly operation: Operation }
  | { readonly type: 'ECHANGER'; readonly destination: number; readonly source: number };

/** Pondération : les déplacements (cycles, deuxièmes niveaux, réparations) et les suppressions concurrentes dominent. */
const operation: fc.Arbitrary<Operation> = fc.oneof(
  {
    weight: 2,
    arbitrary: fc.record({
      type: fc.constant('SUPPRIMER' as const),
      o: fc.integer({ min: 0, max: 2 }),
    }),
  },
  {
    weight: 2,
    arbitrary: fc.record({
      type: fc.constant('RENOMMER' as const),
      o: fc.integer({ min: 0, max: 2 }),
    }),
  },
  {
    weight: 5,
    arbitrary: fc.record({
      type: fc.constant('PLACER' as const),
      x: fc.integer({ min: 0, max: 2 }),
      p: fc.integer({ min: 0, max: 2 }),
    }),
  },
  { weight: 1, arbitrary: fc.record({ type: fc.constant('COMPRIS' as const) }) },
);
/** Pas d'une suite sur `n` appareils (2 ou 3). */
const pas = (n: number): fc.Arbitrary<Pas> =>
  fc.oneof(
    {
      weight: 3,
      arbitrary: fc.record({
        type: fc.constant('ECRIRE' as const),
        auteur: fc.integer({ min: 0, max: n - 1 }),
        operation,
      }),
    },
    {
      weight: 1,
      arbitrary: fc
        .record({
          destination: fc.integer({ min: 0, max: n - 1 }),
          decalage: fc.integer({ min: 1, max: n - 1 }),
        })
        .map(({ destination, decalage }) => ({
          type: 'ECHANGER' as const,
          destination,
          source: (destination + decalage) % n,
        })),
    },
  );

const supprime = (etat: EtatLocal, id: IdObjectif): boolean =>
  registreDe(etat, id, 'suppression') !== undefined;
const parentDe = (etat: EtatLocal, id: IdObjectif): IdObjectif | undefined => {
  const valeur = registreDe(etat, id, 'parent')?.ecriture.valeur as PlacementObjectif | undefined;
  const p = valeur?.parentId;
  return p !== undefined && !supprime(etat, p) ? p : undefined;
};
const aDesEnfants = (etat: EtatLocal, id: IdObjectif): boolean =>
  OBJECTIFS.some((autre) => autre !== id && parentDe(etat, autre) === id);

/** Écriture locale : registres ajoutés, journal, dernierHlc ; undefined si l'interface la refuserait. */
const ecrire = (a: Appareil, op: Operation, x: Hlc, n: number): Appareil | undefined => {
  const { etat } = a;
  const avec = (registre: RegistreQuelconque, journal = etat.journal): Appareil => ({
    ...a,
    etat: {
      ...etat,
      dernierHlc: x,
      registres: new Map(etat.registres).set(texteDeCle(registre.cle), registre),
      journal,
    },
  });
  switch (op.type) {
    case 'SUPPRIMER': {
      const id = objectif(op.o);
      if (supprime(etat, id) || aDesEnfants(etat, id)) return undefined;
      return avec(suppressionObjectif(id, x, contexteDePierreTombale(etat, ref(id), x.appareil)));
    }
    case 'RENOMMER': {
      const id = objectif(op.o);
      if (supprime(etat, id)) return undefined;
      const precedent = registreDe(etat, id, 'intitule');
      return avec(
        intituleObjectif(
          id,
          `O${String(n)}`,
          x,
          contexteDeNouvelleEcriture(precedent?.ecriture, x.appareil),
        ),
      );
    }
    case 'PLACER': {
      const id = objectif(op.x);
      const p = objectif(op.p);
      // ERR-030 et suppressions : placement refusé localement s'il créerait un deuxième niveau.
      if (id === p || supprime(etat, id) || supprime(etat, p)) return undefined;
      if (parentDe(etat, p) !== undefined || aDesEnfants(etat, id) || parentDe(etat, id) === p)
        return undefined;
      const precedent = registreDe(etat, id, 'parent');
      const avant = precedent?.ecriture.valeur as PlacementObjectif;
      const apres = deplaceSous(p, x);
      const journal = new Map(etat.journal);
      const entree = changementParent(id, avant, apres, x);
      journal.set(entree.id, entree);
      return avec(
        parentObjectif(id, apres, x, contexteDeNouvelleEcriture(precedent?.ecriture, x.appareil)),
        journal,
      );
    }
    case 'COMPRIS': {
      // MarquerCommeLue (§6.6 n° 6) : une lecture de même HLC pour chaque valeur non lue.
      const nonLues = [...a.signalements.valeursEcartees.keys()].filter(
        (id) => !a.signalements.lectures.has(id),
      );
      if (nonLues.length === 0) return undefined;
      return {
        etat: { ...etat, dernierHlc: x },
        signalements: {
          ...a.signalements,
          lectures: fusionnerLectures(
            a.signalements.lectures,
            nonLues.map((id) => ({ id, hlc: x })),
          ),
        },
      };
    }
  }
};

// ---- Échanges (§6.6 n° 11) : fichier complet, signalements compris

const fichierDe = (source: Appareil): ContenuFichierAppareil => {
  const valeurs = [...source.signalements.valeursEcartees.values()];
  const lectures = [...source.signalements.lectures.values()];
  return {
    schemaVersion: 1,
    versionApplication: '0.1.0',
    generation: { type: 'INITIALE' },
    appareil: source.etat.appareilId,
    registres: [...source.etat.registres.values()],
    journal: [...source.etat.journal.values()],
    ...(valeurs.length === 0 ? {} : { valeursEcartees: valeurs }),
    ...(lectures.length === 0 ? {} : { lectures }),
  };
};

/** Pierres tombales d'utilisateur vues par chaque appareil (les siennes et celles de tout fichier reçu, transitivement). */
type Banc = {
  readonly appareils: ReadonlyArray<Appareil>;
  readonly vues: ReadonlyArray<ReadonlySet<RegistreQuelconque>>;
};

const nieme = <T>(xs: ReadonlyArray<T>, i: number): T => {
  const x = xs[i];
  if (x === undefined) throw new Error(`Appareil ${String(i)} absent`);
  return x;
};
const remplacer = <T>(xs: ReadonlyArray<T>, i: number, x: T): ReadonlyArray<T> =>
  xs.map((y, j) => (j === i ? x : y));

/** DAT §4.2.1 : D connaît R si R est une écriture antérieure de son appareil, ou si son contexte la couvre. */
const connait = (d: RegistreQuelconque, r: RegistreQuelconque): boolean => {
  const { hlc: hd, contexte } = d.ecriture;
  if (hd.appareil === r.ecriture.hlc.appareil) return comparerHlc(r.ecriture.hlc, hd) <= 0;
  const c = contexte[r.ecriture.hlc.appareil];
  return c !== undefined && comparerHlc(c, r.ecriture.hlc) >= 0;
};

/**
 * Une suppression constatée à cette intégration (identifiant nouveau des deux côtés) ne l'est à bon droit que si
 * **aucune** pierre tombale de l'élément vue par l'un ou l'autre appareil ne connaît l'écriture écartée (DAT §4.2.1 ;
 * c'est ce que la jointure garantit, US-017 S10c). Une entrée constatée sur une vue partielle, qu'une écriture faite
 * plus tard rendrait inutile, reste admise (« Existence d'une entrée ») : seule la vue de l'intégration compte.
 */
const verifierConstats = (
  banc: Banc,
  d: number,
  s: number,
  nouvelles: ReadonlyArray<ValeurEcartee>,
): void => {
  const connues = (i: number) => nieme(banc.appareils, i).signalements.valeursEcartees;
  const vues = [...nieme(banc.vues, d), ...nieme(banc.vues, s)];
  for (const v of nouvelles) {
    if (v.motif !== 'SUPPRESSION' || connues(d).has(v.id) || connues(s).has(v.id)) continue;
    const tombes = vues.filter((tombe) => tombe.cle.id === v.gagnante.cle.id);
    expect(tombes.some((tombe) => connait(tombe, v.ecartee))).toBe(false);
  }
};

type Integration = { readonly banc: Banc; readonly aEcrit: boolean };

const integrer = (banc: Banc, d: number, s: number, physique: number): Integration => {
  const destination = nieme(banc.appareils, d);
  const resultat = planifierSynchronisation(
    destination.etat,
    destination.signalements,
    fichierDe(nieme(banc.appareils, s)),
    instant(t(physique)),
  );
  const ajouts = resultat.signalements;
  verifierConstats(banc, d, s, ajouts?.valeursEcartees ?? []);
  const apres: Appareil = {
    etat: resultat.plan.etatApres,
    signalements: {
      valeursEcartees: fusionnerValeursEcartees(
        destination.signalements.valeursEcartees,
        ajouts?.valeursEcartees ?? [],
      ),
      lectures: fusionnerLectures(destination.signalements.lectures, ajouts?.lectures ?? []),
    },
  };
  return {
    banc: {
      appareils: remplacer(banc.appareils, d, apres),
      vues: remplacer(banc.vues, d, new Set([...nieme(banc.vues, d), ...nieme(banc.vues, s)])),
    },
    aEcrit: resultat.meta.fusionNonDeposee === true,
  };
};

const paires = (n: number): ReadonlyArray<readonly [number, number]> =>
  Array.from({ length: n }, (_, d) => d).flatMap((d) =>
    Array.from({ length: n }, (_, s) => s).flatMap((s) => (s === d ? [] : [[d, s] as const])),
  );

/** Un tour complet ; `aEcrit` : au moins une intégration a écrit quelque chose. */
const tour = (banc: Banc, physique: number): Integration =>
  paires(banc.appareils.length).reduce<Integration>(
    (acc, [d, s]) => {
      const r = integrer(acc.banc, d, s, physique);
      return { banc: r.banc, aEcrit: acc.aEcrit || r.aEcrit };
    },
    { banc, aEcrit: false },
  );

type Deroulement = {
  readonly banc: Banc;
  readonly ecrites: ReadonlyArray<RegistreQuelconque>;
  readonly physique: number;
};

const INITIAUX = OBJECTIFS.flatMap((id, i) => objectifCree(id, `O${String(i)}`, h(0, PC)));

const derouler = (n: number, suite: ReadonlyArray<Pas>): Deroulement => {
  let banc: Banc = {
    appareils: APPAREILS.slice(0, n).map((appareilId: IdAppareil) => ({
      etat: etatLocal({ appareilId, registres: INITIAUX, dernierHlc: h(0, PC) }),
      signalements: signalements(),
    })),
    vues: APPAREILS.slice(0, n).map(() => new Set<RegistreQuelconque>()),
  };
  const ecrites: Array<RegistreQuelconque> = [];
  let physique = 0;
  for (const p of suite) {
    physique += 1;
    if (p.type === 'ECHANGER') {
      banc = integrer(banc, p.destination, p.source, physique).banc;
      continue;
    }
    const a = nieme(banc.appareils, p.auteur);
    const x = hlcSuivant(a.etat.dernierHlc, instant(t(physique)), a.etat.appareilId);
    const apres = ecrire(a, p.operation, x, physique);
    if (apres === undefined) continue;
    const nouvelles = [...apres.etat.registres.values()].filter((r) => r.ecriture.hlc === x);
    ecrites.push(...nouvelles);
    const tombes = nouvelles.filter((r) => r.cle.champ === 'suppression');
    banc = {
      appareils: remplacer(banc.appareils, p.auteur, apres),
      vues: remplacer(banc.vues, p.auteur, new Set([...nieme(banc.vues, p.auteur), ...tombes])),
    };
  }
  return { banc, ecrites, physique };
};

// ---- Oracles, écrits sans le code du domaine

const canonique = (v: unknown): string => {
  if (v === undefined) return 'undefined';
  return v === null || typeof v !== 'object'
    ? JSON.stringify(v)
    : `{${Object.entries(v)
        .filter(([, x]) => x !== undefined)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([k, x]) => `${k}:${canonique(x)}`)
        .join(',')}}`;
};

/** Éléments qu'une suppression peut écarter : le sien et celui que vise un placement (H-1). */
const vises = (r: RegistreQuelconque): ReadonlyArray<IdObjectif> => {
  const propre = r.cle.id as IdObjectif;
  if (r.cle.champ !== 'parent') return [propre];
  const cible = (r.ecriture.valeur as PlacementObjectif).parentId;
  return cible === undefined ? [propre] : [propre, cible];
};

/**
 * Perdue sans connaissance : ni retenue, ni remplacée en connaissance de cause (par une écriture d'utilisateur qui la
 * connaît, la finale comprise), ni égale à la valeur finale ; ou retenue mais visée par une suppression qui ne la
 * connaît pas. Une écriture remplacée sciemment n'est pas perdue, même si son élément est supprimé ensuite.
 */
const perdueSansConnaissance = (
  etat: EtatLocal,
  ecrites: ReadonlyArray<RegistreQuelconque>,
  w: RegistreQuelconque,
): boolean => {
  const finale = etat.registres.get(texteDeCle(w.cle));
  if (finale === undefined) return true;
  if (comparerHlc(finale.ecriture.hlc, w.ecriture.hlc) !== 0) {
    const remplaceeSciemment = [finale, ...ecrites].some(
      (autre) =>
        texteDeCle(autre.cle) === texteDeCle(w.cle) &&
        comparerHlc(autre.ecriture.hlc, w.ecriture.hlc) !== 0 &&
        connait(autre, w),
    );
    return (
      !remplaceeSciemment && canonique(finale.ecriture.valeur) !== canonique(w.ecriture.valeur)
    );
  }
  return vises(w).some((id) => {
    const tombe = registreDe(etat, id, 'suppression');
    return tombe !== undefined && !connait(tombe, w);
  });
};

const hierarchieValide = (etat: EtatLocal): boolean =>
  OBJECTIFS.every((id) => {
    if (supprime(etat, id)) return true;
    const p = parentDe(etat, id);
    return p === undefined || parentDe(etat, p) === undefined;
  });

const trie = <V>(m: ReadonlyMap<string, V>) =>
  [...m.entries()].sort(([a], [b]) => (a < b ? -1 : 1));
const photo = (a: Appareil) => ({
  registres: trie(a.etat.registres),
  journal: trie(a.etat.journal),
  valeurs: trie(a.signalements.valeursEcartees),
  lectures: trie(a.signalements.lectures),
});

/** Tours complets jusqu'à un tour qui n'écrit rien (au plus TOURS_MAX), puis propriétés 2 à 4. */
const verifier = ({ banc, ecrites, physique }: Deroulement): void => {
  // 1. Terminaison : au plus TOURS_MAX tours complets avant un tour qui n'écrit rien.
  let courant = banc;
  let tours = 0;
  for (let r = tour(courant, physique + 1); r.aEcrit; r = tour(courant, physique + 1 + tours)) {
    courant = r.banc;
    tours += 1;
    expect(tours).toBeLessThanOrEqual(TOURS_MAX);
  }
  // 2. Convergence structurelle (contextes, journal, signalements et lectures compris).
  const [premier, ...autres] = courant.appareils.map(photo);
  for (const autre of autres) expect(autre).toEqual(premier);
  // 3. Hiérarchie valide ; 4. aucune perte silencieuse.
  const final = nieme(courant.appareils, 0);
  expect(hierarchieValide(final.etat)).toBe(true);
  for (const w of ecrites.filter((r) => r.cle.champ !== 'suppression')) {
    if (perdueSansConnaissance(final.etat, ecrites, w)) {
      expect(final.signalements.valeursEcartees.has(idValeurEcartee(w.cle, w.ecriture.hlc))).toBe(
        true,
      );
    }
  }
};

describe('Convergence du noyau de fusion (ST-US-017 v0.9 §14, revue E13 du rang 9)', () => {
  it('UT-US-017-117 trois appareils : suppressions concurrentes, renommages, déplacements en cycle, « Compris », échanges quelconques : terminaison, états égaux, hiérarchie valide, aucune perte silencieuse, aucune suppression constatée à tort', () => {
    fc.assert(
      fc.property(fc.array(pas(3), { minLength: 4, maxLength: 24 }), (suite) => {
        verifier(derouler(3, suite));
      }),
      { seed: 20261101, numRuns: 300 },
    );
  });

  it('UT-US-017-118 deux appareils : mêmes propriétés', () => {
    fc.assert(
      fc.property(fc.array(pas(2), { minLength: 4, maxLength: 24 }), (suite) => {
        verifier(derouler(2, suite));
      }),
      { seed: 20261101, numRuns: 300 },
    );
  });
});
