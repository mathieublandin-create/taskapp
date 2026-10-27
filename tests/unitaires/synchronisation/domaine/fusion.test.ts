import { describe, expect, it } from 'vitest';
import type { RegistreQuelconque } from '@src/synchronisation/domaine/ecriture';
import type { EvenementJournal } from '@src/synchronisation/domaine/evenement-journal';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import {
  fusionnerEtats,
  planifierFusion,
  type EtatFusionnable,
} from '@src/synchronisation/domaine/fusion';
import type { IdEvenement } from '@src/synchronisation/domaine/identifiant-evenement';
import type { CleTexte } from '@src/synchronisation/domaine/information';
import { etatLocal, registre, texteDeCle } from '@tests/support/fabriques/etat-local';
import {
  date,
  hlc,
  idEvenementTest,
  idOperation,
  idTache,
  instant,
  PC,
  SMARTPHONE,
} from '@tests/support/valeurs';

const T = idTache(1);
const intitule = (valeur: string, iso: string, appareil = SMARTPHONE, compteur = 0) =>
  registre({ type: 'TACHE', id: T, champ: 'intitule' }, valeur, hlc(iso, compteur, appareil));
const delai = (valeur: string, iso: string, appareil = PC) =>
  registre({ type: 'TACHE', id: T, champ: 'delai' }, date(valeur), hlc(iso, 0, appareil));
const evenement = (rang: number, iso: string, appareil = SMARTPHONE): EvenementJournal => ({
  type: 'SUPPRESSION',
  element: { type: 'TACHE', id: T },
  avant: {},
  apres: {},
  id: idEvenementTest(idOperation(rang), 0),
  hlc: hlc(iso, 0, appareil),
  instant: instant(iso),
  jour: date('2026-10-21'),
});
const etat = (
  registres: ReadonlyArray<RegistreQuelconque>,
  journal: ReadonlyArray<EvenementJournal> = [],
): EtatFusionnable => ({
  registres: new Map<CleTexte, RegistreQuelconque>(registres.map((r) => [texteDeCle(r.cle), r])),
  journal: new Map<IdEvenement, EvenementJournal>(journal.map((e) => [e.id, e])),
});
const contenu = (
  registres: ReadonlyArray<RegistreQuelconque>,
  journal: ReadonlyArray<EvenementJournal> = [],
): ContenuFichierAppareil => ({
  schemaVersion: 1,
  versionApplication: '0.1.0',
  generation: { type: 'INITIALE' },
  appareil: PC,
  registres,
  journal,
});

describe('Fusion par information (ADR-003, RG-036)', () => {
  it('UT-US-017-01 fusionnerEtats — garde l’écriture de plus grand HLC par information et toutes les informations différentes (CA-6, S09)', () => {
    const a = etat([intitule('B', '2026-10-21T08:10:00.000Z')]);
    const b = etat([
      intitule('A', '2026-10-21T08:05:00.000Z', PC),
      delai('2026-11-15', '2026-10-21T08:01:00.000Z'),
    ]);

    const fusion = fusionnerEtats(a, b);

    expect([...fusion.registres.values()]).toEqual(
      expect.arrayContaining([
        intitule('B', '2026-10-21T08:10:00.000Z'),
        delai('2026-11-15', '2026-10-21T08:01:00.000Z'),
      ]),
    );
    expect(fusion.registres.size).toBe(2);
  });

  it('UT-US-017-02 fusionnerEtats — à physique et compteur égaux, l’appareil de plus grand identifiant l’emporte (S12b, DS-11)', () => {
    const smartphone = etat([intitule('B', '2026-10-21T08:00:00.000Z', SMARTPHONE)]);
    const pc = etat([intitule('A', '2026-10-21T08:00:00.000Z', PC)]);

    expect([...fusionnerEtats(smartphone, pc).registres.values()]).toEqual([
      intitule('A', '2026-10-21T08:00:00.000Z', PC),
    ]);
    expect([...fusionnerEtats(pc, smartphone).registres.values()]).toEqual([
      intitule('A', '2026-10-21T08:00:00.000Z', PC),
    ]);
  });

  it('UT-US-017-03 fusionnerEtats — réunit les journaux par identifiant (RG-050)', () => {
    const e1 = evenement(1, '2026-10-21T08:00:00.000Z');
    const e2 = evenement(2, '2026-10-21T08:01:00.000Z', PC);

    const fusion = fusionnerEtats(etat([], [e1]), etat([], [e1, e2]));

    expect([...fusion.journal.keys()].sort()).toEqual([e1.id, e2.id].sort());
  });

  it('UT-US-017-05 planifierFusion — n’écrit que les registres gagnants et les entrées nouvelles, avance dernierHlc, ne touche pas l’index', () => {
    const local = etatLocal({
      appareilId: SMARTPHONE,
      dernierHlc: hlc('2026-10-21T08:10:00.000Z', 0, SMARTPHONE),
      registres: [intitule('B', '2026-10-21T08:10:00.000Z')],
      journal: [evenement(1, '2026-10-21T08:00:00.000Z')],
      enAttente: [
        {
          cle: { type: 'TACHE', id: T, champ: 'intitule' },
          premiereEcriture: instant('2026-10-21T08:10:00.000Z'),
          derniereHlc: hlc('2026-10-21T08:10:00.000Z', 0, SMARTPHONE),
        },
      ],
    });
    const recu = contenu(
      [
        intitule('A', '2026-10-21T08:05:00.000Z', PC),
        delai('2026-11-15', '2026-10-21T09:00:00.000Z'),
      ],
      [evenement(1, '2026-10-21T08:00:00.000Z'), evenement(2, '2026-10-21T09:00:00.000Z', PC)],
    );

    const plan = planifierFusion(local, recu);

    expect(plan.registresEcrits).toEqual([delai('2026-11-15', '2026-10-21T09:00:00.000Z')]);
    expect(plan.evenementsAjoutes).toEqual([evenement(2, '2026-10-21T09:00:00.000Z', PC)]);
    expect(plan.etatApres.dernierHlc).toEqual(hlc('2026-10-21T09:00:00.000Z', 0, PC));
    expect(plan.etatApres.enAttente).toEqual(local.enAttente);
    expect(plan.enAttenteEcrites).toEqual([]);
    expect(plan.enAttenteRetirees).toEqual([]);
  });

  it('UT-US-017-06 planifierFusion — un fichier sans rien de nouveau donne un plan vide et garde dernierHlc', () => {
    const r = intitule('B', '2026-10-21T08:10:00.000Z');
    const local = etatLocal({ appareilId: SMARTPHONE, dernierHlc: r.ecriture.hlc, registres: [r] });

    const plan = planifierFusion(local, contenu([r]));

    expect(plan.registresEcrits).toEqual([]);
    expect(plan.evenementsAjoutes).toEqual([]);
    expect(plan.etatApres.dernierHlc).toEqual(r.ecriture.hlc);
  });
});
