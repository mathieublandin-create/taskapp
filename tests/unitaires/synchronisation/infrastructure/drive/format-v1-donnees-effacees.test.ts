/**
 * Entrée DONNEES_EFFACEES et manifeste daté d'une restauration dans le format Drive, schéma 1 (ST-US-017 v0.10 §5.2,
 * §6.7 n° 10) : aller-retour avec `intituleElement` et la génération, sans changer `schemaVersion`. UT-US-017-73.
 */
import { describe, expect, it } from 'vitest';
import { succes } from '@src/commun/domaine/resultat';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import {
  decoderFichierAppareil,
  decoderManifeste,
  encoderFichierAppareil,
  encoderManifeste,
} from '@src/synchronisation/infrastructure/drive/format-v1';
import {
  h,
  idArbitraire,
  intituleObjectif,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { idObjectif, PC, SMARTPHONE } from '@tests/support/valeurs';

const O1 = idObjectif(1);

describe('DONNEES_EFFACEES et restauration dans le format Drive (ST-US-017 v0.10 §5.2)', () => {
  it('UT-US-017-73 aller-retour d’une entrée DONNEES_EFFACEES avec et sans intituleElement, fichier d’une génération NOUVELLE', async () => {
    const generation = h(5, SMARTPHONE);
    const contenu: ContenuFichierAppareil = {
      schemaVersion: 1,
      versionApplication: '0.1.0',
      generation: { type: 'NOUVELLE', hlc: generation },
      appareil: PC,
      registres: [],
      journal: [],
      valeursEcartees: [
        {
          id: idArbitraire(1),
          motif: 'DONNEES_EFFACEES',
          ecartee: intituleObjectif(O1, 'Publier le guide pratique', h(1, PC)),
          generation,
          intituleElement: 'Publier le guide pratique',
        },
        {
          id: idArbitraire(2),
          motif: 'DONNEES_EFFACEES',
          ecartee: intituleObjectif(idObjectif(2), 'Sans titre connu', h(2, PC)),
          generation,
        },
      ],
    };
    const decode = await decoderFichierAppareil(await encoderFichierAppareil(contenu));
    expect(decode).toEqual(succes(contenu));
    expect(
      decode.ok &&
        decode.valeur.valeursEcartees?.[1] !== undefined &&
        'intituleElement' in decode.valeur.valeursEcartees[1],
    ).toBe(false);
  });

  it('UT-US-017-73 manifeste d’une génération NOUVELLE avec restauration : aller-retour', async () => {
    const manifeste = {
      schemaVersion: 1,
      generation: { type: 'NOUVELLE', hlc: h(5, SMARTPHONE) },
      restauration: h(7, PC),
    } as const;
    expect(await decoderManifeste(await encoderManifeste(manifeste))).toEqual(succes(manifeste));
  });
});
