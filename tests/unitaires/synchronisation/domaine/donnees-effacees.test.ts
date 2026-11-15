/**
 * Modifications perdues par un changement de génération et réinitialisation de l'espace (ST-US-017 v0.10 §6.7 n° 10,
 * n° 11 ; RG-044 b, RG-056 ; US-017 S21, S22c). UT-US-017-64.
 */
import { describe, expect, it } from 'vitest';
import type { IdTache } from '@src/commun/domaine/identifiants';
import {
  planReinitialisation,
  valeursDonneesEffacees,
} from '@src/synchronisation/domaine/donnees-effacees';
import type { Hlc } from '@src/synchronisation/domaine/hlc';
import { idLien, type CleInformation } from '@src/synchronisation/domaine/information';
import { META_INITIALE } from '@src/synchronisation/domaine/meta-synchronisation';
import { idValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import { etatLocal, registre } from '@tests/support/fabriques/etat-local';
import {
  date,
  duree,
  hlc,
  idObjectif,
  idTache,
  instant,
  PC,
  SMARTPHONE,
} from '@tests/support/valeurs';

const O1 = idObjectif(1);
const O2 = idObjectif(2);
const T1: IdTache = idTache(1);
const T2: IdTache = idTache(2);
const INSTANT = instant('2026-10-21T08:00:00.000Z');
const h = (minute: number, appareil = PC): Hlc =>
  hlc(`2026-10-21T08:${String(minute).padStart(2, '0')}:00.000Z`, 0, appareil);
const G = hlc('2026-10-21T09:00:00.000Z', 0, SMARTPHONE);

const cle = {
  intituleO1: { type: 'OBJECTIF', id: O1, champ: 'intitule' },
  delaiO1: { type: 'OBJECTIF', id: O1, champ: 'delai' },
  creationO2: { type: 'OBJECTIF', id: O2, champ: 'creation' },
  intituleO2: { type: 'OBJECTIF', id: O2, champ: 'intitule' },
  suppressionO2: { type: 'OBJECTIF', id: O2, champ: 'suppression' },
  intituleT1: { type: 'TACHE', id: T1, champ: 'intitule' },
  estimationT1: { type: 'TACHE', id: T1, champ: 'estimationInitiale' },
  lienT1O1: { type: 'LIEN_TACHE_OBJECTIF', id: idLien(T1, O1), champ: 'actif' },
  delaiT2: { type: 'TACHE', id: T2, champ: 'delai' },
} as const satisfies Record<string, CleInformation>;

const enAttente = (c: CleInformation, derniereHlc: Hlc) => ({
  cle: c,
  premiereEcriture: INSTANT,
  derniereHlc,
});

describe('valeursDonneesEffacees (ST-US-017 v0.10 §6.7 n° 10)', () => {
  it('UT-US-017-64 S21 : une entrée DONNEES_EFFACEES par information en attente, identifiant du registre écarté, génération, intitulé de l’élément de l’état effacé', () => {
    const renomme = registre(cle.intituleO1, 'Publier le guide pratique', h(5));
    const etat = etatLocal({
      appareilId: PC,
      dernierHlc: h(5),
      registres: [registre(cle.delaiO1, date('2026-12-15'), h(1, SMARTPHONE)), renomme],
      enAttente: [enAttente(cle.intituleO1, h(5))],
    });
    expect(valeursDonneesEffacees(etat, G)).toEqual([
      {
        id: idValeurEcartee(cle.intituleO1, h(5)),
        motif: 'DONNEES_EFFACEES',
        ecartee: renomme,
        generation: G,
        intituleElement: 'Publier le guide pratique',
      },
    ]);
    expect(valeursDonneesEffacees(etatLocal({ appareilId: PC }), G)).toEqual([]);
  });

  it('UT-US-017-64 exclusions : registre remplacé par une fusion (HLC différent de l’index), registre absent, champ suppression, élément supprimé ; lien : intitulé de la tâche ; ordre des clés de texte ; intitulé absent : omis', () => {
    const intituleT1 = registre(cle.intituleT1, 'Relire', h(1));
    const estimation = registre(cle.estimationT1, duree(90), h(6));
    const lien = registre(cle.lienT1O1, true, h(7));
    const delaiT2 = registre(cle.delaiT2, date('2026-11-30'), h(8));
    const etat = etatLocal({
      appareilId: PC,
      dernierHlc: h(9),
      registres: [
        intituleT1,
        estimation,
        lien,
        delaiT2,
        // Délai de O1 écrit ici (h(2)) puis remplacé par la valeur gagnante de l'autre appareil (h(3)).
        registre(cle.delaiO1, date('2027-01-31'), h(3, SMARTPHONE)),
        registre(cle.creationO2, { creeLe: INSTANT }, h(1)),
        registre(cle.intituleO2, 'Brouillon', h(4)),
        registre(cle.suppressionO2, true, h(9)),
      ],
      enAttente: [
        enAttente(cle.delaiO1, h(2)),
        enAttente(cle.intituleO2, h(4)),
        enAttente(cle.suppressionO2, h(9)),
        enAttente(cle.estimationT1, h(6)),
        enAttente(cle.lienT1O1, h(7)),
        enAttente(cle.delaiT2, h(8)),
        enAttente(cle.intituleO1, h(5)),
      ],
    });
    const resultat = valeursDonneesEffacees(etat, G);
    expect(resultat.map((v) => v.ecartee)).toEqual([lien, estimation, delaiT2]);
    expect(resultat.map((v) => v.id)).toEqual([
      idValeurEcartee(cle.lienT1O1, h(7)),
      idValeurEcartee(cle.estimationT1, h(6)),
      idValeurEcartee(cle.delaiT2, h(8)),
    ]);
    expect(resultat.map((v) => v.intituleElement)).toEqual(['Relire', 'Relire', undefined]);
    expect('intituleElement' in (resultat[2] ?? {})).toBe(false);
    expect(
      resultat.every((v) => (v.motif as string) === 'DONNEES_EFFACEES' && v.generation === G),
    ).toBe(true);
  });
});

describe('valeursDonneesEffacees, achèvement d’un « Repartir de zéro » interrompu (v0.10.1, condition C9)', () => {
  it('UT-US-017-64 condition C9 : avec posterieuresA = HLC de la génération, seules les écritures en attente strictement postérieures sont signalées (les antérieures sont perdues en connaissance de cause)', () => {
    const avant = registre(cle.intituleO1, 'Avant le choix', h(5));
    const egal = registre(cle.delaiO1, date('2026-12-20'), h(10));
    const apres = registre(cle.intituleO2, 'Après le choix', h(20));
    const generation = h(10);
    const etat = etatLocal({
      appareilId: PC,
      dernierHlc: h(20),
      registres: [avant, egal, registre(cle.creationO2, { creeLe: INSTANT }, h(2)), apres],
      enAttente: [
        enAttente(cle.intituleO1, h(5)),
        enAttente(cle.delaiO1, h(10)),
        enAttente(cle.intituleO2, h(20)),
      ],
    });
    expect(valeursDonneesEffacees(etat, generation, generation)).toEqual([
      {
        id: idValeurEcartee(cle.intituleO2, h(20)),
        motif: 'DONNEES_EFFACEES',
        ecartee: apres,
        generation,
        intituleElement: 'Après le choix',
      },
    ]);
    // Sans posterieuresA (RG-044 b sur un autre appareil) : les trois.
    expect(valeursDonneesEffacees(etat, generation)).toHaveLength(3);
  });
});

describe('planReinitialisation (ST-US-017 v0.10 §6.7 n° 11)', () => {
  it('UT-US-017-64 état vide du même appareil (version, correction d’horloge et plus grand dernierHlc conservés), plan vide, reinitialiser, méta et signalements fournis', () => {
    const etat = etatLocal({
      appareilId: PC,
      version: 7,
      dernierHlc: h(5),
      correctionHorlogeEnMs: 1500,
      registres: [registre(cle.intituleO1, 'Publier le guide', h(5))],
      enAttente: [enAttente(cle.intituleO1, h(5))],
    });
    const valeurs = valeursDonneesEffacees(etat, G);
    const meta = { ...META_INITIALE, generation: { type: 'NOUVELLE', hlc: G } } as const;
    const plan = planReinitialisation(etat, { meta, valeurs });
    expect(plan).toEqual({
      plan: {
        etatApres: etatLocal({
          appareilId: PC,
          version: 7,
          dernierHlc: h(5),
          correctionHorlogeEnMs: 1500,
        }),
        registresEcrits: [],
        evenementsAjoutes: [],
        enAttenteEcrites: [],
        enAttenteRetirees: [],
      },
      meta,
      signalements: { valeursEcartees: valeurs, lectures: [] },
      reinitialiser: true,
    });
    // « Repartir de zéro » sur cet appareil : HLC de la génération consommé, aucune valeur signalée.
    const repartir = planReinitialisation(etat, { meta, valeurs: [], dernierHlc: G });
    expect(repartir.plan.etatApres.dernierHlc).toEqual(G);
    expect(repartir.signalements).toEqual({ valeursEcartees: [], lectures: [] });
    expect(
      planReinitialisation(etat, { meta, valeurs: [], dernierHlc: h(1) }).plan.etatApres.dernierHlc,
    ).toEqual(h(5));
  });
});
