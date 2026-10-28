/** Étapes des modifications en attente (glossaire d'étapes §1 ; ST-US-022 §12.1 n° 30). */
import assert from 'node:assert/strict';
import { Given } from '@cucumber/cucumber';
import { convertirAppareil } from '../../support/conversions';
import type { MondeDoneJuan } from '../../support/monde';

Given(
  /^(?:qu')?aucune modification n'est en attente sur le (smartphone|PC)$/,
  async function (this: MondeDoneJuan, nomAppareil: string) {
    const application = await this.banc.appareil(convertirAppareil(nomAppareil)).assurerOuverte();
    assert.equal((await application.consulterEtat())?.enAttente, 0);
  },
);
