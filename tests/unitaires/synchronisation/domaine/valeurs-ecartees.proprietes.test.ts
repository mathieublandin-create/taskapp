/**
 * Tests complémentaires de Bruce, tranche B1 (ST-US-017 v0.5 §14 ; DAT v0.11.7 §4.2.1) : vecteurs du NIST et
 * comparaison avec crypto.subtle, ordre total de l'union, propriétés de l'union et des lectures, symétrie de la
 * détection, validité et convergence de la réparation RG-048, garde de terminaison.
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { IdAppareil, IdObjectif } from '@src/commun/domaine/identifiants';
import { condensatSha256 } from '@src/synchronisation/domaine/condensat-sha256';
import type { ContexteCausal } from '@src/synchronisation/domaine/contexte-causal';
import type { RegistreQuelconque } from '@src/synchronisation/domaine/ecriture';
import type { EtatLocal } from '@src/synchronisation/domaine/etat-local';
import type { EvenementJournal } from '@src/synchronisation/domaine/evenement-journal';
import type { Hlc } from '@src/synchronisation/domaine/hlc';
import { fusionnerLectures, type Lecture } from '@src/synchronisation/domaine/lectures';
import { reparerHierarchie } from '@src/synchronisation/domaine/reparation-hierarchie';
import {
  detecterValeursEcartees,
  fusionnerValeursEcartees,
  type IdValeurEcartee,
  type ValeurEcartee,
} from '@src/synchronisation/domaine/valeurs-ecartees';
import { etatLocal, registre, texteDeCle } from '@tests/support/fabriques/etat-local';
import {
  changementParent,
  creePrincipal,
  creationTacheRegistre,
  deplaceSous,
  delaiTache,
  etatFusionnable,
  h,
  idArbitraire,
  intituleTache,
  lien,
  objectifCree,
  parentObjectif,
  suppressionObjectif,
  suppressionTache,
  t,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { idObjectif, idTache, instant, PC, SMARTPHONE } from '@tests/support/valeurs';

const T1 = idTache(1);
const T2 = idTache(2);
const O1 = idObjectif(1);
const hex = (octets: Uint8Array): string =>
  [...octets].map((o) => o.toString(16).padStart(2, '0')).join('');
const reference = async (octets: Uint8Array<ArrayBuffer>): Promise<string> =>
  hex(new Uint8Array(await crypto.subtle.digest('SHA-256', octets)));
const ascii = (texte: string): Uint8Array<ArrayBuffer> => new TextEncoder().encode(texte);

describe('condensatSha256 (DAT v0.11.7 §4.2.1 : vecteurs du NIST, comparaison avec crypto.subtle)', () => {
  it('UT-COMP-US-017-2-01 vecteurs FIPS 180-4 de 448 et 896 bits, longueurs 55, 56, 63, 64 et 65 octets', async () => {
    expect(
      hex(condensatSha256(ascii('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'))),
    ).toBe('248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1');
    const bits896 =
      'abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu';
    expect(hex(condensatSha256(ascii(bits896)))).toBe(
      'cf5b16a778af8380036ce59e7b0492370b249b11e8f07a51afac45037afee9d1',
    );
    for (const longueur of [55, 56, 63, 64, 65, 119, 120]) {
      const octets = ascii('a'.repeat(longueur));
      expect(hex(condensatSha256(octets))).toBe(await reference(octets));
    }
  });

  it('UT-COMP-US-017-2-02 égal à crypto.subtle sur des entrées aléatoires', async () => {
    await fc.assert(
      fc.asyncProperty(fc.uint8Array({ maxLength: 300 }), async (octets) => {
        const copie = new Uint8Array(octets);
        expect(hex(condensatSha256(copie))).toBe(await reference(copie));
      }),
    );
  });
});

// ---- Union : ordre total (DAT v0.11.7 §4.2.1) et propriétés
const ecarteeA = intituleTache(T1, 'A', h(1, PC));
const entreeArbitraire: fc.Arbitrary<ValeurEcartee> = fc
  .record({
    id: fc.integer({ min: 1, max: 3 }),
    gagnant: fc.integer({ min: 2, max: 4 }),
    valeurEcartee: fc.constantFrom('A', 'B'),
    motif: fc.constantFrom('CONFLIT', 'SUPPRESSION', 'PLACEMENT_ANNULE', 'DONNEES_EFFACEES'),
    intitule: fc.option(fc.constantFrom('X', 'Y'), { nil: undefined }),
  })
  .map(({ id, gagnant, valeurEcartee, motif, intitule }): ValeurEcartee => {
    const commun = { id: idArbitraire(id), ecartee: intituleTache(T1, valeurEcartee, h(1, PC)) };
    const gagnante = intituleTache(T1, 'G', h(gagnant, SMARTPHONE));
    switch (motif) {
      case 'SUPPRESSION':
        return {
          ...commun,
          motif,
          gagnante,
          ...(intitule === undefined ? {} : { intituleElement: intitule }),
        };
      case 'DONNEES_EFFACEES':
        return { ...commun, motif, generation: h(gagnant, PC) };
      case 'CONFLIT':
      case 'PLACEMENT_ANNULE':
        return { ...commun, motif, gagnante };
    }
  });
const indexArbitraire = fc
  .array(entreeArbitraire, { maxLength: 6 })
  .map((entrees) => fusionnerValeursEcartees(new Map(), entrees));
const trie = <V>(m: ReadonlyMap<IdValeurEcartee, V>) =>
  [...m].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

describe('fusionnerValeursEcartees : ordre total (DAT v0.11.7 §4.2.1, Q-ST017-STA-4 c)', () => {
  it('UT-COMP-US-017-2-03 à gagnant et intitulé égaux, la plus petite sérialisation canonique, dans les deux sens', () => {
    const gagnante = intituleTache(T1, 'G', h(2, SMARTPHONE));
    const parA: ValeurEcartee = {
      id: idArbitraire(1),
      motif: 'CONFLIT',
      ecartee: ecarteeA,
      gagnante,
    };
    const parB: ValeurEcartee = {
      ...parA,
      ecartee: intituleTache(T1, 'B', h(1, PC)),
    };
    const deuxSens = [
      fusionnerValeursEcartees(new Map([[parA.id, parA]]), [parB]),
      fusionnerValeursEcartees(new Map([[parB.id, parB]]), [parA]),
    ];
    expect(deuxSens.map((m) => m.get(parA.id))).toEqual([parA, parA]);

    // Intitulés différents : le plus petit ; entrée égale déjà connue : même référence conservée.
    const supprimee = suppressionTache(T1, h(2, PC));
    const x: ValeurEcartee = {
      id: idArbitraire(2),
      motif: 'SUPPRESSION',
      ecartee: ecarteeA,
      gagnante: supprimee,
      intituleElement: 'X',
    };
    const y: ValeurEcartee = { ...x, intituleElement: 'Y' };
    expect(fusionnerValeursEcartees(new Map([[y.id, y]]), [x]).get(x.id)).toBe(x);
    expect(fusionnerValeursEcartees(new Map([[x.id, x]]), [y]).get(x.id)).toBe(x);
    expect(fusionnerValeursEcartees(new Map([[x.id, x]]), [{ ...x }]).get(x.id)).toBe(x);
  });

  it('UT-COMP-US-017-2-04 union commutative, associative et idempotente, quel que soit le contenu des entrées', () => {
    fc.assert(
      fc.property(indexArbitraire, indexArbitraire, indexArbitraire, (a, b, c) => {
        expect(trie(fusionnerValeursEcartees(a, b.values()))).toEqual(
          trie(fusionnerValeursEcartees(b, a.values())),
        );
        expect(
          trie(fusionnerValeursEcartees(fusionnerValeursEcartees(a, b.values()), c.values())),
        ).toEqual(
          trie(fusionnerValeursEcartees(a, fusionnerValeursEcartees(b, c.values()).values())),
        );
        expect(trie(fusionnerValeursEcartees(a, a.values()))).toEqual(trie(a));
      }),
    );
  });

  it('UT-COMP-US-017-2-05 lectures : union commutative, associative et idempotente', () => {
    const lecture = fc
      .tuple(fc.integer({ min: 1, max: 3 }), fc.integer({ min: 0, max: 4 }), fc.boolean())
      .map(([id, n, pc]): Lecture => ({ id: idArbitraire(id), hlc: h(n, pc ? PC : SMARTPHONE) }));
    const index = fc.array(lecture, { maxLength: 5 }).map((ls) => fusionnerLectures(new Map(), ls));
    fc.assert(
      fc.property(index, index, index, (a, b, c) => {
        expect(trie(fusionnerLectures(a, b.values()))).toEqual(
          trie(fusionnerLectures(b, a.values())),
        );
        expect(trie(fusionnerLectures(fusionnerLectures(a, b.values()), c.values()))).toEqual(
          trie(fusionnerLectures(a, fusionnerLectures(b, c.values()).values())),
        );
        expect(trie(fusionnerLectures(a, a.values()))).toEqual(trie(a));
      }),
    );
  });
});

// ---- Détection : symétrie entre deux appareils (chaque état ne porte que les écritures de son appareil)
type Gabarit = { readonly n: number; readonly valeur: 0 | 1; readonly connu?: number };
const gabarit = fc.option(
  fc.record(
    {
      n: fc.integer({ min: 1, max: 4 }),
      valeur: fc.constantFrom<0 | 1>(0, 1),
      connu: fc.integer({ min: 0, max: 4 }),
    },
    { requiredKeys: ['n', 'valeur'] },
  ),
  { nil: undefined },
);
const ecrituresDe = (
  appareil: IdAppareil,
  autre: IdAppareil,
  g: ReadonlyArray<Gabarit | undefined>,
): ReadonlyArray<RegistreQuelconque> => {
  const ecritures = [
    (x: Hlc, c: ContexteCausal, v: 0 | 1) => intituleTache(T1, ['A', 'B'][v] ?? 'A', x, c),
    (x: Hlc, c: ContexteCausal, v: 0 | 1) =>
      delaiTache(T1, ['2026-11-01', '2026-11-02'][v] ?? '2026-11-01', x, c),
    (x: Hlc, c: ContexteCausal) => suppressionTache(T1, x, c),
    (x: Hlc, c: ContexteCausal) => creationTacheRegistre(T2, x, T1, c),
    (x: Hlc, c: ContexteCausal, v: 0 | 1) => lien(T2, O1, v === 1, x, c),
    (x: Hlc, c: ContexteCausal) => suppressionObjectif(O1, x, c),
  ];
  return ecritures.flatMap((ecrire, i) => {
    const e = g[i];
    if (e === undefined) return [];
    const contexte = e.connu === undefined ? {} : { [autre]: h(e.connu, autre) };
    return [ecrire(h(e.n, appareil), contexte, e.valeur)];
  });
};

/**
 * Histoire causale d'un appareil (B1c, J1) : il n'écrit rien sur un élément ni vers lui après l'avoir supprimé. Une
 * telle écriture postérieure (seul cas réel : réparation RG-048) n'est pas connue de sa pierre tombale (DAT v0.11.9
 * §4.2.1) ; elle n'est alors constatée que par l'autre appareil, et l'entrée lui revient par l'union (n° 5) : même
 * ensemble final, mais détection non symétrique (UT-COMP-US-017-2-53, 57).
 */
const causale = (g: ReadonlyArray<Gabarit | undefined>): boolean => {
  const avant = (tombe: number, ecritures: ReadonlyArray<number>) =>
    ecritures.every((i) => (g[i]?.n ?? 0) <= (g[tombe]?.n ?? Number.POSITIVE_INFINITY));
  return avant(2, [0, 1, 3]) && avant(5, [4]);
};

describe('detecterValeursEcartees : symétrie (DAT §4.2.1, « la détection ne dépend pas de l’ordre de réception »)', () => {
  it('UT-COMP-US-017-2-06 le PC recevant le fichier du smartphone constate les mêmes entrées que l’inverse (histoires causales)', () => {
    const gabarits = fc.array(gabarit, { minLength: 6, maxLength: 6 });
    fc.assert(
      fc.property(gabarits, gabarits, (gPc, gSmartphone) => {
        fc.pre(causale(gPc) && causale(gSmartphone));
        const pc = etatFusionnable(ecrituresDe(PC, SMARTPHONE, gPc));
        const smartphone = etatFusionnable(ecrituresDe(SMARTPHONE, PC, gSmartphone));
        expect(detecterValeursEcartees(pc, smartphone)).toEqual(
          detecterValeursEcartees(smartphone, pc),
        );
      }),
    );
  });

  it('UT-COMP-US-017-2-07 descriptions absentes des deux côtés : égales, non signalées ; absente contre texte : signalée', () => {
    const description = (valeur: string | undefined, x: Hlc) =>
      registre({ type: 'OBJECTIF', id: O1, champ: 'description' }, valeur, x);
    expect(
      detecterValeursEcartees(
        etatFusionnable([description(undefined, h(1, PC))]),
        etatFusionnable([description(undefined, h(2, SMARTPHONE))]),
      ),
    ).toEqual([]);
    expect(
      detecterValeursEcartees(
        etatFusionnable([description(undefined, h(1, PC))]),
        etatFusionnable([description('Texte', h(2, SMARTPHONE))]),
      ).map((v) => v.motif),
    ).toEqual(['CONFLIT']);
  });
});

describe('detecterValeursEcartees : paires examinées (ST-US-017 §6.6 n° 3)', () => {
  it('UT-COMP-US-017-2-10 pierre tombale et écriture écartée toutes deux locales (déjà constatée) : rien de plus', () => {
    const suppression = suppressionTache(T1, h(1, PC));
    const delai = delaiTache(T1, '2026-12-10', h(2, SMARTPHONE));
    const local = etatFusionnable([suppression, delai]);
    expect(
      detecterValeursEcartees(local, etatFusionnable([intituleTache(T2, 'Autre', h(3, PC))])),
    ).toEqual([]);
    expect(detecterValeursEcartees(etatFusionnable([]), local).map((v) => v.ecartee)).toEqual([
      delai,
    ]);
  });
});

// ---- Réparation RG-048 : validité et convergence pour des placements aléatoires
const OBJECTIFS = [1, 2, 3, 4].map(idObjectif);
/** Parent effectif de chaque objectif non supprimé (RG-047 dérivée), d'après les registres `parent`. */
const parentsEffectifs = (etat: EtatLocal): ReadonlyMap<IdObjectif, IdObjectif | undefined> => {
  const parents = new Map<IdObjectif, IdObjectif | undefined>();
  for (const r of etat.registres.values()) {
    if (r.cle.type === 'OBJECTIF' && r.cle.champ === 'parent') {
      parents.set(r.cle.id, (r.ecriture.valeur as { parentId?: IdObjectif }).parentId);
    }
  }
  return parents;
};
const hierarchieValide = (etat: EtatLocal): boolean => {
  const parents = parentsEffectifs(etat);
  return [...parents.values()].every((p) => p === undefined || parents.get(p) === undefined);
};
const appliquer = (etat: EtatLocal, registres: ReadonlyArray<RegistreQuelconque>): EtatLocal => ({
  ...etat,
  registres: new Map([...etat.registres, ...registres.map((r) => [texteDeCle(r.cle), r] as const)]),
});
const placementArbitraire = fc.option(
  fc.record({
    parent: fc.integer({ min: 0, max: 3 }),
    n: fc.integer({ min: 1, max: 5 }),
    pc: fc.boolean(),
  }),
  { nil: undefined },
);

describe('reparerHierarchie : propriétés (RG-048, DAT §4.2 « convergence »)', () => {
  it('UT-COMP-US-017-2-08 hiérarchie valide en sortie et même résultat sur les deux appareils, pour des placements aléatoires', () => {
    fc.assert(
      fc.property(fc.array(placementArbitraire, { minLength: 4, maxLength: 4 }), (placements) => {
        const deplacements = placements.flatMap((p, i) => {
          const id = OBJECTIFS[i];
          const parentId = OBJECTIFS[p?.parent ?? 0];
          if (p === undefined || id === undefined || parentId === undefined || parentId === id)
            return [];
          const x = h(p.n, p.pc ? PC : SMARTPHONE, i);
          return [
            {
              registre: parentObjectif(id, deplaceSous(parentId, x), x),
              evenement: changementParent(id, creePrincipal(h(0, PC)), deplaceSous(parentId, x), x),
            },
          ];
        });
        const vu = (appareil: IdAppareil) =>
          etatLocal({
            appareilId: appareil,
            dernierHlc: h(6, PC),
            registres: [
              ...OBJECTIFS.flatMap((id, i) => objectifCree(id, `O${String(i)}`, h(0, PC))),
              ...deplacements.map((d) => d.registre),
            ],
            journal: deplacements.map((d) => d.evenement),
          });
        const surSmartphone = reparerHierarchie(vu(SMARTPHONE), instant(t(7)));
        const surPc = reparerHierarchie(vu(PC), instant(t(7)));
        expect(hierarchieValide(appliquer(vu(SMARTPHONE), surSmartphone.registresEcrits))).toBe(
          true,
        );
        expect(surPc.registresEcrits.map((r) => [r.cle, r.ecriture.valeur])).toEqual(
          surSmartphone.registresEcrits.map((r) => [r.cle, r.ecriture.valeur]),
        );
        expect(surPc.valeursEcartees.map((v) => v.id)).toEqual(
          surSmartphone.valeursEcartees.map((v) => v.id),
        );
      }),
    );
  });

  it('UT-COMP-US-017-2-09 journal incohérent (valeur rétablie identique à l’annulée) : la boucle s’arrête sans exception', () => {
    const [alpha = O1, beta = O1] = OBJECTIFS;
    const sousBeta = deplaceSous(beta, h(1, PC));
    const etat = etatLocal({
      appareilId: PC,
      dernierHlc: h(2, SMARTPHONE),
      registres: [
        ...objectifCree(alpha, 'Alpha', h(0, PC)),
        ...objectifCree(beta, 'Bêta', h(0, PC)),
        parentObjectif(alpha, sousBeta, h(1, PC)),
        parentObjectif(beta, deplaceSous(alpha, h(2, SMARTPHONE)), h(2, SMARTPHONE)),
      ],
      journal: [
        changementParent(alpha, sousBeta, sousBeta, h(1, PC)),
      ] satisfies ReadonlyArray<EvenementJournal>,
    });
    const resultat = reparerHierarchie(etat, instant(t(3)));
    // Alpha « rétabli » sous Bêta (inchangé) n'est plus candidat ; Bêta, sans entrée de journal, redevient principal.
    expect(resultat.valeursEcartees.map((v) => v.ecartee.cle.id)).toEqual([alpha, beta]);
    expect(hierarchieValide(appliquer(etat, resultat.registresEcrits))).toBe(true);
  });

  it('UT-COMP-US-017-2-11 déplacements de même HLC départagés par l’identifiant ; objectif sans placement ; autres entrées du journal ignorées', () => {
    const [alpha = O1, beta = O1, gamma = O1] = OBJECTIFS;
    const x = h(1, PC);
    const autreEntree = {
      ...changementParent(gamma, creePrincipal(h(0, PC)), creePrincipal(h(0, PC)), h(0, PC)),
      type: 'SUPPRESSION',
      element: { type: 'OBJECTIF', id: gamma },
      avant: {},
      apres: {},
    } satisfies EvenementJournal;
    const etat = etatLocal({
      appareilId: PC,
      dernierHlc: x,
      registres: [
        ...objectifCree(alpha, 'Alpha', h(0, PC)),
        ...objectifCree(beta, 'Bêta', h(0, PC)),
        ...objectifCree(gamma, 'Gamma', h(0, PC)).slice(0, 1),
        parentObjectif(alpha, deplaceSous(beta, x), x),
        parentObjectif(beta, deplaceSous(alpha, x), x),
      ],
      journal: [
        autreEntree,
        changementParent(alpha, creePrincipal(h(0, PC)), deplaceSous(beta, x), x),
        changementParent(beta, creePrincipal(h(0, PC)), deplaceSous(alpha, x), x),
      ],
    });
    const resultat = reparerHierarchie(etat, instant(t(2)));
    expect(alpha < beta).toBe(true);
    expect(resultat.registresEcrits.map((r) => [r.cle.id, r.ecriture.valeur])).toEqual([
      [alpha, creePrincipal(h(0, PC))],
    ]);
  });
});
