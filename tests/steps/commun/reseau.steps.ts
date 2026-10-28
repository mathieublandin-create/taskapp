/** Étapes du réseau (glossaire d'étapes §1, §3 ; ST-US-022 §12.1 n° 17, 18). */
import { Given } from '@cucumber/cucumber';
import { convertirAppareil } from '../../support/conversions';
import type { MondeDoneJuan } from '../../support/monde';

Given(
  /^(?:que )?le (smartphone|PC) est sans réseau$/,
  function (this: MondeDoneJuan, nomAppareil: string) {
    this.banc.appareil(convertirAppareil(nomAppareil)).reseau.couper();
  },
);

Given(
  /^(?:que )?le réseau du (smartphone|PC) est coupé pendant la connexion$/,
  function (this: MondeDoneJuan, nomAppareil: string) {
    this.banc.appareil(convertirAppareil(nomAppareil)).fournisseur.couperLaProchaineConnexion();
  },
);
