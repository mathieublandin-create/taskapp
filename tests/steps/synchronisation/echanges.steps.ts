/** Étapes des modifications en attente (glossaire d'étapes §1 ; ST-US-022 §12.1 n° 30). */
import assert from 'node:assert/strict';
import { Given } from '@cucumber/cucumber';
import type { NomAppareil } from '../../support/banc/appareil-simule';
import type { MondeDoneJuan } from '../../support/monde';
import { creerObjectifsEnAttente } from '../../support/objectifs';
import { etapeContexte } from '../../support/prefixes';

Given(
  "(qu')aucune modification n'est en attente sur le {appareil}",
  async function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    const application = await this.banc.appareil(nomAppareil).assurerOuverte();
    assert.equal((await application.consulterEtat())?.enAttente, 0);
  },
);

// Rang 2 pour n > 0 : n objectifs sont créés, sans dépôt dans le Drive (le cycle de synchronisation date du rang 3).
// Pluriel « modification(s) » : expression régulière (conventions.md §11.6).
etapeContexte(
  /^(\d+) modifications?(?:\(s\))? (?:ne sont|n'est) pas encore enregistrées?(?:\(s\))? dans le Drive$/,
  async ({ appareil }, n) => {
    await creerObjectifsEnAttente(appareil, Number(n));
    const application = await appareil.assurerOuverte();
    assert.equal((await application.consulterEtat())?.enAttente, Number(n));
  },
);
