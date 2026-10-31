/** Étapes du réseau (glossaire d'étapes §1, §3 ; ST-US-022 §12.1 n° 17, 18). */
import assert from 'node:assert/strict';
import { Given, When } from '@cucumber/cucumber';
import type { NomAppareil } from '../../support/banc/appareil-simule';
import type { MondeDoneJuan } from '../../support/monde';

Given(
  '(que )le {appareil} est sans réseau',
  function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    this.banc.appareil(nomAppareil).reseau.couper();
  },
);

Given(
  '(que )le réseau du {appareil} est coupé pendant la connexion',
  function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    this.banc.appareil(nomAppareil).fournisseur.couperLaProchaineConnexion();
  },
);

// ST-US-018 §12.1 n° 6 : la coupure survient entre `saisit…` et `termine la saisie`.
When(
  'le réseau est coupé sur le {appareil} pendant la saisie',
  function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    assert.ok(
      this.saisieSousTacheEnCours.has(nomAppareil),
      `Aucune saisie en cours sur le ${nomAppareil}`,
    );
    this.banc.appareil(nomAppareil).reseau.couper();
  },
);

// ST-US-017 §12.1 n° 5 : le réseau est rétabli, puis le cycle qu'il déclenche est attendu.
const retablirLeReseau = async function (
  this: MondeDoneJuan,
  nomAppareil: NomAppareil,
): Promise<void> {
  this.banc.appareil(nomAppareil).reseau.retablir();
  await this.banc.attendreCycles();
};

When('le réseau revient sur le {appareil}', retablirLeReseau);
When("le réseau revient sur le {appareil}, sans aucune action de l'utilisateur", retablirLeReseau);

// ST-US-017 §12.1 n° 7 : l'intermittence est portée par `l'envoi au Drive est interrompu … fois` (drive.steps.ts).
Given(
  '(que )le réseau du {appareil} est intermittent',
  async function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    await this.banc.appareil(nomAppareil).assurerOuverte();
  },
);
