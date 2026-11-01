/**
 * Tests complémentaires de Bruce, tranche B1b (ST-US-017 v0.6 §6.6 n° 8, 9 b, 11 d ; §14 ; DAT v0.11.8 §4.2,
 * conditions C1 à C4 de Starck, Q-ST017-STA-5) : entrées de réparation identiques sur deux et trois appareils après
 * échange dans un ordre quelconque (fast-check, graine fixe), jamais deux contenus pour un même identifiant ; ni index
 * des écritures en attente ni `dernierHlc` modifiés par elles ; entrée du déplacement absente signalée.
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { IdAppareil, IdObjectif } from '@src/commun/domaine/identifiants';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import {
  entreeDeReparation,
  estIdEvenementDeReparation,
  idEvenementDeReparation,
} from '@src/synchronisation/domaine/entree-reparation';
import type { EtatLocal } from '@src/synchronisation/domaine/etat-local';
import type { EvenementJournal } from '@src/synchronisation/domaine/evenement-journal';
import type { IdEvenement } from '@src/synchronisation/domaine/identifiant-evenement';
import { planifierSynchronisation } from '@src/synchronisation/domaine/planifier-synchronisation';
import { reparerHierarchie } from '@src/synchronisation/domaine/reparation-hierarchie';
import { etatLocal } from '@tests/support/fabriques/etat-local';
import {
  changementParent,
  creePrincipal,
  deplaceSous,
  h,
  objectifCree,
  parentObjectif,
  signalements,
  t,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { idObjectif, instant, PC, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

const OBJECTIFS = [1, 2, 3, 4].map(idObjectif);
const CREATIONS = OBJECTIFS.flatMap((id, i) => objectifCree(id, `O${String(i)}`, h(0, PC)));

const fichier = (etat: EtatLocal): ContenuFichierAppareil => ({
  schemaVersion: 1,
  versionApplication: '0.1.0',
  generation: { type: 'INITIALE' },
  appareil: etat.appareilId,
  registres: [...etat.registres.values()],
  journal: [...etat.journal.values()],
});

const entreesDeReparation = (etat: EtatLocal): ReadonlyMap<IdEvenement, EvenementJournal> =>
  new Map([...etat.journal].filter(([id]) => estIdEvenementDeReparation(id)));

/** Parent effectif de chaque objectif (RG-047 dérivée), d'après les registres `parent` seuls (condition C1). */
const hierarchieValide = (etat: EtatLocal): boolean => {
  const parents = new Map<IdObjectif, IdObjectif | undefined>();
  for (const r of etat.registres.values()) {
    if (r.cle.type === 'OBJECTIF' && r.cle.champ === 'parent') {
      parents.set(r.cle.id, (r.ecriture.valeur as { parentId?: IdObjectif }).parentId);
    }
  }
  return [...parents.values()].every((p) => p === undefined || parents.get(p) === undefined);
};

/** Placement facultatif de chaque objectif par un appareil : parent (indice) et instant. */
const placementsArbitraires = fc.array(
  fc.option(
    fc.record({ parent: fc.integer({ min: 0, max: 3 }), n: fc.integer({ min: 1, max: 5 }) }),
    {
      nil: undefined,
    },
  ),
  { minLength: 4, maxLength: 4 },
);

/** État initial d'un appareil : créations communes, ses propres déplacements (registre et entrée de journal). */
const appareilInitial = (
  appareil: IdAppareil,
  placements: ReadonlyArray<{ readonly parent: number; readonly n: number } | undefined>,
): EtatLocal => {
  const deplacements = placements.flatMap((p, i) => {
    const id = OBJECTIFS[i];
    const parentId = OBJECTIFS[p?.parent ?? 0];
    if (p === undefined || id === undefined || parentId === undefined || parentId === id) return [];
    const x = h(p.n, appareil, i);
    return [
      {
        registre: parentObjectif(id, deplaceSous(parentId, x), x),
        evenement: changementParent(id, creePrincipal(h(0, PC)), deplaceSous(parentId, x), x),
      },
    ];
  });
  return etatLocal({
    appareilId: appareil,
    dernierHlc: h(6, appareil),
    registres: [...CREATIONS, ...deplacements.map((d) => d.registre)],
    journal: deplacements.map((d) => d.evenement),
  });
};

/**
 * Échanges `ordre` (récepteur, émetteur), puis trois tours complets ; vérifie qu'aucun identifiant d'entrée de
 * réparation ne reçoit jamais deux contenus (dans aucun plan, sur aucun appareil) ; rend les états finaux.
 */
const echanger = (
  appareils: ReadonlyArray<IdAppareil>,
  placements: ReadonlyArray<
    ReadonlyArray<{ readonly parent: number; readonly n: number } | undefined>
  >,
  ordre: ReadonlyArray<readonly [number, number]>,
): ReadonlyArray<EtatLocal> => {
  const etats = appareils.map((a, i) => appareilInitial(a, placements[i] ?? []));
  const tour = appareils.flatMap((_, r) =>
    appareils.flatMap((__, e) => (r === e ? [] : [[r, e] as const])),
  );
  const vues = new Map<IdEvenement, EvenementJournal>();
  let pas = 10;
  for (const [r, e] of [...ordre, ...tour, ...tour, ...tour]) {
    const recepteur = etats[r % etats.length];
    const emetteur = etats[e % etats.length];
    if (recepteur === undefined || emetteur === undefined || recepteur === emetteur) continue;
    pas += 1;
    const { plan } = planifierSynchronisation(
      recepteur,
      signalements(),
      fichier(emetteur),
      instant(t(pas)),
    );
    for (const entree of plan.evenementsAjoutes.filter((x) => estIdEvenementDeReparation(x.id))) {
      const deja = vues.get(entree.id);
      if (deja === undefined) vues.set(entree.id, entree);
      else expect(entree).toStrictEqual(deja);
    }
    etats[r % etats.length] = plan.etatApres;
  }
  return etats;
};

const ordreArbitraire = (n: number) =>
  fc.array(fc.tuple(fc.integer({ min: 0, max: n - 1 }), fc.integer({ min: 0, max: n - 1 })), {
    maxLength: 8,
  });

const verifierConvergence = (etats: ReadonlyArray<EtatLocal>): void => {
  const [premier, ...autres] = etats.map(entreesDeReparation);
  for (const etat of etats) expect(hierarchieValide(etat)).toBe(true);
  for (const autre of autres) {
    expect([...autre.keys()].sort()).toEqual([...(premier ?? new Map()).keys()].sort());
    for (const [id, entree] of autre) expect(entree).toStrictEqual(premier?.get(id));
  }
};

describe('Entrées de réparation : convergence (DAT v0.11.8 §4.2, conditions C3 et C1)', () => {
  it('UT-COMP-US-017-2-12 deux appareils, échanges dans un ordre quelconque : mêmes entrées de réparation, même contenu', () => {
    fc.assert(
      fc.property(
        placementsArbitraires,
        placementsArbitraires,
        ordreArbitraire(2),
        (surLeSmartphone, surLePc, ordre) => {
          verifierConvergence(echanger([SMARTPHONE, PC], [surLeSmartphone, surLePc], ordre));
        },
      ),
    );
  });

  it('UT-COMP-US-017-2-13 trois appareils, échanges dans un ordre quelconque : même ensemble final, jamais deux contenus pour un identifiant', () => {
    fc.assert(
      fc.property(
        placementsArbitraires,
        placementsArbitraires,
        placementsArbitraires,
        ordreArbitraire(3),
        (a, b, c, ordre) => {
          verifierConvergence(echanger([SMARTPHONE, PC, TROISIEME], [a, b, c], ordre));
        },
      ),
    );
  });
});

describe('Entrées de réparation : index, dernierHlc et entrée du déplacement absente (conditions C4 et C2)', () => {
  const alpha = idObjectif(1);
  const beta = idObjectif(2);
  const sousBeta = deplaceSous(beta, h(1, PC));
  const sousAlpha = deplaceSous(alpha, h(2, SMARTPHONE));
  const etatEnCycle = (journal: ReadonlyArray<EvenementJournal>) =>
    etatLocal({
      appareilId: SMARTPHONE,
      dernierHlc: h(2, SMARTPHONE),
      registres: [
        ...CREATIONS,
        parentObjectif(alpha, sousBeta, h(1, PC)),
        parentObjectif(beta, sousAlpha, h(2, SMARTPHONE)),
      ],
      journal,
    });

  it('UT-COMP-US-017-2-14 C4 : l’entrée de réparation (HLC ancien) ne change ni l’index des écritures en attente ni dernierHlc, qui suit le registre de réparation', () => {
    const local = etatEnCycle([
      changementParent(beta, creePrincipal(h(0, PC)), sousAlpha, h(2, SMARTPHONE)),
    ]);
    const recu: ContenuFichierAppareil = {
      ...fichier(local),
      appareil: PC,
      journal: [changementParent(alpha, creePrincipal(h(0, PC)), sousBeta, h(1, PC))],
    };
    const { plan } = planifierSynchronisation(local, signalements(), recu, instant(t(1)));

    const [reparation] = plan.evenementsAjoutes.filter((e) => estIdEvenementDeReparation(e.id));
    expect(reparation?.hlc).toEqual(h(1, PC));
    expect(plan.etatApres.enAttente).toBe(local.enAttente);
    expect(plan.etatApres.dernierHlc).toEqual(plan.registresEcrits.at(-1)?.ecriture.hlc);
    expect(plan.etatApres.dernierHlc).toEqual({ ...h(2, SMARTPHONE), compteur: 1 });
  });

  it('UT-COMP-US-017-2-15 C2 et C1 : entrée du déplacement absente (seule l’entrée de réparation est connue) : repli principal, signalé par le domaine ; présente : rien de signalé', () => {
    const idReparation = idEvenementDeReparation(alpha, h(1, PC));
    // Entrée de réparation seule, de même élément et même HLC que le déplacement : si elle était prise pour l'entrée du
    // déplacement, son `avant` (sous Bêta) serait « rétabli » au lieu du principal (condition C1).
    const reparationSeule = entreeDeReparation(new Map(), {
      objectif: alpha,
      annule: sousBeta,
      retabli: sousBeta,
    });
    expect(reparationSeule.id).toBe(idReparation);
    const sansDeplacement = etatEnCycle([reparationSeule]);

    const resultat = reparerHierarchie(sansDeplacement, instant(t(3)));
    expect(resultat.registresEcrits.map((r) => [r.cle.id, r.ecriture.valeur])).toEqual([
      [alpha, creePrincipal(h(0, PC))],
    ]);
    expect(resultat.evenementsAjoutes).toEqual([]);
    expect(resultat.deplacementsSansEntree).toEqual([idReparation]);

    const plan = planifierSynchronisation(
      sansDeplacement,
      signalements(),
      { ...fichier(sansDeplacement), appareil: PC },
      instant(t(3)),
    );
    expect(plan.deplacementsSansEntree).toEqual([idReparation]);

    const avecDeplacement = etatEnCycle([
      changementParent(alpha, creePrincipal(h(0, PC)), sousBeta, h(1, PC)),
    ]);
    expect(reparerHierarchie(avecDeplacement, instant(t(3)))).not.toHaveProperty(
      'deplacementsSansEntree',
    );
    expect(
      planifierSynchronisation(
        avecDeplacement,
        signalements(),
        { ...fichier(avecDeplacement), appareil: PC },
        instant(t(3)),
      ),
    ).not.toHaveProperty('deplacementsSansEntree');
  });

  it('UT-COMP-US-017-2-16 entreeDeReparation trouve l’entrée du déplacement parmi les autres (autre objectif ou autre HLC de même nature, autre type, entrée de réparation placée avant) ; même résultat que la boucle', () => {
    const deplacement = {
      ...changementParent(alpha, creePrincipal(h(0, PC)), sousBeta, h(1, PC)),
      instant: instant('2026-10-22T07:00:00.000Z'),
    };
    const annulation = { objectif: alpha, annule: sousBeta, retabli: creePrincipal(h(0, PC)) };
    const autres: ReadonlyArray<EvenementJournal> = [
      entreeDeReparation(new Map(), { ...annulation, retabli: sousBeta }),
      changementParent(beta, creePrincipal(h(0, PC)), sousAlpha, h(1, PC)),
      changementParent(alpha, creePrincipal(h(0, PC)), sousBeta, h(1, PC, 1)),
      {
        ...changementParent(alpha, sousBeta, sousBeta, h(1, PC)),
        type: 'SUPPRESSION',
        avant: {},
        apres: {},
      },
    ];
    const etat = etatEnCycle([...autres, deplacement]);

    const entree = entreeDeReparation(etat.journal, annulation);
    expect(entree.instant).toBe(deplacement.instant);
    expect(entree.apres).toStrictEqual(creePrincipal(h(0, PC)));
    const resultat = reparerHierarchie(etatEnCycle([deplacement]), instant(t(3)));
    expect(resultat.evenementsAjoutes).toStrictEqual([entree]);
  });
});
