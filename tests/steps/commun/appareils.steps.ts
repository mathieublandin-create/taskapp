/**
 * Étapes des appareils du banc (glossaire d'étapes §1 et §2 ; ST-socle-ecriture.md §12 n° 4 ; ST-US-022 §12.1
 * n° 3 à 5).
 */
import assert from 'node:assert/strict';
import { Given, When } from '@cucumber/cucumber';
import { convertirAppareil, convertirFuseau } from '../../support/conversions';
import type { MondeDoneJuan } from '../../support/monde';

Given(
  /^(?:que )?l'application n'a jamais été utilisée sur le (smartphone|PC)$/,
  function (this: MondeDoneJuan, nomAppareil: string) {
    const appareil = this.banc.appareil(convertirAppareil(nomAppareil));
    assert.equal(appareil.estOuverte(), false, `Le ${appareil.nom} a déjà été utilisé`);
  },
);

When(
  /^l'utilisateur ouvre l'application sur le (smartphone|PC)(, connecté au réseau)?$/,
  async function (this: MondeDoneJuan, nomAppareil: string, connecte: string | undefined) {
    const appareil = this.banc.appareil(convertirAppareil(nomAppareil));
    if (connecte !== undefined) appareil.reseau.retablir();
    await appareil.ouvrirApplication();
  },
);

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
