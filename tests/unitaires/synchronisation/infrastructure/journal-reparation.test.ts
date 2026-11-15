/**
 * Entrée de journal d'une réparation RG-048 dans la base locale et dans le fichier Drive, schéma 1 (ST-US-017 v0.6
 * §5.1, §5.2, §6.6 n° 9 d ; DAT §6.1 « Entrées produites par la fusion » : identifiant base32hex, sans « : »).
 * UT-US-017-106 (tranche B1b).
 */
import { describe, expect, it } from 'vitest';
import { succes } from '@src/commun/domaine/resultat';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import type { EvenementJournal } from '@src/synchronisation/domaine/evenement-journal';
import type { IdEvenement } from '@src/synchronisation/domaine/identifiant-evenement';
import {
  decoderFichierAppareil,
  encoderFichierAppareil,
} from '@src/synchronisation/infrastructure/drive/format-v1';
import {
  decoderEvenement,
  encoderEvenement,
} from '@src/synchronisation/infrastructure/stockage-local/schemas';
import {
  changementParent,
  creePrincipal,
  deplaceSous,
  h,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { date, idObjectif, instant, PC, SMARTPHONE } from '@tests/support/valeurs';

const ALPHA = idObjectif(1);
const BETA = idObjectif(2);

const DEPLACEMENT = changementParent(
  ALPHA,
  creePrincipal(h(0, PC)),
  deplaceSous(BETA, h(1, PC)),
  h(1, PC),
);
/** Forme d'une entrée de réparation (§6.6 n° 9 b), identifiant de 52 caractères `[0-9a-v]` écrit à la main. */
const REPARATION: EvenementJournal = {
  id: `0${'v'.repeat(50)}9` as IdEvenement,
  type: 'CHANGEMENT_PARENT',
  element: { type: 'OBJECTIF', id: ALPHA },
  avant: deplaceSous(BETA, h(1, PC)),
  apres: creePrincipal(h(0, PC)),
  hlc: h(1, PC),
  instant: instant('2026-10-22T07:00:00.000Z'),
  jour: date('2026-10-22'),
};

describe('Entrée de journal de la réparation : stockage et format (ST-US-017 v0.6 §6.6 n° 9 d)', () => {
  it('UT-US-017-106 relue sans perte dans la base locale et dans le fichier d’appareil, à côté de l’entrée du déplacement', async () => {
    expect(decoderEvenement(encoderEvenement(REPARATION))).toStrictEqual(REPARATION);

    const contenu: ContenuFichierAppareil = {
      schemaVersion: 1,
      versionApplication: '0.1.0',
      generation: { type: 'INITIALE' },
      appareil: SMARTPHONE,
      registres: [],
      journal: [DEPLACEMENT, REPARATION],
    };
    expect(await decoderFichierAppareil(await encoderFichierAppareil(contenu))).toEqual(
      succes(contenu),
    );
  });
});
