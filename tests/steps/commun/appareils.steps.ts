/**
 * Étapes des appareils du banc (glossaire d'étapes §1 et §2 ; ST-socle-ecriture.md §12 n° 4 ; ST-US-022 §12.1
 * n° 3 à 6).
 */
import assert from 'node:assert/strict';
import { Given, When } from '@cucumber/cucumber';
import type { NomAppareil } from '../../support/banc/appareil-simule';
import { convertirAppareil, convertirFuseau } from '../../support/conversions';
import type { MondeDoneJuan } from '../../support/monde';

Given(
  "(que )l'application n'a jamais été utilisée sur le {appareil}",
  function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    const appareil = this.banc.appareil(nomAppareil);
    assert.equal(appareil.estOuverte(), false, `Le ${appareil.nom} a déjà été utilisé`);
  },
);

Given(
  "(que )l'application est ouverte sur le {appareil}",
  async function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    await this.banc.appareil(nomAppareil).assurerOuverte();
  },
);

const fermer = function (this: MondeDoneJuan, nomAppareil: NomAppareil): void {
  this.banc.appareil(nomAppareil).fermerApplication();
};
Given("(que )l'application est fermée sur le {appareil}", fermer);
When("l'utilisateur ferme l'application sur le {appareil}", fermer);

When(
  "l'utilisateur ouvre l'application sur le {appareil}",
  async function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    await this.banc.appareil(nomAppareil).ouvrirApplication();
  },
);

When(
  "l'utilisateur ouvre l'application sur le {appareil}, connecté au réseau",
  async function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    const appareil = this.banc.appareil(nomAppareil);
    appareil.reseau.retablir();
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

// ST-US-017 §12.1 n° 9 : les deux appareils ouverts, réseau rétabli, cycles démarrés (et attendus).
Given(
  "(que )l'application est ouverte sur le {appareil} et sur le {appareil}, connectés au réseau",
  async function (this: MondeDoneJuan, premier: NomAppareil, second: NomAppareil) {
    for (const nom of [premier, second]) {
      const appareil = this.banc.appareil(nom);
      appareil.reseau.retablir();
      await appareil.assurerOuverte();
    }
    await this.banc.attendreCycles();
  },
);
