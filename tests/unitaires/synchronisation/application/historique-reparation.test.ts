/**
 * Ordre de l'historique d'un objectif dont un placement a été annulé par la réparation RG-048 (ST-US-017 v0.6 §6.6
 * n° 9 c ; US-023 S18d : l'entrée de réparation suit immédiatement celle du placement annulé, de même HLC).
 * UT-US-017-107 (tranche B1b).
 */
import { describe, expect, it } from 'vitest';
import type { IdOperation } from '@src/commun/domaine/identifiants';
import { ServiceEtatLocalTransactionnel } from '@src/synchronisation/application/service-etat-local-transactionnel';
import type { EvenementJournal } from '@src/synchronisation/domaine/evenement-journal';
import type { IdEvenement } from '@src/synchronisation/domaine/identifiant-evenement';
import { DepotLocalEnMemoire, StockageDepotEnMemoire } from '@tests/doublures/depot-local-memoire';
import { GenerateurIdentifiantsSequentiel } from '@tests/doublures/generateur-identifiants-sequentiel';
import { HorlogeSimulee } from '@tests/doublures/horloge-simulee';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { valeurDe } from '@tests/support/environnement';
import { etatLocal } from '@tests/support/fabriques/etat-local';
import {
  changementParent,
  creePrincipal,
  deplaceSous,
  h,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import {
  date,
  idEvenementTest,
  idObjectif,
  idOperation,
  instant,
  PC,
  SMARTPHONE,
} from '@tests/support/valeurs';

const ALPHA = idObjectif(1);
const BETA = idObjectif(2);
const GAMMA = idObjectif(3);
/** Opération dont l'identifiant suit, dans l'ordre ordinal, tout identifiant de réparation commençant par « 0 ». */
const OPERATION_TARDIVE = 'ffffffff-0000-7000-80c0-000000000005' as IdOperation;

describe('Historique et réparation RG-048 (ST-US-017 v0.6 §6.6 n° 9 c)', () => {
  it('UT-US-017-107 lireJournal : à HLC égal, l’entrée de réparation suit l’entrée du placement annulé, même si son identifiant la précède dans l’ordre ordinal', async () => {
    // Identifiants choisis pour que l'ordre ordinal seul donne le mauvais ordre : « 000… » < « fff…:0 ».
    const creation: EvenementJournal = {
      id: idEvenementTest(idOperation(9), 0),
      type: 'CREATION',
      element: { type: 'OBJECTIF', id: ALPHA },
      avant: {},
      apres: {},
      hlc: h(0, PC),
      instant: instant('2026-10-21T08:00:00.000Z'),
      jour: date('2026-10-21'),
    };
    const placementAnnule = {
      ...changementParent(ALPHA, creePrincipal(h(0, PC)), deplaceSous(BETA, h(1, PC)), h(1, PC)),
      id: idEvenementTest(OPERATION_TARDIVE, 0),
    };
    const reparation: EvenementJournal = {
      id: '0'.repeat(52) as IdEvenement,
      type: 'CHANGEMENT_PARENT',
      element: { type: 'OBJECTIF', id: ALPHA },
      avant: deplaceSous(BETA, h(1, PC)),
      apres: creePrincipal(h(0, PC)),
      hlc: h(1, PC),
      instant: placementAnnule.instant,
      jour: placementAnnule.jour,
    };
    const ensuite = {
      ...changementParent(
        ALPHA,
        creePrincipal(h(0, PC)),
        deplaceSous(GAMMA, h(4, SMARTPHONE)),
        h(4, SMARTPHONE),
      ),
      id: idEvenementTest(idOperation(1), 0),
    };
    const autreObjectif = changementParent(
      BETA,
      creePrincipal(h(0, PC)),
      deplaceSous(ALPHA, h(2, SMARTPHONE)),
      h(2, SMARTPHONE),
    );

    const stockage = new StockageDepotEnMemoire(SMARTPHONE);
    stockage.etat = etatLocal({
      appareilId: SMARTPHONE,
      journal: [ensuite, reparation, autreObjectif, placementAnnule, creation],
    });
    const service = new ServiceEtatLocalTransactionnel({
      depot: new DepotLocalEnMemoire(stockage),
      horloge: new HorlogeSimulee(new TempsSimule(instant('2026-10-23T08:00:00.000Z'))),
      generateur: new GenerateurIdentifiantsSequentiel(),
    });

    expect(valeurDe(await service.lireJournal({ type: 'OBJECTIF', id: ALPHA }))).toStrictEqual([
      creation,
      placementAnnule,
      reparation,
      ensuite,
    ]);
  });
});
