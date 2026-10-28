/** Étapes des appareils du banc (glossaire d'étapes §1 et §2 ; ST-socle-ecriture.md §12 n° 4). */
import { Given } from '@cucumber/cucumber';
import { convertirAppareil, convertirFuseau } from '../../support/conversions';
import type { MondeDoneJuan } from '../../support/monde';

const FUSEAUX_ADMIS: ReadonlyArray<string> = [
  'Europe/Paris',
  'America/New_York',
  'UTC',
  'Pacific/Auckland',
];

Given(
  /^(?:que )?le (smartphone|PC) est réglé sur le fuseau "([^"]+)"$/,
  function (this: MondeDoneJuan, appareil: string, fuseau: string) {
    if (!FUSEAUX_ADMIS.includes(fuseau)) {
      throw new Error(`Fuseau non admis par le glossaire : ${fuseau}`);
    }
    this.banc
      .appareil(convertirAppareil(appareil))
      .horloge.reglerFuseauAppareil(convertirFuseau(fuseau));
  },
);
