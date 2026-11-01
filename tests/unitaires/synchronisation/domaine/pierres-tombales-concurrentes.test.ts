/**
 * Suppressions concurrentes du même élément (ST-US-017 v0.8 §6.6 n° 3 b ; US-017 S10c ; Q-BRU-3).
 * Le registre `suppression` se fusionne par jointure : la pierre tombale de plus grand HLC est conservée, avec pour
 * contexte la jointure des connaissances de toutes les pierres tombales vues. Ainsi « aucune pierre tombale ne la
 * connaît » (n° 3, DAT §4.2.1) ne dépend plus de l'ordre d'arrivée des fichiers. UT-US-017-111 à 116.
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import { estConnue } from '@src/synchronisation/domaine/contexte-causal';
import type { RegistreQuelconque } from '@src/synchronisation/domaine/ecriture';
import type { EtatLocal } from '@src/synchronisation/domaine/etat-local';
import type { EvenementJournal } from '@src/synchronisation/domaine/evenement-journal';
import { fusionnerEtats, type EtatFusionnable } from '@src/synchronisation/domaine/fusion';
import type { Hlc } from '@src/synchronisation/domaine/hlc';
import type { IdEvenement } from '@src/synchronisation/domaine/identifiant-evenement';
import type { CleTexte } from '@src/synchronisation/domaine/information';
import { planifierSynchronisation } from '@src/synchronisation/domaine/planifier-synchronisation';
import type { Signalements } from '@src/synchronisation/domaine/signalements';
import {
  fusionnerValeursEcartees,
  idValeurEcartee,
} from '@src/synchronisation/domaine/valeurs-ecartees';
import { etatLocal, texteDeCle } from '@tests/support/fabriques/etat-local';
import {
  creationTacheRegistre,
  delaiTache,
  h,
  intituleTache,
  signalements,
  suppressionTache,
  t,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { hlc, idTache, instant, PC, SMARTPHONE, TROISIEME } from '@tests/support/valeurs';

const T1 = idTache(1);
const CLE_SUPPRESSION = texteDeCle({ type: 'TACHE', id: T1, champ: 'suppression' });

// ---- Écritures de S10c (Contexte : « Plan » créée sur le PC, connue des deux appareils)
const creation = creationTacheRegistre(T1, h(0, PC));
const plan = intituleTache(T1, 'Plan', h(0, PC));
/** R : renommage « Plan » → « A » sur le PC (contexte vide : la valeur remplacée est du PC lui-même). */
const renommage = intituleTache(T1, 'A', h(1, PC));
/** P : suppression sur le PC, qui connaît R (même appareil ; contexte de pierre tombale sans l'auteur). */
const suppressionPc = suppressionTache(T1, h(2, PC));
/** S : suppression sur le smartphone, plus récente, qui connaît la création et « Plan », pas R. */
const suppressionSmartphone = suppressionTache(T1, h(3, SMARTPHONE), { [PC]: h(0, PC) });
/** S' : S jointe à P (n° 3 b) : HLC et valeur de S, contexte = { PC : HLC de P } (S ⊔ P, sans l'auteur de S). */
const suppressionJointe = suppressionTache(T1, h(3, SMARTPHONE), { [PC]: h(2, PC) });

type Appareil = { readonly etat: EtatLocal; readonly signalements: Signalements };

const appareil = (
  appareilId: IdAppareil,
  registres: ReadonlyArray<RegistreQuelconque>,
  dernier: Hlc,
): Appareil => ({
  etat: etatLocal({ appareilId, registres, dernierHlc: dernier }),
  signalements: signalements(),
});

const pcInitial = (): Appareil =>
  appareil(PC, [creation, plan, renommage, suppressionPc], h(2, PC));
const smartphoneInitial = (): Appareil =>
  appareil(SMARTPHONE, [creation, plan, suppressionSmartphone], h(3, SMARTPHONE));

/** Fichier d'appareil : état complet (registres, journal) et signalements, comme `contenuAEnvoyer` (§5.2). */
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

type Passe = {
  readonly destination: Appareil;
  readonly constatees: number;
  readonly plan: ReturnType<typeof planifierSynchronisation>;
};

/** Une passe : `destination` intègre le fichier de `source` (§6.6 n° 11), signalements écrits appliqués. */
const integrer = (destination: Appareil, source: Appareil): Passe => {
  const resultat = planifierSynchronisation(
    destination.etat,
    destination.signalements,
    fichierDe(source),
    instant(t(5)),
  );
  const ajoutees = resultat.signalements?.valeursEcartees ?? [];
  return {
    destination: {
      etat: resultat.plan.etatApres,
      signalements: {
        valeursEcartees: fusionnerValeursEcartees(
          destination.signalements.valeursEcartees,
          ajoutees,
        ),
        lectures: destination.signalements.lectures,
      },
    },
    constatees: ajoutees.length,
    plan: resultat,
  };
};

const registresTries = (a: Appareil) =>
  [...a.etat.registres.entries()].sort(([x], [y]) => (x < y ? -1 : x > y ? 1 : 0));

const attendreConvergenceSansSignalement = (pc: Appareil, smartphone: Appareil) => {
  expect(pc.signalements.valeursEcartees.size).toBe(0);
  expect(smartphone.signalements.valeursEcartees.size).toBe(0);
  expect(pc.etat.registres.get(CLE_SUPPRESSION)).toEqual(suppressionJointe);
  expect(smartphone.etat.registres.get(CLE_SUPPRESSION)).toEqual(suppressionJointe);
  expect(registresTries(pc)).toEqual(registresTries(smartphone));
};

describe('Suppressions concurrentes du même élément (ST-US-017 v0.8 §6.6 n° 3 b, S10c)', () => {
  it('UT-US-017-111 S10c, le smartphone fusionne en premier (trace de Bruce, Q-BRU-3) : aucune valeur écartée aux trois passes', () => {
    const passe1 = integrer(smartphoneInitial(), pcInitial());
    expect(passe1.constatees).toBe(0);
    const passe2 = integrer(pcInitial(), passe1.destination);
    expect(passe2.constatees).toBe(0);
    const passe3 = integrer(passe1.destination, passe2.destination);
    expect(passe3.constatees).toBe(0);
    attendreConvergenceSansSignalement(passe2.destination, passe3.destination);
  });

  it('UT-US-017-112 S10c, le PC fusionne en premier : aucune valeur écartée aux trois passes', () => {
    const passe1 = integrer(pcInitial(), smartphoneInitial());
    expect(passe1.constatees).toBe(0);
    const passe2 = integrer(smartphoneInitial(), passe1.destination);
    expect(passe2.constatees).toBe(0);
    const passe3 = integrer(passe1.destination, passe2.destination);
    expect(passe3.constatees).toBe(0);
    attendreConvergenceSansSignalement(passe3.destination, passe2.destination);
  });

  it('UT-US-017-113 jointure : registre écrit (contexte enrichi, HLC égal compris), dépôt demandé, puis plus rien (pas de va-et-vient)', () => {
    // Le PC (P) reçoit S : S l'emporte, écrite jointe (S'), pas telle que reçue.
    const pc = integrer(pcInitial(), smartphoneInitial());
    expect(pc.plan.plan.registresEcrits).toEqual([suppressionJointe]);
    expect(pc.plan.meta).toEqual({ fusionNonDeposee: true });
    // Le smartphone (S) reçoit R et S' : même HLC, contexte plus grand → S' écrite (R aussi, nouvelle).
    const smartphone = integrer(smartphoneInitial(), pc.destination);
    expect(smartphone.plan.plan.registresEcrits).toEqual([renommage, suppressionJointe]);
    expect(smartphone.plan.meta).toEqual({ fusionNonDeposee: true });
    expect(smartphone.plan.plan.etatApres.dernierHlc).toEqual(h(3, SMARTPHONE));
    // Le PC (S') reçoit S' : rien.
    const retour = integrer(pc.destination, smartphone.destination);
    expect(retour.plan.plan.registresEcrits).toEqual([]);
    expect(retour.plan.meta).toEqual({});
    // La pierre tombale locale gagnante reçoit une perdante qu'elle connaît déjà : rien non plus.
    const dejaJointe = appareil(SMARTPHONE, [creation, plan, suppressionJointe], h(3, SMARTPHONE));
    const sansApport = integrer(dejaJointe, pcInitial());
    expect(sansApport.plan.plan.registresEcrits).toEqual([renommage]);
    expect(sansApport.plan.plan.etatApres.registres.get(CLE_SUPPRESSION)).toBe(suppressionJointe);
  });

  it('UT-US-017-114 non-régression : un délai écrit sur un troisième appareil, connu d’aucune suppression, reste écarté, une fois, dans tous les ordres', () => {
    // Autre champ que R : pas de conflit avec le renommage du PC, seule la règle n° 3 s'applique.
    const delaiTiers = delaiTache(T1, '2026-12-01', hlc(t(1), 1, TROISIEME), { [PC]: h(0, PC) });
    const tiers = appareil(TROISIEME, [creation, plan, delaiTiers], hlc(t(1), 1, TROISIEME));
    const attendu = idValeurEcartee(
      { type: 'TACHE', id: T1, champ: 'delai' },
      delaiTiers.ecriture.hlc,
    );
    const apres = (ordre: ReadonlyArray<Appareil>): Signalements =>
      ordre.reduce(
        (smartphone, source) => integrer(smartphone, source).destination,
        smartphoneInitial(),
      ).signalements;
    for (const signale of [apres([pcInitial(), tiers]), apres([tiers, pcInitial()])]) {
      expect([...signale.valeursEcartees.keys()]).toEqual([attendu]);
      expect(signale.valeursEcartees.get(attendu)?.motif).toBe('SUPPRESSION');
    }
  });

  it('UT-US-017-115 S10c : quel que soit l’ordre de trois échanges, aucune valeur écartée, puis états égaux après échange complet', () => {
    type Sens = 'versSmartphone' | 'versPc';
    const sens: ReadonlyArray<Sens> = ['versSmartphone', 'versPc'];
    const sequences: ReadonlyArray<ReadonlyArray<Sens>> = sens.flatMap((a) =>
      sens.flatMap((b) => sens.map((c) => [a, b, c])),
    );
    const constateesPar = (sequence: ReadonlyArray<Sens>) => {
      let pc = pcInitial();
      let smartphone = smartphoneInitial();
      const constatees: Array<number> = [];
      for (const s of [...sequence, 'versSmartphone', 'versPc', 'versSmartphone'] as const) {
        const p = s === 'versSmartphone' ? integrer(smartphone, pc) : integrer(pc, smartphone);
        constatees.push(p.constatees);
        if (s === 'versSmartphone') smartphone = p.destination;
        else pc = p.destination;
      }
      return { pc, smartphone, constatees };
    };
    for (const sequence of sequences) {
      const { pc, smartphone, constatees } = constateesPar(sequence);
      expect({ sequence, constatees }).toEqual({ sequence, constatees: [0, 0, 0, 0, 0, 0] });
      attendreConvergenceSansSignalement(pc, smartphone);
    }
  });
});

// ---- Propriétés de la jointure des pierres tombales (fast-check, graine fixe)
const APPAREILS = [SMARTPHONE, PC, TROISIEME] as const;
const minute = (m: number) => `2026-10-21T08:0${String(m)}:00.000Z`;

/**
 * Pierre tombale de T1 cohérente avec la causalité : auteur `a`, minute `m` (1 à 5) ; contexte sans l'auteur, chaque
 * entrée strictement antérieure (minute < m). Deux pierres tombales de même HLC peuvent différer par leur contexte
 * (S et S' : la même suppression avant et après une jointure).
 */
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
    const id = APPAREILS[auteur] ?? SMARTPHONE;
    const contexte: Record<string, Hlc> = {};
    connus.forEach((c, i) => {
      const autre = APPAREILS[i] ?? SMARTPHONE;
      if (c !== undefined && i !== auteur && c < m) contexte[autre] = hlc(minute(c), 0, autre);
    });
    return suppressionTache(T1, hlc(minute(m), 0, id), contexte);
  });

const etatDe = (registres: ReadonlyArray<RegistreQuelconque>): EtatFusionnable => ({
  registres: new Map<CleTexte, RegistreQuelconque>(registres.map((r) => [texteDeCle(r.cle), r])),
  journal: new Map<IdEvenement, EvenementJournal>(),
});
const etatArbitraire = fc
  .option(pierreTombale, { nil: undefined })
  .map((d) => etatDe(d === undefined ? [] : [d]));
const tombale = (e: EtatFusionnable) => e.registres.get(CLE_SUPPRESSION);

describe('Jointure des pierres tombales : propriétés (ST-US-017 v0.8 §6.6 n° 3 b)', () => {
  it('UT-US-017-116 fusionnerEtats sur des pierres tombales : commutative, associative, idempotente ; la jointure connaît R si et seulement si une des pierres tombales le connaissait', () => {
    const ecriture = fc
      .record({ auteur: fc.integer({ min: 0, max: 2 }), m: fc.integer({ min: 0, max: 5 }) })
      .map(({ auteur, m }) =>
        intituleTache(T1, 'R', hlc(minute(m), 1, APPAREILS[auteur] ?? SMARTPHONE)),
      );
    fc.assert(
      fc.property(etatArbitraire, etatArbitraire, etatArbitraire, ecriture, (a, b, c, r) => {
        expect(tombale(fusionnerEtats(a, b))).toEqual(tombale(fusionnerEtats(b, a)));
        expect(tombale(fusionnerEtats(fusionnerEtats(a, b), c))).toEqual(
          tombale(fusionnerEtats(a, fusionnerEtats(b, c))),
        );
        expect(tombale(fusionnerEtats(a, a))).toEqual(tombale(a));
        const entrees = [tombale(a), tombale(b)].filter((d) => d !== undefined);
        const jointe = tombale(fusionnerEtats(a, b));
        // R antérieure à toute pierre tombale de son propre appareil (« ses propres écritures antérieures », DAT §4.2.1).
        const anterieure = entrees.every(
          (d) =>
            d.ecriture.hlc.appareil !== r.ecriture.hlc.appareil ||
            r.ecriture.hlc.physique < d.ecriture.hlc.physique,
        );
        // Hors du domaine de la propriété : vrai des deux côtés, sans condition sur l'appel d'expect.
        const pertinent = jointe !== undefined && anterieure;
        expect(pertinent && estConnue(jointe.ecriture, r.ecriture)).toBe(
          pertinent && entrees.some((d) => estConnue(d.ecriture, r.ecriture)),
        );
      }),
      { seed: 20261101, numRuns: 300 },
    );
  });
});
