/**
 * Intégration d'un fichier reçu à l'incrément 2 (ST-US-017 v0.5 §6.6 n° 11) : détection, fusion, réparation RG-048,
 * union des valeurs écartées et des lectures reçues, dans un seul plan. UT-US-017-51.
 */
import { describe, expect, it } from 'vitest';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import { contexteDeNouvelleEcriture } from '@src/synchronisation/domaine/contexte-causal';
import type { RegistreQuelconque } from '@src/synchronisation/domaine/ecriture';
import type { EvenementJournal } from '@src/synchronisation/domaine/evenement-journal';
import type { Lecture } from '@src/synchronisation/domaine/lectures';
import { planifierSynchronisation } from '@src/synchronisation/domaine/planifier-synchronisation';
import { idValeurEcartee, type ValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import { etatLocal, registre, texteDeCle } from '@tests/support/fabriques/etat-local';
import {
  changementParent,
  creePrincipal,
  deplaceSous,
  h,
  idArbitraire,
  intituleTache,
  objectifCree,
  parentObjectif,
  signalements,
  t,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { idObjectif, idTache, instant, PC, SMARTPHONE } from '@tests/support/valeurs';

const ALPHA = idObjectif(1);
const BETA = idObjectif(2);
const T1 = idTache(1);

const fichierDuPc = (
  registres: ReadonlyArray<RegistreQuelconque>,
  journal: ReadonlyArray<EvenementJournal> = [],
  complements: Pick<ContenuFichierAppareil, 'valeursEcartees' | 'lectures'> = {},
): ContenuFichierAppareil => ({
  schemaVersion: 1,
  versionApplication: '0.1.0',
  generation: { type: 'INITIALE' },
  appareil: PC,
  registres,
  journal,
  ...complements,
});

describe('planifierSynchronisation (ST-US-017 v0.5 §6.6 n° 11)', () => {
  it('UT-US-017-51 S25 réparé dans le plan de fusion (hors index) ; S10 signalé une seule fois ; signalements reçus unis ; rien de nouveau : rien', () => {
    // S25 vu du smartphone : Bêta placé sous Alpha (t2, en attente) ; le fichier du PC place Alpha sous Bêta (t1).
    const crees = [
      ...objectifCree(ALPHA, 'Alpha', h(0, PC)),
      ...objectifCree(BETA, 'Bêta', h(0, PC)),
    ];
    const alphaSousBeta = parentObjectif(ALPHA, deplaceSous(BETA, h(1, PC)), h(1, PC));
    const betaSousAlpha = parentObjectif(
      BETA,
      deplaceSous(ALPHA, h(2, SMARTPHONE)),
      h(2, SMARTPHONE),
      {
        [PC]: h(0, PC),
      },
    );
    const journalPc = changementParent(
      ALPHA,
      creePrincipal(h(0, PC)),
      deplaceSous(BETA, h(1, PC)),
      h(1, PC),
    );
    const journalSmartphone = changementParent(
      BETA,
      creePrincipal(h(0, PC)),
      deplaceSous(ALPHA, h(2, SMARTPHONE)),
      h(2, SMARTPHONE),
    );
    const enAttente = {
      cle: betaSousAlpha.cle,
      premiereEcriture: instant(t(2)),
      derniereHlc: h(2, SMARTPHONE),
    };
    const smartphone = etatLocal({
      appareilId: SMARTPHONE,
      dernierHlc: h(2, SMARTPHONE),
      registres: [...crees, betaSousAlpha],
      journal: [journalSmartphone],
      enAttente: [enAttente],
    });

    const s25 = planifierSynchronisation(
      smartphone,
      signalements(),
      fichierDuPc([...crees, alphaSousBeta], [journalPc]),
      instant(t(3)),
    );

    const retabli = registre(
      { type: 'OBJECTIF', id: ALPHA, champ: 'parent' },
      creePrincipal(h(0, PC)),
      h(3, SMARTPHONE),
      contexteDeNouvelleEcriture(alphaSousBeta.ecriture, SMARTPHONE),
    );
    expect(s25.plan.registresEcrits).toEqual([retabli]);
    expect(s25.plan.evenementsAjoutes).toEqual([journalPc]);
    expect(s25.plan.etatApres.registres.get(texteDeCle(retabli.cle))).toEqual(retabli);
    expect(s25.plan.etatApres.registres.get(texteDeCle(betaSousAlpha.cle))).toEqual(betaSousAlpha);
    expect(s25.plan.etatApres.dernierHlc).toEqual(h(3, SMARTPHONE));
    expect(s25.plan.etatApres.enAttente).toEqual(smartphone.enAttente);
    expect(s25.plan.enAttenteEcrites).toEqual([]);
    expect(s25.plan.enAttenteRetirees).toEqual([]);
    expect(s25.meta).toEqual({ fusionNonDeposee: true });
    expect(s25.signalements).toEqual({
      valeursEcartees: [
        {
          id: idValeurEcartee(alphaSousBeta.cle, h(1, PC)),
          motif: 'PLACEMENT_ANNULE',
          ecartee: alphaSousBeta,
          gagnante: retabli,
        },
      ],
      lectures: [],
    });

    // S10 vu du smartphone : « B » (t2) l’emporte sur « A » (t1, fichier du PC) ; le registre n’est pas réécrit.
    const plan = intituleTache(T1, 'Plan', h(0, PC));
    const a = intituleTache(T1, 'A', h(1, PC));
    const b = intituleTache(T1, 'B', h(2, SMARTPHONE), { [PC]: h(0, PC) });
    const etatS10 = etatLocal({
      appareilId: SMARTPHONE,
      dernierHlc: h(2, SMARTPHONE),
      registres: [b],
    });
    const conflit: ValeurEcartee = {
      id: idValeurEcartee(a.cle, a.ecriture.hlc),
      motif: 'CONFLIT',
      ecartee: a,
      gagnante: b,
    };
    const s10 = planifierSynchronisation(etatS10, signalements(), fichierDuPc([a]), instant(t(3)));
    expect(s10.plan.registresEcrits).toEqual([]);
    expect(s10.signalements).toEqual({ valeursEcartees: [conflit], lectures: [] });
    expect(s10.meta).toEqual({ fusionNonDeposee: true });

    // Le même fichier, l’entrée étant déjà connue : rien à écrire.
    const deja = planifierSynchronisation(
      etatS10,
      signalements([conflit]),
      fichierDuPc([a]),
      instant(t(3)),
    );
    expect(deja.plan.registresEcrits).toEqual([]);
    expect(deja.plan.evenementsAjoutes).toEqual([]);
    expect(deja.signalements ?? { valeursEcartees: [], lectures: [] }).toEqual({
      valeursEcartees: [],
      lectures: [],
    });
    expect(deja.meta).toEqual({});

    // Valeurs écartées et lectures reçues dans le fichier : unies aux signalements locaux, puis à déposer.
    const recue: ValeurEcartee = { ...conflit, id: idArbitraire(7) };
    const lecture: Lecture = { id: idArbitraire(7), hlc: h(4, PC) };
    const recus = planifierSynchronisation(
      etatLocal({ appareilId: SMARTPHONE, dernierHlc: h(0, PC), registres: [plan] }),
      signalements(),
      fichierDuPc([plan], [], { valeursEcartees: [recue], lectures: [lecture] }),
      instant(t(5)),
    );
    expect(recus.signalements).toEqual({ valeursEcartees: [recue], lectures: [lecture] });
    expect(recus.meta).toEqual({ fusionNonDeposee: true });
  });
});
