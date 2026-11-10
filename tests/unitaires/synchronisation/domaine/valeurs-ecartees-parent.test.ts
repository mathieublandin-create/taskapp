/**
 * DT-027 (Q-ANT-E13-R9-2 ; DAT v0.11.11 §4.2.1 « Valeurs égales », registre `parent` ; ST-US-017 v0.11.4 §6.6 n° 2 b) :
 * pour le registre `parent`, l'égalité qui décide d'une valeur écartée porte sur le **seul parent visé** (`parentId`,
 * absent ≡ objectif principal). `origine` et `hlcOrigine` sont des données techniques de la réparation. Deux
 * déplacements concurrents sous le même parent ne perdent rien : aucun signalement `ALR-009`. Deux parents différents
 * restent un conflit. Tranche autonome, rang 12 (`rangs-tests.json`). UT-US-017-128 à 132, tous rouges avant DT-027.
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { IdObjectif } from '@src/commun/domaine/identifiants';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import { contexteDeNouvelleEcriture } from '@src/synchronisation/domaine/contexte-causal';
import type { RegistreQuelconque } from '@src/synchronisation/domaine/ecriture';
import type { EtatLocal } from '@src/synchronisation/domaine/etat-local';
import { comparerHlc, type Hlc } from '@src/synchronisation/domaine/hlc';
import type { PlacementObjectif } from '@src/synchronisation/domaine/information';
import { compterALire } from '@src/synchronisation/domaine/lectures';
import { planifierSynchronisation } from '@src/synchronisation/domaine/planifier-synchronisation';
import type { Signalements } from '@src/synchronisation/domaine/signalements';
import {
  detecterValeursEcartees,
  fusionnerValeursEcartees,
  idValeurEcartee,
  type ValeurEcartee,
} from '@src/synchronisation/domaine/valeurs-ecartees';
import { fusionnerLectures } from '@src/synchronisation/domaine/lectures';
import { etatLocal, texteDeCle } from '@tests/support/fabriques/etat-local';
import {
  changementParent,
  creePrincipal,
  creeSous,
  deplaceSous,
  etatFusionnable,
  h,
  objectifCree,
  parentObjectif,
  signalements,
  t,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { idObjectif, instant, PC, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

const O1 = idObjectif(1);
const O2 = idObjectif(2);
const O3 = idObjectif(3);
const CLE_PARENT_O2 = { type: 'OBJECTIF', id: O2, champ: 'parent' } as const;

/** Registre `parent` de O2 écrit sans connaissance de l'autre (contexte vide : écritures concurrentes). */
const parentDeO2 = (valeur: PlacementObjectif, ecriture: Hlc): RegistreQuelconque =>
  parentObjectif(O2, valeur, ecriture);
const principalDeplace = (hlcOrigine: Hlc): PlacementObjectif => ({
  origine: 'DEPLACEMENT',
  hlcOrigine,
});

/** Détection dans les deux sens (local/reçu), qui doit rendre le même résultat. */
const dansLesDeuxSens = (a: RegistreQuelconque, b: RegistreQuelconque) => {
  const adroite = detecterValeursEcartees(etatFusionnable([a]), etatFusionnable([b]));
  const agauche = detecterValeursEcartees(etatFusionnable([b]), etatFusionnable([a]));
  expect(agauche).toEqual(adroite);
  return adroite;
};

describe('DT-027 : registre parent, égalité sur le seul parent visé (ST-US-017 v0.11.4 §6.6 n° 2 b)', () => {
  it('UT-US-017-128 même parent visé : aucune valeur écartée, quels que soient origine, hlcOrigine et HLC, dans les deux sens', () => {
    // Deux déplacements concurrents sous O1 (ancien attendu d'UT-US-017-117 : un signalement ALR-009).
    expect(
      dansLesDeuxSens(
        parentDeO2(deplaceSous(O1, h(2, SMARTPHONE)), h(2, SMARTPHONE)),
        parentDeO2(deplaceSous(O1, h(3, PC)), h(3, PC)),
      ),
    ).toEqual([]);
    // Création sous O1 (origine CREATION) contre déplacement sous O1 : l'origine ne compte pas.
    expect(
      dansLesDeuxSens(
        parentDeO2(creeSous(O1, h(0, PC)), h(0, PC)),
        parentDeO2(deplaceSous(O1, h(2, SMARTPHONE)), h(2, SMARTPHONE)),
      ),
    ).toEqual([]);
    // Objectif principal des deux côtés (parentId absent ≡ absent), origines différentes.
    expect(
      dansLesDeuxSens(
        parentDeO2(creePrincipal(h(0, PC)), h(0, PC)),
        parentDeO2(principalDeplace(h(2, SMARTPHONE)), h(2, SMARTPHONE)),
      ),
    ).toEqual([]);
    // Même HLC d'origine, HLC d'écriture différents (réécriture par une réparation) : toujours égal.
    expect(
      dansLesDeuxSens(
        parentDeO2(deplaceSous(O1, h(1, PC)), h(4, SMARTPHONE)),
        parentDeO2(deplaceSous(O1, h(1, PC)), h(5, PC)),
      ),
    ).toEqual([]);
  });

  it('UT-US-017-129 parents différents : le conflit reste signalé (valeur de plus petit HLC écartée), dans les deux sens', () => {
    const sousO1 = parentDeO2(deplaceSous(O1, h(2, SMARTPHONE)), h(2, SMARTPHONE));
    const sousO3 = parentDeO2(deplaceSous(O3, h(3, PC)), h(3, PC));
    expect(dansLesDeuxSens(sousO1, sousO3)).toEqual([
      {
        id: idValeurEcartee(CLE_PARENT_O2, h(2, SMARTPHONE)),
        motif: 'CONFLIT',
        ecartee: sousO1,
        gagnante: sousO3,
      },
    ]);
    // Sous un parent contre objectif principal : parentId présent ≠ absent, dans les deux ordres de HLC.
    const principal = parentDeO2(principalDeplace(h(4, PC)), h(4, PC));
    expect(dansLesDeuxSens(sousO1, principal)).toEqual([
      {
        id: idValeurEcartee(CLE_PARENT_O2, h(2, SMARTPHONE)),
        motif: 'CONFLIT',
        ecartee: sousO1,
        gagnante: principal,
      },
    ]);
    const sousO1Tard = parentDeO2(deplaceSous(O1, h(5, SMARTPHONE)), h(5, SMARTPHONE));
    expect(dansLesDeuxSens(principal, sousO1Tard)).toEqual([
      {
        id: idValeurEcartee(CLE_PARENT_O2, h(4, PC)),
        motif: 'CONFLIT',
        ecartee: principal,
        gagnante: sousO1Tard,
      },
    ]);
    // Création sous O1 contre déplacement sous O3 : parents différents, malgré deux origines différentes.
    const creeeSousO1 = parentDeO2(creeSous(O1, h(1, SMARTPHONE)), h(1, SMARTPHONE));
    expect(dansLesDeuxSens(creeeSousO1, sousO3)).toHaveLength(1);
  });

  it('UT-US-017-130 intégration d’un fichier reçu : même parent, ni signalement ni « à lire », registre du plus grand HLC, les deux entrées de journal conservées ; parents différents, un signalement', () => {
    const depart = objectifCree(O3, 'O3', h(0, PC));
    const initiaux = [
      ...objectifCree(O1, 'O1', h(0, PC)),
      ...objectifCree(O2, 'O2', h(0, PC)),
      ...depart,
    ];
    const avant = creePrincipal(h(0, PC));
    const deplacement = (cible: IdObjectif, x: Hlc) => ({
      registre: parentObjectif(O3, deplaceSous(cible, x), x, { [PC]: h(0, PC) }),
      entree: changementParent(O3, avant, deplaceSous(cible, x), x),
    });
    const integrerDeux = (cibleLocale: IdObjectif, cibleRecue: IdObjectif) => {
      const locale = deplacement(cibleLocale, h(2, SMARTPHONE));
      const recue = deplacement(cibleRecue, h(3, PC));
      const etat = etatLocal({
        appareilId: SMARTPHONE,
        registres: [
          ...initiaux.filter((r) => r.cle.champ !== 'parent' || r.cle.id !== O3),
          locale.registre,
        ],
        journal: [locale.entree],
        dernierHlc: h(2, SMARTPHONE),
      });
      const fichier: ContenuFichierAppareil = {
        schemaVersion: 1,
        versionApplication: '0.1.0',
        generation: { type: 'INITIALE' },
        appareil: PC,
        registres: [
          ...initiaux.filter((r) => r.cle.champ !== 'parent' || r.cle.id !== O3),
          recue.registre,
        ],
        journal: [recue.entree],
      };
      return {
        locale,
        recue,
        plan: planifierSynchronisation(etat, signalements(), fichier, instant(t(9))),
      };
    };

    const meme = integrerDeux(O1, O1);
    expect(meme.plan.signalements).toBeUndefined();
    expect(meme.plan.plan.etatApres.registres.get(texteDeCle(meme.recue.registre.cle))).toBe(
      meme.recue.registre,
    );
    expect([...meme.plan.plan.etatApres.journal.keys()].sort()).toEqual(
      [meme.locale.entree.id, meme.recue.entree.id].sort(),
    );
    expect(meme.plan.deplacementsSansEntree).toBeUndefined();
    expect(meme.plan.plan.registresEcrits).toEqual([meme.recue.registre]);

    const differents = integrerDeux(O1, O2);
    const valeurs = differents.plan.signalements?.valeursEcartees ?? [];
    expect(valeurs).toEqual([
      {
        id: idValeurEcartee({ type: 'OBJECTIF', id: O3, champ: 'parent' }, h(2, SMARTPHONE)),
        motif: 'CONFLIT',
        ecartee: differents.locale.registre,
        gagnante: differents.recue.registre,
      },
    ]);
    expect(compterALire(new Map(valeurs.map((v) => [v.id, v])), new Map())).toBe(1);
    expect(differents.plan.plan.etatApres.journal.size).toBe(2);
  });
});

// ---- Propriétés à trois appareils (ordre de réception quelconque)

type Appareil = { readonly etat: EtatLocal; readonly signalements: Signalements };
type Deplacement = { readonly cible: IdObjectif; readonly physique: number };

const APPAREILS = [SMARTPHONE, PC, TROISIEME] as const;
const TOURS_MAX = 6;
const INITIAUX = [O1, O2, O3].flatMap((id, i) => objectifCree(id, `O${String(i + 1)}`, h(0, PC)));
const AVANT = creePrincipal(h(0, PC));

const nieme = <T>(xs: ReadonlyArray<T>, i: number): T => {
  const x = xs[i];
  if (x === undefined) throw new Error(`Appareil ${String(i)} absent`);
  return x;
};

/** Chaque appareil déplace O3 sous sa cible, sans rien savoir des autres (écritures concurrentes). */
const demarrer = (deplacements: ReadonlyArray<Deplacement>) => {
  const ecrits = deplacements.map(({ cible, physique }, i) => {
    const appareilId = nieme(APPAREILS, i);
    const x = h(physique, appareilId);
    const initial = INITIAUX.find((r) => r.cle.id === O3 && r.cle.champ === 'parent');
    const registre = parentObjectif(
      O3,
      deplaceSous(cible, x),
      x,
      contexteDeNouvelleEcriture(initial?.ecriture, appareilId),
    );
    const registres = [...INITIAUX.filter((r) => r !== initial), registre];
    const entree = changementParent(O3, AVANT, deplaceSous(cible, x), x);
    return {
      registre,
      appareil: {
        etat: etatLocal({ appareilId, registres, journal: [entree], dernierHlc: x }),
        signalements: signalements(),
      } satisfies Appareil,
    };
  });
  return { registres: ecrits.map((e) => e.registre), appareils: ecrits.map((e) => e.appareil) };
};

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

type Banc = { readonly appareils: ReadonlyArray<Appareil>; readonly aEcrit: boolean };

const integrer = (banc: Banc, d: number, s: number, physique: number): Banc => {
  const destination = nieme(banc.appareils, d);
  const resultat = planifierSynchronisation(
    destination.etat,
    destination.signalements,
    fichierDe(nieme(banc.appareils, s)),
    instant(t(physique)),
  );
  const ajouts = resultat.signalements;
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
    appareils: banc.appareils.map((a, i) => (i === d ? apres : a)),
    aEcrit: banc.aEcrit || resultat.meta.fusionNonDeposee === true,
  };
};

const PAIRES = [0, 1, 2].flatMap((d) =>
  [0, 1, 2].filter((s) => s !== d).map((s) => [d, s] as const),
);

const trie = <V>(m: ReadonlyMap<string, V>) =>
  [...m.entries()].sort(([a], [b]) => (a < b ? -1 : 1));
const photo = (a: Appareil) => ({
  registres: trie(a.etat.registres),
  journal: trie(a.etat.journal),
  valeurs: trie(a.signalements.valeursEcartees),
  lectures: trie(a.signalements.lectures),
});

const parentVise = (r: RegistreQuelconque): IdObjectif | undefined =>
  (r.ecriture.valeur as PlacementObjectif).parentId;

/** Échanges `echanges` (ordre quelconque), puis tours complets jusqu'à un tour qui n'écrit rien ; états finaux égaux. */
const converger = (
  appareils: ReadonlyArray<Appareil>,
  echanges: ReadonlyArray<number>,
): Appareil => {
  let banc: Banc = { appareils, aEcrit: false };
  let physique = 10;
  for (const e of echanges) {
    const [d, s] = nieme(PAIRES, e);
    banc = integrer(banc, d, s, (physique += 1));
  }
  for (let tours = 0; ; tours += 1) {
    expect(tours).toBeLessThanOrEqual(TOURS_MAX); // terminaison : aucun va-et-vient
    const apres = PAIRES.reduce<Banc>((acc, [d, s]) => integrer(acc, d, s, (physique += 1)), {
      appareils: banc.appareils,
      aEcrit: false,
    });
    banc = { appareils: apres.appareils, aEcrit: false };
    if (!apres.aEcrit) break;
  }
  const [premier, ...autres] = banc.appareils.map(photo);
  for (const autre of autres) expect(autre).toEqual(premier);
  return nieme(banc.appareils, 0);
};

const echanges = fc.array(fc.integer({ min: 0, max: PAIRES.length - 1 }), { maxLength: 8 });
const physiques = fc.array(fc.integer({ min: 1, max: 6 }), { minLength: 3, maxLength: 3 });
const cibles = fc.array(fc.constantFrom(O1, O2), { minLength: 3, maxLength: 3 });

const plusGrand = (registres: ReadonlyArray<RegistreQuelconque>): RegistreQuelconque =>
  registres.reduce((max, r) => (comparerHlc(r.ecriture.hlc, max.ecriture.hlc) > 0 ? r : max));

describe('DT-027 : convergence à trois appareils, ordre de réception quelconque', () => {
  it('UT-US-017-131 trois déplacements concurrents de O3 sous le même parent : aucune valeur écartée, registre du plus grand HLC, trois entrées de journal, états égaux', () => {
    fc.assert(
      fc.property(fc.constantFrom(O1, O2), physiques, echanges, (cible, ps, suite) => {
        const { registres, appareils } = demarrer(ps.map((physique) => ({ cible, physique })));
        const final = converger(appareils, suite);
        expect(final.signalements.valeursEcartees.size).toBe(0);
        expect(final.etat.registres.get(texteDeCle(nieme(registres, 0).cle))).toBe(
          final.etat.registres.get(texteDeCle(plusGrand(registres).cle)),
        );
        expect(final.etat.registres.get(texteDeCle(nieme(registres, 0).cle))?.ecriture.hlc).toEqual(
          plusGrand(registres).ecriture.hlc,
        );
        expect(final.etat.journal.size).toBe(3);
      }),
      { seed: 20261110, numRuns: 300 },
    );
  });

  it('UT-US-017-132 parents quelconques (O1 ou O2) : registre du plus grand HLC, aucun signalement entre même parent, toute valeur de parent perdue est signalée, états égaux', () => {
    fc.assert(
      fc.property(cibles, physiques, echanges, (cs, ps, suite) => {
        const { registres, appareils } = demarrer(
          cs.map((cible, i) => ({ cible, physique: ps[i] ?? 1 })),
        );
        const final = converger(appareils, suite);
        const gagnante = plusGrand(registres);
        expect(final.etat.registres.get(texteDeCle(gagnante.cle))?.ecriture.hlc).toEqual(
          gagnante.ecriture.hlc,
        );
        const valeurs: ReadonlyArray<ValeurEcartee> = [
          ...final.signalements.valeursEcartees.values(),
        ];
        const conflits = valeurs.filter(
          (v): v is Extract<ValeurEcartee, { motif: 'CONFLIT' }> => v.motif === 'CONFLIT',
        );
        expect(conflits).toHaveLength(valeurs.length); // aucun autre motif dans ce scénario
        for (const v of conflits) {
          expect(v.id).toBe(idValeurEcartee(v.ecartee.cle, v.ecartee.ecriture.hlc));
          expect(parentVise(v.ecartee)).not.toBe(parentVise(v.gagnante)); // parents différents : conflit
        }
        // Aucune perte silencieuse par valeur : un parent visé, autre que celui retenu, a au moins une entrée.
        const retenu = parentVise(gagnante);
        const perdus = registres.filter((r: RegistreQuelconque) => parentVise(r) !== retenu);
        for (const r of perdus) {
          expect(valeurs.some((v) => parentVise(v.ecartee) === parentVise(r))).toBe(true);
        }
        // Tous les parents visés identiques : aucune entrée.
        expect(perdus.length === 0 && valeurs.length > 0).toBe(false);
      }),
      { seed: 20261110, numRuns: 300 },
    );
  });
});
